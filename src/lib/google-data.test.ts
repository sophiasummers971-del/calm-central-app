import { describe, expect, it } from "bun:test";
import { formatGoogleCalendarDate, googleListPath, googleRefreshInterval, parseGmailBatch } from "./google-data";

describe("Google updates", () => {
  it("allows browsing beyond the latest 10 Gmail messages", () => {
    const path = new URL(googleListPath("google_mail", "next page"), "https://example.com");
    expect(Number(path.searchParams.get("maxResults"))).toBeGreaterThan(10);
    expect(path.searchParams.get("pageToken")).toBe("next page");
    expect(path.searchParams.get("labelIds")).toBe("INBOX");
  });
  it("supports pagination for all three services", () => {
    for (const id of ["google_mail", "google_drive", "google_calendar"] as const) {
      expect(new URL(googleListPath(id, "cursor"), "https://example.com").searchParams.get("pageToken")).toBe("cursor");
    }
  });
  it("refreshes automatically at a bounded interval", () => {
    expect(googleRefreshInterval).toBe(30_000);
  });
  it("lists Drive files rather than only a changes feed", () => {
    const url = new URL(googleListPath("google_drive"), "https://example.com");
    expect(url.pathname).toBe("/drive/v3/files");
    expect(url.searchParams.get("fields")).toContain("nextPageToken");
    expect(url.searchParams.get("q")).toBe("trashed = false");
  });
  it("keeps all-day dates in calendar-date format", () => {
    expect(formatGoogleCalendarDate("2026-11-02")).toBe("02/11/2026");
    expect(formatGoogleCalendarDate("invalid")).toBe("");
  });
});

describe("Gmail MIME parser", () => {
  it("parses successful and failed parts without silently dropping failures", () => {
    const text = '--batch\r\nContent-Type: application/http\r\nContent-ID: <response-one>\r\n\r\nHTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{"id":"one"}\r\n--batch\r\nContent-Type: application/http\r\nContent-ID: <response-two>\r\n\r\nHTTP/1.1 403 Forbidden\r\nContent-Type: application/json\r\n\r\n{"error":"denied"}\r\n--batch--';
    expect(parseGmailBatch('multipart/mixed; boundary="batch"', text)).toEqual([
      { id: "one", status: 200, body: { id: "one" } },
      { id: "two", status: 403, body: { error: "denied" } },
    ]);
  });
  it("rejects responses that are not MIME batches", () => {
    expect(() => parseGmailBatch("application/json", "{}")).toThrow();
    expect(() => parseGmailBatch("multipart/mixed; boundary=batch", "--batch\r\nbroken\r\n--batch--")).toThrow();
  });
});