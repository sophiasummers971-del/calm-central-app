import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { InfoCards, NotMedicalAdvice } from "@/components/InfoCards";

export const Route = createFileRoute("/health-tips")({
  head: () => ({
    meta: [
      { title: "Health tips — small easy steps for every day" },
      { name: "description", content: "Short, simple health tips about water, food, sleep, moving and medicine." },
      { property: "og:title", content: "Health tips — small easy steps for every day" },
      { property: "og:description", content: "Simple everyday health tips in plain words." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HealthTipsPage,
});

const tips = [
  { title: "Drink water", points: ["Drink a glass of water with each meal.", "Keep a bottle near you.", "Pale yellow pee means you drink enough."] },
  { title: "Eat well", points: ["Eat some fruit or vegetables every day.", "Eat at regular times.", "Try to have less sugar and salt."] },
  { title: "Sleep", points: ["Go to bed at the same time each night.", "Put your phone away 30 minutes before bed.", "Keep your bedroom dark and quiet."] },
  { title: "Move a little", points: ["Walk for 10 minutes a day.", "Stand up and stretch every hour.", "Any movement is good. Start small."] },
  { title: "Medicine", points: ["Take medicine at the same time each day.", "Use a pill box or phone alarm.", "Ask the pharmacist if you are unsure."] },
  { title: "Talk to someone", points: ["Call a friend or family member.", "Tell someone if you feel sad or worried.", "It is OK to ask for help."] },
];

function HealthTipsPage() {
  return (
    <PageShell title="Health tips" intro="Small, easy steps you can do every day.">
      <InfoCards items={tips} />
      <NotMedicalAdvice />
    </PageShell>
  );
}
