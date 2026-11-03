import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { InfoCards, NotMedicalAdvice } from "@/components/InfoCards";

export const Route = createFileRoute("/wellness-guides")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Wellness guides — calm step-by-step help" },
      { name: "description", content: "Step-by-step guides for calm breathing, feeling stressed, a good morning and a good night." },
      { property: "og:title", content: "Wellness guides — calm step-by-step help" },
      { property: "og:description", content: "Easy step-by-step guides to feel calmer and better." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WellnessPage,
});

const guides = [
  { title: "Gentle breathing for stress", points: ["1. Find a comfortable position, sitting with support or lying down. Loosen clothing that restricts breathing if you can.", "2. Let your breath flow comfortably without forcing it. Try breathing in gently through your nose and out through your mouth.", "3. If it helps, count steadily from 1 to 5 as you breathe in, then again as you breathe out. A shorter count is fine; do not hold your breath.", "4. The NHS suggests repeating for at least 5 minutes. Stop if you feel dizzy, uncomfortable or more anxious; return to your usual breathing.", "This is a relaxation exercise, not treatment for breathing difficulty. New or severe symptoms need medical help, not a breathing routine."] },
  { title: "Make a difficult moment manageable", points: ["1. Pause somewhere safe, if possible, and notice what is happening: are you worried, overwhelmed or physically unwell?", "2. Choose one small action, such as sitting somewhere quieter or contacting someone you trust. You do not need to solve everything at once.", "3. Write down what triggered the feeling and what support you need. Share the note with a trusted person or your GP if stress keeps affecting daily life.", "4. If a technique makes you feel worse, stop. These steps are optional and are not a substitute for mental health care.", "If you cannot keep yourself or someone else safe, call 999 or go to A&E. For urgent help that is not an emergency, contact NHS 111."] },
  { title: "Build a morning that fits your day", points: ["1. Choose a starting point that fits your schedule, including shift work or caring duties. There is no single correct morning routine.", "2. Check what you need today: food, a drink within any prescribed fluid limit, an appointment or help with a task.", "3. Check your medicine instructions. Take a morning dose only if that is what your prescription says.", "4. Pick one manageable goal, not a whole list. Record it in My details if that helps you remember.", "Adjust the plan on days when you are unwell. A missed routine is not a failure."] },
  { title: "Prepare for rest", points: ["1. Choose a quiet activity that helps you wind down. Reduce interruptions where possible rather than expecting a perfect bedroom or routine.", "2. Note anything that seemed to affect sleep, such as worries, discomfort or your work schedule. These observations can help an appointment discussion.", "3. Check prescribed medicine instructions rather than assuming you need an evening dose. Ask a pharmacist if timing is unclear.", "4. Keep a short sleep record if useful, including how you feel the next day. Do not change medicine or start sleep aids based on this guide.", "If sleep problems persist or tiredness affects daily life, speak to your GP. This routine does not diagnose or treat a sleep condition."] },
];

function WellnessPage() {
  return (
    <PageShell title="Wellness guides" intro="Follow the steps one by one. Take your time.">
      <InfoCards items={guides} />
      <section className="mt-6 space-y-3" aria-labelledby="guides-next">
        <h2 id="guides-next" className="font-display text-xl font-bold">Keep what helps, leave what does not</h2>
        <p>These routines are optional. Adapt them to disability, health conditions, care responsibilities and advice from your care team.</p>
        <ul className="list-disc space-y-2 pl-6">
          <li><Link to="/my-details" className="font-semibold underline">Save what you noticed in a health note</Link></li>
          <li><Link to="/appointment" className="font-semibold underline">Organise a concern for your GP appointment</Link></li>
          <li><Link to="/emergency" className="font-semibold underline">Check your emergency contacts and medicine list</Link></li>
        </ul>
        <h2 className="font-display text-xl font-bold">NHS sources and further help</h2>
        <p><a className="underline" href="https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/">Breathing exercises for stress</a> · <a className="underline" href="https://www.nhs.uk/live-well/sleep-and-tiredness/">Sleep and tiredness</a> · <a className="underline" href="https://www.nhs.uk/mental-health/">Mental health support</a></p>
      </section>
      <NotMedicalAdvice />
    </PageShell>
  );
}
