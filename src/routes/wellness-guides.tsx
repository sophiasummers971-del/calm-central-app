import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { InfoCards, NotMedicalAdvice } from "@/components/InfoCards";

export const Route = createFileRoute("/wellness-guides")({
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
  { title: "Calm breathing (2 minutes)", points: ["1. Sit down and relax your shoulders.", "2. Breathe in slowly and count to 4.", "3. Hold and count to 4.", "4. Breathe out slowly and count to 6.", "5. Do this 5 times."] },
  { title: "When you feel stressed", points: ["1. Stop what you are doing.", "2. Name 5 things you can see.", "3. Drink some water.", "4. Tell someone how you feel."] },
  { title: "A good morning", points: ["1. Open the curtains for daylight.", "2. Drink a glass of water.", "3. Take your morning medicine.", "4. Eat a simple breakfast."] },
  { title: "A good night", points: ["1. Turn off screens.", "2. Have a warm drink without caffeine.", "3. Take your evening medicine.", "4. Go to bed at your usual time."] },
];

function WellnessPage() {
  return (
    <PageShell title="Wellness guides" intro="Follow the steps one by one. Take your time.">
      <InfoCards items={guides} />
      <NotMedicalAdvice />
    </PageShell>
  );
}
