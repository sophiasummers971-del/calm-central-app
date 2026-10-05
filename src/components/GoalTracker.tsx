import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useServerFn } from "@tanstack/react-start";
import { newId, todayKey, useGoals, type HealthGoal } from "@/lib/local-store";
import { sendGoalAlert } from "@/lib/push.functions";
import { PushAlertsButton } from "@/components/PushAlertsButton";

const presets = [
  { label: "Steps", target: 6000, unit: "steps", step: 500 },
  { label: "Water", target: 8, unit: "glasses", step: 1 },
  { label: "Sleep", target: 8, unit: "hours", step: 1 },
];

const stepFor = (g: HealthGoal) => (g.target >= 100 ? Math.round(g.target / 10) : 1);

export function GoalTracker() {
  const { value: goals, save } = useGoals();
  const alert = useServerFn(sendGoalAlert);
  const [label, setLabel] = useState("");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("");
  const today = todayKey();

  const add = (g: Omit<HealthGoal, "id" | "progress">) =>
    save([...goals, { ...g, id: newId(), progress: {} }]);

  const change = (g: HealthGoal, delta: number) => {
    const before = g.progress[today] ?? 0;
    const now = Math.max(0, before + delta);
    save(goals.map((x) => (x.id === g.id ? { ...x, progress: { ...x.progress, [today]: now } } : x)));
    // Alert once when crossing 80% of today's target (not when already reached)
    const near = g.target * 0.8;
    if (before < near && now >= near && now < g.target) {
      alert({ data: { label: g.label, done: now, target: g.target, unit: g.unit } }).catch(() => undefined);
    }
  };

  return (
    <section
      aria-labelledby="goals-title"
      className="mt-8 space-y-4 rounded-2xl border border-border/60 surface p-4 sm:p-5"
    >
      <h2 id="goals-title" className="font-display text-2xl font-bold">
        My health goals
      </h2>
      <p className="text-base text-muted-foreground">
        Pick a goal, then tap plus each time you do a bit. It starts fresh every day.
      </p>
      <PushAlertsButton />

      {goals.length > 0 ? (
        <ul className="space-y-3">
          {goals.map((g) => {
            const done = g.progress[today] ?? 0;
            const pct = Math.min(100, Math.round((done / g.target) * 100));
            const step = stepFor(g);
            return (
              <li key={g.id} className="rounded-xl border border-border/50 bg-secondary/60 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xl font-bold">{g.label}</p>
                    <p className="text-base">
                      Today: <strong>{done}</strong> of {g.target} {g.unit}
                      {done >= g.target ? " — goal reached, well done!" : ""}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="min-h-11 min-w-11"
                    aria-label={`Delete ${g.label} goal`}
                    onClick={() => {
                      if (window.confirm(`Delete the ${g.label} goal?`))
                        save(goals.filter((x) => x.id !== g.id));
                    }}
                  >
                    <Trash2 className="size-5" aria-hidden="true" />
                  </Button>
                </div>
                <div
                  className="mt-3 h-4 overflow-hidden rounded-full bg-background"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${g.label} progress`}
                >
                  <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button variant="secondary" className="h-14 text-base" onClick={() => change(g, -step)}>
                    <Minus className="size-5" aria-hidden="true" /> {step}
                  </Button>
                  <Button className="h-14 text-base" onClick={() => change(g, step)}>
                    <Plus className="size-5" aria-hidden="true" /> {step}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-3">
        {presets
          .filter((p) => !goals.some((g) => g.label === p.label))
          .map((p) => (
            <Button
              key={p.label}
              variant="secondary"
              className="h-14 text-base"
              onClick={() => add({ label: p.label, target: p.target, unit: p.unit })}
            >
              <Plus className="size-5" aria-hidden="true" /> {p.label}
            </Button>
          ))}
      </div>

      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const t = Number(target);
          if (!label.trim() || !t || t <= 0) return;
          add({ label: label.trim().slice(0, 40), target: t, unit: unit.trim().slice(0, 20) });
          setLabel("");
          setTarget("");
          setUnit("");
        }}
      >
        <h3 className="text-lg font-bold">Make my own goal</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="g-label" className="text-base">What</Label>
            <Input id="g-label" className="h-14 text-base" value={label} maxLength={40} onChange={(e) => setLabel(e.target.value)} placeholder="Walks" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="g-target" className="text-base">How many a day</Label>
            <Input id="g-target" type="number" inputMode="numeric" min={1} className="h-14 text-base" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="2" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="g-unit" className="text-base">Counted in</Label>
            <Input id="g-unit" className="h-14 text-base" value={unit} maxLength={20} onChange={(e) => setUnit(e.target.value)} placeholder="walks" />
          </div>
        </div>
        <Button type="submit" variant="secondary" className="h-14 w-full text-base">
          <Plus className="size-5" aria-hidden="true" /> Add my goal
        </Button>
      </form>
    </section>
  );
}
