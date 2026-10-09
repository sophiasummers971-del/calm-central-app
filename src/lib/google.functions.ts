import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { appUserReconnectRequired, authorizeAppUserOAuth, callAsAppUser, disconnectAppUser, exchangeAppUserOAuthCode } from "@/integrations/lovable/appUserConnector";
import { deleteConnectionKeyForUser, getConnectionKeyForUser, saveConnectionKeyForUser } from "@/server/app-user-connections.server";
import { googleProducts, type GoogleConnectorId, type GoogleItem, type GoogleStatus } from "@/lib/google-config";

const GATEWAY = "https://connector-gateway.lovable.dev";
const BASE_SCOPES = ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"];
const scopesFor = (id: GoogleConnectorId) => [...BASE_SCOPES, ...(googleProducts.find((p) => p.id === id)?.scopes ?? [])];
const validateId = (input: { connectorId: string }) => {
  if (!googleProducts.some((p) => p.id === input.connectorId)) throw new Error("Unknown Google service.");
  return { connectorId: input.connectorId as GoogleConnectorId };
};
const fmtDate = (value?: string) => (value ? new Date(value).toLocaleDateString("en-GB") : "");
const fmtDateTime = (value?: string) => (value ? new Date(value).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "");

type Json = Record<string, unknown>;
const obj = (v: unknown): Json => (v && typeof v === "object" ? (v as Json) : {});
const str = (v: unknown) => (typeof v === "string" ? v : "");
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

export const startGoogleConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validateId)
  .handler(async ({ data, context }) => {
    const clientKey = process.env[`${data.connectorId.toUpperCase()}_APP_USER_CONNECTOR_CLIENT_API_KEY`];
    if (!clientKey) throw new Error("This Google service is not set up yet.");
    const request = getRequest();
    const url = new URL(request.url);
    const sandboxHost = url.hostname === "localhost" ? request.headers.get("x-forwarded-host") : null;
    const returnUrl = new URL("/api/oauth/google/return", sandboxHost ? `https://${sandboxHost}` : url.origin).toString();
    const existing = await getConnectionKeyForUser(context.userId, data.connectorId);
    return authorizeAppUserOAuth({ gatewayBaseUrl: GATEWAY, connectorId: data.connectorId, appUserId: context.userId, clientAPIKey: clientKey, returnUrl, connectionAPIKey: existing ?? undefined, credentialsConfiguration: { scopes: scopesFor(data.connectorId) } });
  });

export const completeGoogleConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { code: string; connectorId: string }) => ({ code: String(input.code), ...validateId(input) }))
  .handler(async ({ data, context }) => {
    const { connectionAPIKey, connectorId } = await exchangeAppUserOAuthCode(GATEWAY, data.code);
    if (connectorId !== data.connectorId) throw new Error("Google returned the wrong service.");
    await saveConnectionKeyForUser(context.userId, connectorId, connectionAPIKey);
    return { ok: true };
  });

export const disconnectGoogle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validateId)
  .handler(async ({ data, context }) => {
    const key = await getConnectionKeyForUser(context.userId, data.connectorId);
    if (key) await disconnectAppUser({ gatewayBaseUrl: GATEWAY, connectionAPIKey: key, connectorId: data.connectorId });
    await deleteConnectionKeyForUser(context.userId, data.connectorId);
    return { ok: true };
  });

export const getGoogleStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validateId)
  .handler(async ({ data, context }): Promise<GoogleStatus> => {
    const connectorId = data.connectorId;
    const base: GoogleStatus = { connectorId, connected: false, reconnectRequired: false, account: "", items: [] };
    const key = await getConnectionKeyForUser(context.userId, connectorId);
    if (!key) return base;
    const call = (path: string) => callAsAppUser({ gatewayBaseUrl: GATEWAY, connectionAPIKey: key, connectorId, path, requiredScopes: scopesFor(connectorId) });
    const first = connectorId === "google_mail" ? await call("/gmail/v1/users/me/messages?maxResults=10&labelIds=INBOX")
      : connectorId === "google_drive" ? await call(`/drive/v3/files?pageSize=12&orderBy=modifiedTime%20desc&fields=files(id,name,modifiedTime,webViewLink,mimeType)`)
      : await call(`/calendar/v3/calendars/primary/events?maxResults=12&singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(new Date().toISOString())}`);
    if (await appUserReconnectRequired(first)) return { ...base, reconnectRequired: true };
    if (!first.ok) return { ...base, connected: true, error: `Google could not load your data right now (${first.status}).` };
    const body = obj(await first.json());
    let items: GoogleItem[] = [];
    let account = "";
    if (connectorId === "google_mail") {
      const ids = arr(body.messages).map((m) => str(obj(m).id)).filter(Boolean).slice(0, 10);
      const details = await Promise.all(ids.map(async (id) => {
        const r = await call(`/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`);
        if (!r.ok) return null;
        const m = obj(await r.json());
        const headers = arr(obj(m.payload).headers).map(obj);
        const h = (n: string) => str(headers.find((x) => str(x.name).toLowerCase() === n)?.value);
        return { id, title: h("subject") || "(No subject)", detail: `${h("from")} · ${fmtDate(h("date"))}`, url: `https://mail.google.com/mail/u/0/#inbox/${id}` };
      }));
      items = details.filter((d): d is GoogleItem => d !== null);
      const p = await call("/gmail/v1/users/me/profile");
      if (p.ok) account = str(obj(await p.json()).emailAddress);
    } else if (connectorId === "google_drive") {
      items = arr(body.files).map(obj).map((f) => ({ id: str(f.id), title: str(f.name), detail: `Changed ${fmtDate(str(f.modifiedTime))}`, url: str(f.webViewLink) || undefined }));
      const a = await call("/drive/v3/about?fields=user(emailAddress)");
      if (a.ok) account = str(obj(obj(await a.json()).user).emailAddress);
    } else {
      items = arr(body.items).map(obj).map((e) => {
        const s = obj(e.start);
        const when = str(s.dateTime) ? fmtDateTime(str(s.dateTime)) : `${fmtDate(str(s.date))} (all day)`;
        return { id: str(e.id), title: str(e.summary) || "(No title)", detail: when, url: str(e.htmlLink) || undefined };
      });
      account = str(obj(body).summary);
    }
    return { ...base, connected: true, account, items };
  });
