import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft, Trophy } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { useGoals } from "@/lib/local-store";
import { seriesFor, weekSummaryFor, weekStartLabel } from "@/lib/goal-stats";

export const Route = createFileRoute("/goal-progress")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "My goal progress — My Life Folder" },
      {
        name: "description",
        content: "See your health goals, your progress over the last two weeks, and a summary of your week.",
      },
      { property: "og:title", content: "My goal progress — My Life Folder" },
      {
        property: "og:description",
        content: "See your health goals, your progress over the last two weeks, and a summary of your week.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GoalProgressPage,
});

function GoalProgressPage() {
  const { value: goals, ready } = useGoals();

  const charts = useMemo(
    () =>
      goals.map((g) => ({
        goal: g,
        series: seriesFor(g, 14),
        week: weekSummaryFor(g),
      })),
    [goals],
  );

  const reachedThisWeek = charts.filter((c) => c.week.daysReached > 0).length;

  return (
    <PageShell
      title="My goal progress"
      intro="See how your goals are going, day by day, and how this week adds up."
    >
      <Button asChild variant="secondary" className="h-14 text-base">
        <Link to="/my-details">
          <ArrowLeft className="size-5" aria-hidden="true" /> Back to My details
        </Link>
      </Button>

      {!ready ? null : goals.length === 0 ? (
        <section className="mt-6 rounded-2xl border border-border/60 surface p-4 sm:p-5">
          <h2 className="font-display text-2xl font-bold">No goals yet</h2>
          <p className="mt-2 text-base text-muted-foreground">
            You have not set any goals yet. Add one in My details — like daily steps, water or sleep —
            and your progress will show up here.
          </p>
          <Button asChild className="mt-4 h-14 text-base">
            <Link to="/my-details">Go to My details</Link>
          </Button>
        </section>
      ) : (
        <>
          <section
            aria-labelledby="week-title"
            className="mt-6 rounded-2xl border border-border/60 surface p-4 sm:p-5"
          >
            <h2 id="week-title" className="font-display text-2xl font-bold">
              My week so far
            </h2>
            <p className="mt-1 text-base text-muted-foreground">
              Week starting {weekStartLabel()}.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/50 bg-secondary/60 p-4">
                <p className="text-base text-muted-foreground">Goals I am tracking</p>
                <p className="font-display text-3xl font-bold">{goals.length}</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-secondary/60 p-4">
                <p className="text-base text-muted-foreground">Goals reached at least once this week</p>
                <p className="font-display text-3xl font-bold">{reachedThisWeek}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-3">
              {charts.map(({ goal, week }) => (
                <li
                  key={goal.id}
                  className="rounded-xl border border-border/50 bg-secondary/60 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xl font-bold">{goal.label}</p>
                    {week.daysReached > 0 ? (
                      <span className="inline-flex items-center gap-1 text-base font-semibold text-primary">
                        <Trophy className="size-5" aria-hidden="true" />
                        {week.daysReached} {week.daysReached === 1 ? "day" : "days"} reached
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-base">
                    This week: <strong>{week.total}</strong> {goal.unit} in total, about{" "}
                    <strong>{week.average}</strong> a day.
                    {week.bestDay
                      ? ` Your best day was ${week.bestDay.label} with ${week.bestDay.value} ${goal.unit}.`
                      : " Nothing counted yet this week."}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {charts.map(({ goal, series, week }) => (
            <section
              key={goal.id}
              aria-labelledby={`chart-${goal.id}`}
              className="mt-6 rounded-2xl border border-border/60 surface p-4 sm:p-5"
            >
              <h2 id={`chart-${goal.id}`} className="font-display text-2xl font-bold">
                {goal.label}
              </h2>
              <p className="mt-1 text-base text-muted-foreground">
                Last two weeks. The line shows your daily goal of {goal.target} {goal.unit}.
              </p>
              <p className="sr-only">
                {goal.label}: {week.total} {goal.unit} this week, goal reached on {week.daysReached}{" "}
                {week.daysReached === 1 ? "day" : "days"}.
              </p>
              <div className="mt-4 h-56 w-full sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={series} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      interval={1}
                    />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.75rem",
                        color: "hsl(var(--card-foreground))",
                      }}
                      formatter={(value) => [`${value} ${goal.unit}`, goal.label]}
                    />
                    <ReferenceLine
                      y={goal.target}
                      stroke="hsl(var(--primary))"
                      strokeDasharray="6 4"
                    />
                    <Bar
                      dataKey="value"
                      fill="hsl(var(--primary) / 0.75)"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          ))}
        </>
      )}
    </PageShell>
  );
}
