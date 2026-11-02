import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  appUserReconnectRequired,
  authorizeAppUserOAuth,
  callAsAppUser,
  disconnectAppUser,
  exchangeAppUserOAuthCode,
} from "@/integrations/lovable/appUserConnector";
import {
  deleteConnectionKeyForUser,
  getConnectionKeyForUser,
  saveConnectionKeyForUser,
} from "@/server/app-user-connections.server";
import {
  googleProducts,
  type GoogleConnectorId,
  type GoogleItem,
  type GoogleStatus,
} from "@/lib/google-config";
import { formatGoogleCalendarDate, googleListPath, parseGmailBatch } from "@/lib/google-data";
import { z } from "zod";

const GATEWAY = "https://connector-gateway.lovable.dev";
const BASE_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];
const scopesFor = (id: GoogleConnectorId) => [
  ...BASE_SCOPES,
  ...(googleProducts.find((p) => p["id"] === id)?.scopes ?? []),
];
const validateId = (input: { connectorId: string }) => {
  if (!googleProducts.some((p) => p["id"] === input.connectorId))
    throw new Error("Unknown Google service.");
  return { connectorId: input.connectorId as GoogleConnectorId };
};
const fmtDate = (value?: string) => (value ? new Date(value).toLocaleDateString("en-GB") : "");
const fmtDateTime = (value?: string) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

type Json = Record<string, unknown>;
const obj = (v: unknown): Json => (v && typeof v === "object" ? (v as Json) : {});
const str = (v: unknown) => (typeof v === "string" ? v : "");
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

export const startGoogleConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validateId)
  .handler(async ({ data, context }) => {
    const clientKey =
      process.env[`${data.connectorId.toUpperCase()}_APP_USER_CONNECTOR_CLIENT_API_KEY`];
    if (!clientKey) throw new Error("This Google service is not set up yet.");
    const request = getRequest();
    const url = new URL(request.url);
    const sandboxHost =
      url.hostname === "localhost" ? request.headers.get("x-forwarded-host") : null;
    const returnUrl = new URL(
      "/api/oauth/google/return",
      sandboxHost ? `https://${sandboxHost}` : url.origin,
    ).toString();
    const existing = await getConnectionKeyForUser(context.userId, data.connectorId);
    return authorizeAppUserOAuth({
      gatewayBaseUrl: GATEWAY,
      connectorId: data.connectorId,
      appUserId: context.userId,
      clientAPIKey: clientKey,
      returnUrl,
      ...(existing ? { connectionAPIKey: existing } : {}),
      credentialsConfiguration: { scopes: scopesFor(data.connectorId) },
    });
  });

export const completeGoogleConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { code: string; connectorId: string }) => ({
    code: String(input.code),
    ...validateId(input),
  }))
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
    if (key)
      await disconnectAppUser({
        gatewayBaseUrl: GATEWAY,
        connectionAPIKey: key,
        connectorId: data.connectorId,
      });
    await deleteConnectionKeyForUser(context.userId, data.connectorId);
    return { ok: true };
  });

export const getGoogleStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        connectorId: z.enum(["google_mail", "google_drive", "google_calendar"]),
        pageToken: z.string().max(4096).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<GoogleStatus> => {
    const connectorId = data.connectorId;
    const base: GoogleStatus = {
      connectorId,
      connected: false,
      reconnectRequired: false,
      account: "",
      items: [],
    };
    const key = await getConnectionKeyForUser(context.userId, connectorId);
    if (!key) return base;
    const call = (path: string) =>
      callAsAppUser({
        gatewayBaseUrl: GATEWAY,
        connectionAPIKey: key,
        connectorId,
        path,
        requiredScopes: scopesFor(connectorId),
      });
    const first = await call(googleListPath(connectorId, data.pageToken));
    if (await appUserReconnectRequired(first)) return { ...base, reconnectRequired: true };
    if (!first.ok) {
      const errorBody = await first.text();
      console.error(`Google read failed [${first.status}]: ${errorBody}`);
      return {
        ...base,
        connected: true,
        error: `Google could not load your data (${first.status}): ${errorBody}`,
      };
    }
    const body = obj(await first.json());
    let items: GoogleItem[] = [];
    let account = "";
    if (connectorId === "google_mail") {
      const ids = arr(body["messages"])
        .map((m) => str(obj(m)["id"]))
        .filter(Boolean);
      const boundary = `gmail_${crypto.randomUUID()}`;
      const requestBody =
        ids
          .map(
            (id) =>
              `--${boundary}\r\nContent-Type: application/http\r\nContent-ID: <${id}>\r\n\r\nGET /gmail/v1/users/me/messages/${encodeURIComponent(id)}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date HTTP/1.1\r\n\r\n`,
          )
          .join("") + `--${boundary}--\r\n`;
      const parts = ids.length
        ? await (async () => {
            const response = await callAsAppUser({
              gatewayBaseUrl: GATEWAY,
              connectionAPIKey: key,
              connectorId,
              path: "/batch/gmail/v1",
              requiredScopes: scopesFor(connectorId),
              init: {
                method: "POST",
                headers: { "Content-Type": `multipart/mixed; boundary=${boundary}` },
                body: requestBody,
              },
            });
            if (await appUserReconnectRequired(response)) return null;
            const text = await response.text();
            if (!response.ok) {
              console.error(`Gmail batch failed [${response.status}]: ${text}`);
              throw new Error(`Gmail could not load messages (${response.status}): ${text}`);
            }
            return parseGmailBatch(response.headers.get("Content-Type") ?? "", text);
          })()
        : [];
      if (!parts) return { ...base, reconnectRequired: true };
      const failed = parts.filter((part) => part.status < 200 || part.status >= 300);
      if (failed.length) {
        console.error("Gmail batch parts failed", failed);
        throw new Error(
          `Gmail could not load ${failed.length} messages (${failed[0]?.status}): ${JSON.stringify(failed[0]?.body)}`,
        );
      }
      if (parts.length !== ids.length || ids.some((id) => !parts.some((part) => part.id === id)))
        throw new Error("Gmail did not return every requested message. Please refresh.");
      items = ids.map((id) => {
        const m = obj(parts.find((part) => part.id === id)?.body);
        const headers = arr(obj(m["payload"])["headers"]).map(obj);
        const h = (n: string) =>
          str(headers.find((x) => str(x["name"]).toLowerCase() === n)?.["value"]);
        return {
          id,
          title: h("subject") || "(No subject)",
          detail: `${h("from")} · ${fmtDate(h("date"))}`,
          url: `https://mail.google.com/mail/u/0/#inbox/${id}`,
        };
      });
      const p = await call("/gmail/v1/users/me/profile");
      if (p.ok) account = str(obj(await p.json())["emailAddress"]);
    } else if (connectorId === "google_drive") {
      items = arr(body["files"])
        .map(obj)
        .map((f) => ({
          id: str(f["id"]),
          title: str(f["name"]),
          detail: `Changed ${fmtDate(str(f["modifiedTime"]))}`,
          url: str(f["webViewLink"]) || undefined,
        }));
      const a = await call("/drive/v3/about?fields=user(emailAddress)");
      if (a.ok) account = str(obj(obj(await a.json())["user"])["emailAddress"]);
    } else {
      items = arr(body["items"])
        .map(obj)
        .map((e) => {
          const s = obj(e["start"]);
          const when = str(s["dateTime"])
            ? fmtDateTime(str(s["dateTime"]))
            : `${formatGoogleCalendarDate(str(s["date"]))} (all day)`;
          return {
            id: str(e["id"]),
            title: str(e["summary"]) || "(No title)",
            detail: when,
            url: str(e["htmlLink"]) || undefined,
          };
        });
      account = str(obj(body)["summary"]);
    }
    const nextPageToken = str(body["nextPageToken"]);
    return {
      ...base,
      connected: true,
      account,
      items,
      ...(nextPageToken ? { nextPageToken } : {}),
    };
  });
