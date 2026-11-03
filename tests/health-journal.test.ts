import { describe, expect, test } from "bun:test";
import { journalEntrySchema, sortJournalEntries, type JournalEntry } from "../src/lib/health-journal";

const entry: JournalEntry = { id: "one", date: "2026-11-03", mood: "Good", food: "Porridge", symptoms: "Headache", createdAt: "2026-11-03T10:00:00Z" };

describe("health journal", () => {
  test("stores a date with mood, food and symptoms", () => {
    expect(journalEntrySchema.parse(entry)).toEqual(entry);
  });
  test("rejects empty entries", () => {
    expect(journalEntrySchema.safeParse({ ...entry, mood: null, food: "  ", symptoms: "" }).success).toBe(false);
  });
  test("accepts a symptoms-only entry", () => {
    expect(journalEntrySchema.safeParse({ ...entry, mood: null, food: "" }).success).toBe(true);
  });
  test("rejects impossible dates", () => {
    expect(journalEntrySchema.safeParse({ ...entry, date: "2026-02-30" }).success).toBe(false);
  });
  test("sorts by entry date then creation time without changing the original list", () => {
    const earlier = { ...entry, id: "earlier", date: "2026-11-02" };
    const later = { ...entry, id: "later", createdAt: "2026-11-03T11:00:00Z" };
    const original = [earlier, entry, later];
    expect(sortJournalEntries(original).map((item) => item.id)).toEqual(["later", "one", "earlier"]);
    expect(original[0]?.id).toBe("earlier");
  });
});