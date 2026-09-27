import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { SupportForm } from "@/components/SupportForm";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Send us a message — get help by email" },
      {
        name: "description",
        content: "Tell us what went wrong, add a picture of the screen, and get an answer by email.",
      },
      { property: "og:title", content: "Send us a message — get help by email" },
      { property: "og:description", content: "Write to us with a screenshot and get help by email." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  return (
    <PageShell title="Send us a message" intro="Tell us what went wrong. We answer by email.">
      <section className="rounded-2xl border border-border/60 surface p-4 sm:p-5">
        <SupportForm />
      </section>
      <p className="mt-6 text-base">
        Your messages show in{" "}
        <Link to="/my-details" className="font-bold underline">
          My details
        </Link>
        .
      </p>
    </PageShell>
  );
}
