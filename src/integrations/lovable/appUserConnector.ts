import { createServerOnlyFn } from "@tanstack/react-start";

const requireApiKey = createServerOnlyFn(() => {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Google connections are not configured yet.");
  return key;
});

export interface AppUserOAuthAuthorizeParams {
  gatewayBaseUrl: string;
  connectorId: string;
  appUserId: string;
  clientAPIKey: string;
  returnUrl: string;
  connectionAPIKey?: string;
  credentialsConfiguration?: Record<string, unknown>;
}

export const authorizeAppUserOAuth = createServerOnlyFn(async (params: AppUserOAuthAuthorizeParams) => {
  const headers: Record<string, string> = { Authorization: `Bearer ${requireApiKey()}`, "Content-Type": "application/json", "X-Client-Api-Key": params.clientAPIKey };
  if (params.connectionAPIKey) headers["X-Connection-Api-Key"] = params.connectionAPIKey;
  const res = await fetch(`${params.gatewayBaseUrl}/api/v1/app-users/oauth2/authorize`, { method: "POST", headers, body: JSON.stringify({ connector_id: params.connectorId, app_user_id: params.appUserId, return_url: params.returnUrl, credentials_configuration: params.credentialsConfiguration }) });
  if (!res.ok) throw new Error(`Google connection could not start (${res.status}).`);
  const body: unknown = await res.json();
  if (!body || typeof body !== "object" || !("authorization_url" in body) || typeof body.authorization_url !== "string") throw new Error("Google did not return a connection link.");
  return { authorizationUrl: body.authorization_url };
});

export interface CallAsAppUserParams { gatewayBaseUrl: string; connectionAPIKey: string; connectorId: string; path: string; init?: RequestInit; requiredScopes?: string[] }
export const callAsAppUser = createServerOnlyFn(async ({ gatewayBaseUrl, connectionAPIKey, connectorId, path, init, requiredScopes }: CallAsAppUserParams) => {
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${requireApiKey()}`);
  headers.set("X-Connection-Api-Key", connectionAPIKey);
  if (requiredScopes?.length) headers.set("X-Lovable-Required-Scopes", requiredScopes.join(" "));
  return fetch(`${gatewayBaseUrl}/${connectorId}${path.startsWith("/") ? path : `/${path}`}`, { ...init, headers });
});

export const appUserReconnectRequired = createServerOnlyFn(async (res: Response) => {
  if (res.status !== 401) return false;
  const body: unknown = await res.clone().json().catch(() => null);
  return !!body && typeof body === "object" && "type" in body && typeof body.type === "string" && body.type.startsWith("credential_");
});

export const exchangeAppUserOAuthCode = createServerOnlyFn(async (gatewayBaseUrl: string, code: string) => {
  const res = await fetch(`${gatewayBaseUrl}/api/v1/app-users/oauth2/exchange`, { method: "POST", headers: { Authorization: `Bearer ${requireApiKey()}`, "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
  if (!res.ok) throw new Error(`Google connection could not be completed (${res.status}).`);
  const body: unknown = await res.json();
  if (!body || typeof body !== "object" || !("api_key" in body) || typeof body.api_key !== "string" || !("connector_id" in body) || typeof body.connector_id !== "string") throw new Error("Google connection was incomplete.");
  return { connectionAPIKey: body.api_key, connectorId: body.connector_id };
});

export const disconnectAppUser = createServerOnlyFn(async ({ gatewayBaseUrl, connectionAPIKey, connectorId }: { gatewayBaseUrl: string; connectionAPIKey: string; connectorId: string }) => {
  const res = await fetch(`${gatewayBaseUrl}/api/v1/app-users/connection`, { method: "DELETE", headers: { Authorization: `Bearer ${requireApiKey()}`, "X-Connection-Api-Key": connectionAPIKey, "Content-Type": "application/json" }, body: JSON.stringify({ connector_id: connectorId }) });
  if (!res.ok) throw new Error(`Google could not be disconnected (${res.status}).`);
});