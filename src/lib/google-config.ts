export const googleProducts = [
  { id: "google_mail", label: "Gmail", scopes: ["https://www.googleapis.com/auth/gmail.readonly"] },
  { id: "google_drive", label: "Drive", scopes: ["https://www.googleapis.com/auth/drive.readonly"] },
  { id: "google_calendar", label: "Calendar", scopes: ["https://www.googleapis.com/auth/calendar.readonly"] },
] as const;
export type GoogleConnectorId = typeof googleProducts[number]["id"];
export type GoogleItem = { id: string; title: string; detail: string; url?: string | undefined };
export type GoogleStatus = { connectorId: GoogleConnectorId; connected: boolean; reconnectRequired: boolean; account: string; items: GoogleItem[]; error?: string };