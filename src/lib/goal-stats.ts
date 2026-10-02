import type { HealthGoal } from "@/lib/local-store";

export type DayPoint = {
  key: string; // YYYY-MM-DD
  label: string; // DD/MM
  value: number;
};

export type WeekSummary = {
  total: number;
  daysReached: number;
  bestDay: DayPoint | null;
  average: number;
};

// Keys for the last n days, oldest first, in local time.
export const lastNDays = (n: number): string[] => {
  const out: string[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate() - i);
    const y = day.getFullYear();
    const m = String(day.getMonth() + 1).padStart(2, "0");
    const dd = String(day.getDate()).padStart(2, "0");
    out.push(`${y}-${m}-${dd}`);
  }
  return out;
};

export const dayLabel = (key: string): string => {
  const [, m, d] = key.split("-");
  return `${d}/${m}`;
};

export const seriesFor = (goal: HealthGoal, days: number): DayPoint[] =>
  lastNDays(days).map((key) => ({
    key,
    label: dayLabel(key),
    value: goal.progress[key] ?? 0,
  }));

export const weekSummaryFor = (goal: HealthGoal): WeekSummary => {
  const week = seriesFor(goal, 7);
  const total = week.reduce((sum, p) => sum + p.value, 0);
  const daysReached = week.filter((p) => p.value >= goal.target).length;
  const bestDay = week.reduce<DayPoint | null>(
    (best, p) => (p.value > 0 && (!best || p.value > best.value) ? p : best),
    null,
  );
  return { total, daysReached, bestDay, average: Math.round(total / 7) };
};

// Monday-start label for the current week, DD/MM/YYYY.
export const weekStartLabel = (): string => {
  const now = new Date();
  const mondayOffset = (now.getDay() + 6) % 7;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset);
  const dd = String(monday.getDate()).padStart(2, "0");
  const mm = String(monday.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${monday.getFullYear()}`;
};
