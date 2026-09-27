import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, AlertTriangle, Copy, Save } from "lucide-react";
import { newId, useConcerns } from "@/lib/local-store";
import { PageShell } from "@/components/PageShell";
import { MicButton } from "@/components/MicButton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { summarizeConcern, type AppointmentSummary } from "@/lib/appointment.functions";

export const Route = createFileRoute("/appointment")({
  head: () => ({
    meta: [
      { title: "Appointment notes — turn your words into a clear summary" },
      {
        name: "description",
        content:
          "Say or type how you feel and get a clear, simple summary you can show or read to your doctor.",
      },
      { property: "og:title", content: "Appointment notes — turn your words into a clear summary" },
      {
        property: "og:description",
        content: "Say how you feel, get a simple summary for your doctor.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AppointmentPage,
});

function AppointmentPage() {
  const run = useServerFn(summarizeConcern);
  const [text, setText] = useState("");
  const [summary, setSummary] = useState<AppointmentSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const { value: concerns, save: saveConcerns } = useConcerns();

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    setError(null);
    setNeedsSignIn(false);
    setSummary(null);
    setCopied(false);
    setSavedId(null);
    try {
      const result = await run({ data: { concern: text.trim() } });
      setSummary(result);
    } catch (err) {
      const message = err instanceof Error && err.message ? err.message : "";
      if (message.toLowerCase().includes("unauthorized")) {
        setNeedsSignIn(true);
      } else {
        setError(message || "Sorry, that did not work. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell
      title="Appointment notes"
      intro="Say or write how you feel. We will make a clear list you can show your doctor."
    >
      <form
        className="space-y-4 rounded-2xl border border-border/60 surface p-4 sm:p-5"
        onSubmit={onSubmit}
      >
        <Label htmlFor="concern" className="text-base">
          How do you feel? Write anything you like.
        </Label>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <Textarea
            id="concern"
            className="min-h-40 text-base"
            maxLength={4000}
            placeholder="For example: my tummy hurts after food, it started last week, I feel tired."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <MicButton
            label="how you feel"
            onText={(spoken) => setText((t) => (t ? `${t} ${spoken}` : spoken).slice(0, 4000))}
          />
        </div>

        <Button type="submit" className="h-16 w-full text-lg" disabled={busy || !text.trim()}>
          {busy ? (
            <>
              <Loader2 className="size-6 animate-spin" aria-hidden="true" /> Making your summary…
            </>
          ) : (
            <>
              <Sparkles className="size-6" aria-hidden="true" /> Make my summary
            </>
          )}
        </Button>

        {needsSignIn ? (
          <p role="alert" className="text-center text-lg font-semibold">
            Please{" "}
            <Link to="/auth" className="underline underline-offset-4">
              sign in
            </Link>{" "}
            first, then make your summary.
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="text-center text-lg font-semibold text-destructive">
            {error}
          </p>
        ) : null}
      </form>

      {summary ? (
        <section
          className="mt-6 space-y-4 rounded-2xl border border-border/60 surface p-4 sm:p-5"
          aria-labelledby="summary-title"
        >
          <h2 id="summary-title" className="font-display text-2xl font-bold">
            Your summary
          </h2>

          {summary.urgentWarning ? (
            <p
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-border/60 bg-tile-emergency p-4 text-base font-bold"
            >
              <AlertTriangle className="mt-0.5 size-6 shrink-0" aria-hidden="true" />
              {summary.urgentWarning}
            </p>
          ) : null}

          <Block title="The main problem">
            <p className="text-base">{summary.mainProblem}</p>
          </Block>
          <Block title="How long it has been going on">
            <p className="text-base">{summary.howLong}</p>
          </Block>
          <ListBlock title="What I feel" items={summary.symptoms} />
          <ListBlock
            title="What helps or makes it worse"
            items={summary.thingsThatHelpOrMakeItWorse}
          />
          <ListBlock title="Medicines I mentioned" items={summary.medicinesMentioned} />
          <ListBlock title="Questions for the doctor" items={summary.questionsForTheDoctor} />

          <Button
            type="button"
            variant="secondary"
            className="h-14 w-full text-base"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(toPlainText(summary));
                setCopied(true);
              } catch {
                setCopied(false);
              }
            }}
          >
            <Copy className="size-5" aria-hidden="true" /> Copy my summary
          </Button>
          {copied ? (
            <p role="status" className="text-center text-lg font-semibold text-primary">
              Copied. You can paste it anywhere.
            </p>
          ) : null}

          {savedId ? (
            <div role="status" className="rounded-xl border border-primary/60 bg-secondary/60 p-4 text-center">
              <p className="text-lg font-semibold text-primary">Saved in My details.</p>
              <Link to="/my-details" className="mt-1 inline-block text-lg font-bold underline">
                Open My details
              </Link>
            </div>
          ) : (
            <Button
              type="button"
              className="h-14 w-full text-base"
              onClick={() => {
                const id = newId();
                saveConcerns([
                  { id, createdAt: new Date().toISOString(), original: text.trim(), summary },
                  ...concerns,
                ]);
                setSavedId(id);
              }}
            >
              <Save className="size-5" aria-hidden="true" /> Save in My details
            </Button>
          )}

          <p className="text-base text-muted-foreground">
            This is only a tidy-up of your own words. It is not medical advice.
          </p>
        </section>
      ) : null}
    </PageShell>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/50 bg-secondary/60 p-4">
      <h3 className="text-lg font-bold">{title}</h3>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <Block title={title}>
      <ul className="list-disc space-y-1 pl-5 text-base">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Block>
  );
}

function toPlainText(s: AppointmentSummary) {
  const lines = [
    `Main problem: ${s.mainProblem}`,
    `How long: ${s.howLong}`,
    `What I feel: ${s.symptoms.join("; ")}`,
    `Helps or makes it worse: ${s.thingsThatHelpOrMakeItWorse.join("; ")}`,
    `Medicines: ${s.medicinesMentioned.join("; ")}`,
    `Questions: ${s.questionsForTheDoctor.join("; ")}`,
  ];
  if (s.urgentWarning) lines.unshift(`Important: ${s.urgentWarning}`);
  return lines.join("\n");
}
