import type { GoogleConnectorId } from "./google-config";

export const googlePageSize = 50;
export const googleRefreshInterval = 30_000;

export function googleListPath(connectorId: GoogleConnectorId, pageToken?: string) {
  const params = new URLSearchParams();
  if (pageToken) params.set("pageToken", pageToken);
  if (connectorId === "google_mail") {
    params.set("maxResults", String(googlePageSize));
    params.set("labelIds", "INBOX");
    return `/gmail/v1/users/me/messages?${params}`;
  }
  if (connectorId === "google_drive") {
    params.set("pageSize", String(googlePageSize));
    params.set("orderBy", "modifiedTime desc");
    params.set("q", "trashed = false");
    params.set("fields", "nextPageToken,files(id,name,modifiedTime,webViewLink,mimeType)");
    return `/drive/v3/files?${params}`;
  }
  params.set("maxResults", String(googlePageSize));
  params.set("singleEvents", "true");
  params.set("orderBy", "startTime");
  params.set("timeMin", new Date().toISOString());
  return `/calendar/v3/calendars/primary/events?${params}`;
}

export type GmailBatchPart = { id: string; status: number; body: unknown };

export function parseGmailBatch(contentType: string, text: string): GmailBatchPart[] {
  const boundary = /boundary=(?:"([^"]+)"|([^;\s]+))/i.exec(contentType);
  const value = boundary?.[1] ?? boundary?.[2];
  if (!/^multipart\/mixed\b/i.test(contentType) || !value) throw new Error("Gmail returned an invalid batch response.");
  return text.split(`--${value}`).slice(1).filter((part) => part.trim() && !part.trim().startsWith("--")).map((part) => {
    const normalized = part.replace(/\r\n/g, "\n").trim();
    const mimeEnd = normalized.indexOf("\n\n");
    if (mimeEnd < 0) throw new Error("Gmail returned an incomplete batch part.");
    const mimeHeaders = normalized.slice(0, mimeEnd);
    const http = normalized.slice(mimeEnd + 2);
    const status = /^HTTP\/\d(?:\.\d)?\s+(\d{3})/.exec(http)?.[1];
    const bodyStart = http.indexOf("\n\n");
    const id = /Content-ID:\s*<?(?:response-)?([^>\n]+)>?/i.exec(mimeHeaders)?.[1]?.trim();
    if (!status || bodyStart < 0 || !id) throw new Error("Gmail returned an invalid batch part.");
    const raw = http.slice(bodyStart + 2).trim();
    const body: unknown = raw ? JSON.parse(raw) : null;
    return { id, status: Number(status), body };
  });
}

export function formatGoogleCalendarDate(value: string) {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return parts ? `${parts[3]}/${parts[2]}/${parts[1]}` : "";
}