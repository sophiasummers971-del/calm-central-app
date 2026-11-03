import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { InfoCards, NotMedicalAdvice } from "@/components/InfoCards";

export const Route = createFileRoute("/health-tips")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Health tips — small easy steps for every day" },
      {
        name: "description",
        content: "Short, simple health tips about water, food, sleep, moving and medicine.",
      },
      { property: "og:title", content: "Health tips — small easy steps for every day" },
      { property: "og:description", content: "Simple everyday health tips in plain words." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HealthTipsPage,
});

const tips = [
  {
    title: "Make drinking easier to remember",
    points: [
      "Keep a drink within reach and drink regularly through the day. Water, milk, tea and coffee can all count towards fluid intake.",
      "The NHS describes 6 to 8 cups or glasses a day as a general guide, not a target for everyone. Heat, activity and illness can change what you need.",
      "If your clinician has given you a fluid limit, follow that advice instead. A water goal in this folder is a reminder, not a medical recommendation.",
    ],
  },
  {
    title: "Plan food around your needs",
    points: [
      "Choose one practical step, such as adding vegetables to a meal or keeping a simple meal ready for a busy day.",
      "Plan around allergies, food access and any eating advice you already have. A general tip must not replace a prescribed diet.",
      "If eating is difficult, or you are losing weight without trying, write down what has changed and discuss it with your GP rather than setting stricter food rules.",
    ],
  },
  {
    title: "Notice your sleep pattern",
    points: [
      "Note when you go to bed, when you wake, and how you feel during the day. A few days of notes can make a discussion with your GP more useful.",
      "Try a repeatable wind-down routine and a comfortable sleeping space. Shift work, caring responsibilities and illness may mean a fixed bedtime is not realistic.",
      "A sleep-hours goal is only a record. If tiredness or poor sleep keeps affecting daily life, ask your GP for help rather than treating a goal as a diagnosis.",
    ],
  },
  {
    title: "Choose movement you can manage",
    points: [
      "Pick an activity that fits your abilities: a short walk, wheelchair activity or suitable seated movement. The NHS exercise pages include different options, not just walking.",
      "Start with a manageable amount and adapt it to how you feel. If you have a condition, injury or recent operation, follow your care team's advice about activity.",
      "Record progress without comparing yourself with somebody else's step target. Stop an activity that makes you feel unwell and seek advice if needed.",
    ],
  },
  {
    title: "Keep medicine instructions clear",
    points: [
      "Keep an up-to-date list of medicines and allergies in Emergency so you can refer to it during an appointment.",
      "Follow the label and your prescriber's instructions, including timing and whether to take it with food. Not all medicines are taken every day.",
      "Ask a pharmacist before using a pill organiser, changing timing or dealing with a missed dose. Do not double a dose or stop treatment because of a general tip.",
    ],
  },
  {
    title: "Prepare for a conversation",
    points: [
      "If you feel worried or low, choose someone you trust and explain what has been difficult and what support would help.",
      "For a health concern, note when it started, what has changed, medicines you take and questions you want answered.",
      "Appointment notes can organise your words, but they cannot diagnose a condition or decide that it is safe to wait. Use NHS 111 for urgent advice and 999 in an emergency.",
    ],
  },
];

function HealthTipsPage() {
  return (
    <PageShell title="Health tips" intro="Small, easy steps you can do every day.">
      <InfoCards items={tips} />
      <section className="mt-6 space-y-3" aria-labelledby="tips-next">
        <h2 id="tips-next" className="font-display text-xl font-bold">
          Your next step
        </h2>
        <p>
          Choose one change that suits your circumstances. Keep the target flexible and follow any
          advice from your care team.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <Link to="/my-details" className="font-semibold underline">
              Record a goal or health note in My details
            </Link>
          </li>
          <li>
            <Link to="/appointment" className="font-semibold underline">
              Prepare questions for an appointment
            </Link>
          </li>
          <li>
            <Link to="/wellness-guides" className="font-semibold underline">
              Try a step-by-step wellness guide
            </Link>
          </li>
        </ul>
        <h2 className="font-display text-xl font-bold">Read the NHS guidance</h2>
        <p>
          <a
            className="underline"
            href="https://www.nhs.uk/live-well/eat-well/food-guidelines-and-food-labels/water-drinks-nutrition/"
          >
            Water, drinks and hydration
          </a>{" "}
          ·{" "}
          <a className="underline" href="https://www.nhs.uk/live-well/exercise/">
            Exercise options and guidelines
          </a>{" "}
          ·{" "}
          <a className="underline" href="https://www.nhs.uk/live-well/sleep-and-tiredness/">
            Sleep and tiredness
          </a>
        </p>
      </section>
      <NotMedicalAdvice />
    </PageShell>
  );
}
