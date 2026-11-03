import { z } from "zod";

export const journalMoods = ["Very low", "Low", "Okay", "Good", "Very good"] as const;

export const journalEntrySchema = z.object({
  id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
    const parsed = new Date(`${value}T12:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }, "Choose a valid date."),
  mood: z.enum(journalMoods).nullable(),
  food: z.string().trim().max(4000),
  symptoms: z.string().trim().max(4000),
  createdAt: z.string(),
}).refine((entry) => entry.mood !== null || entry.food.length > 0 || entry.symptoms.length > 0, {
  message: "Add a mood, food or symptoms before saving.",
});

export type JournalEntry = z.infer<typeof journalEntrySchema>;

export function sortJournalEntries(entries: JournalEntry[]): JournalEntry[] {
  return [...entries].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}