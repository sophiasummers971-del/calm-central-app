import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Phone } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { NotMedicalAdvice } from "@/components/InfoCards";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/symptom-checker")({
  head: () => ({
    meta: [
      { title: "Symptom checker — who should I call?" },
      { name: "description", content: "Answer a few simple yes or no questions to see if you should call 999, NHS 111 or your doctor." },
      { property: "og:title", content: "Symptom checker — who should I call?" },
      { property: "og:description", content: "Simple yes or no questions to help you decide who to call." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SymptomChecker,
});

const steps = [
  { q: "Do you have chest pain, trouble breathing, a face drooping, or heavy bleeding?", yes: "999" },
  { q: "Do you feel very unwell, confused, or have a very high temperature?", yes: "111" },
  { q: "Have you felt unwell for more than a few days, or is it getting worse?", yes: "gp" },
] as const;

type Result = "999" | "111" | "gp" | "home";

const results: Record<Result, { title: string; text: string; tel?: string; tone: string }> = {
  "999": { title: "Call 999 now", text: "This could be an emergency. Call an ambulance.", tel: "999", tone: "bg-destructive text-destructive-foreground" },
  "111": { title: "Call NHS 111", text: "Get advice today from NHS 111.", tel: "111", tone: "bg-primary text-primary-foreground" },
  gp: { title: "Contact your doctor", text: "Book an appointment with your GP. Write your notes first.", tone: "bg-primary text-primary-foreground" },
  home: { title: "Rest and look after yourself", text: "Rest, drink water, and check again later. If it gets worse, call NHS 111.", tone: "bg-secondary text-secondary-foreground" },
};

function SymptomChecker() {
  const [i, setI] = useState(0);
  const [result, setResult] = useState<Result | null>(null);

  const answer = (yes: boolean) => {
    if (yes) return setResult(steps[i]!.yes);
    if (i + 1 < steps.length) setI(i + 1);
    else setResult("home");
  };
  const restart = () => { setI(0); setResult(null); };

  return (
    <PageShell title="Symptom checker" intro="Answer yes or no. We help you choose who to call.">
      {result ? (
        <section className={`rounded-2xl p-5 ${results[result].tone}`}>
          <h2 className="font-display text-2xl font-bold">{results[result].title}</h2>
          <p className="mt-2 text-lg">{results[result].text}</p>
          <div className="mt-4 grid gap-3 sm:flex">
            {results[result].tel ? (
              <a href={`tel:${results[result].tel}`} className="flex min-h-14 items-center justify-center gap-2 rounded-xl border-2 border-current px-5 text-lg font-bold">
                <Phone className="size-6" aria-hidden="true" /> Call {results[result].tel}
              </a>
            ) : null}
            {result === "gp" ? (
              <Link to="/appointment" className="flex min-h-14 items-center justify-center rounded-xl border-2 border-current px-5 text-lg font-bold">Write appointment notes</Link>
            ) : null}
            <Button variant="outline" className="h-14 text-lg text-foreground" onClick={restart}>Start again</Button>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-border/60 surface p-5">
          <p className="text-base text-muted-foreground">Question {i + 1} of {steps.length}</p>
          <h2 className="mt-2 text-2xl font-bold">{steps[i]!.q}</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button className="h-16 text-xl" onClick={() => answer(true)}>Yes</Button>
            <Button variant="secondary" className="h-16 text-xl" onClick={() => answer(false)}>No</Button>
          </div>
        </section>
      )}
      <NotMedicalAdvice>This checker does not diagnose. If you are unsure, call NHS 111. In an emergency, always call 999.</NotMedicalAdvice>
    </PageShell>
  );
}
