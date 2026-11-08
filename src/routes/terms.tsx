import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/terms")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Terms of use — My Life Folder" },
      {
        name: "description",
        content:
          "Terms for using My Life Folder, including health information limitations, account safety and connected services.",
      },
      { property: "og:title", content: "Terms of use — My Life Folder" },
      {
        property: "og:description",
        content:
          "Important information about personal records, health guidance and responsible use.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://all-my-data.lovable.app/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <PageShell title="Terms of use" intro="A clear understanding of your personal folder.">
      <article className="max-w-3xl space-y-8 leading-relaxed">
        <p className="text-sm text-muted-foreground">Last updated: 08/11/2026</p>
        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold">Service operator</h2>
          <p>
            My Life Folder is operated by Sophia Jade Summers under the name Sj-insides,
            based in Essex, United Kingdom. Questions about these terms can be sent through
            Messages to help.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold">Purpose of the service</h2>
          <p>
            My Life Folder helps you organise personal details, health notes and everyday
            information. It is not a medical record system, an emergency monitoring service or a
            substitute for professional healthcare.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold">Health information and emergencies</h2>
          <p>
            Health tips, symptom guidance and AI summaries may be incomplete or incorrect. Check
            generated summaries before sharing them and consult a qualified professional about
            diagnosis or treatment. Do not change medication based on this app. For an emergency in
            the UK, call 999; for urgent non-emergency advice, contact NHS 111. Outside the UK, use
            your local services.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold">Your account and records</h2>
          <p>
            Use only accounts and information you are authorised to access. Keep your password and
            device secure and sign out on shared devices. Keep important details accurate and make
            secure backups: local records can be lost when browser data is cleared. You are
            responsible for checking recipients before exporting or emailing personal information.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold">Responsible use</h2>
          <p>
            Do not upload unlawful content, impersonate someone, access another person’s account
            without permission, interfere with the service or attempt to bypass security. Only share
            another person’s information when you have the necessary permission or authority.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold">Connected services and availability</h2>
          <p>
            Google, AI and notification services have their own terms and privacy practices. You
            choose whether to connect or use them. Access and delivery can be interrupted, delayed
            or refused by those services. The app does not guarantee uninterrupted access,
            successful notifications or the accuracy of third-party content. Keep a separate copy of
            essential emergency information.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold">Privacy, changes and your rights</h2>
          <p>
            The privacy notice explains current information handling. These terms may be updated as
            the service changes; check the date above. Nothing here removes rights or protections
            that cannot lawfully be excluded.
          </p>
          <p>
            A public contact address and approved terms, including any governing-law provisions,
            still need confirmation. The operator’s location does not by itself establish those
            provisions. These terms remain an operational draft, not confirmation of complete
            legal launch readiness.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link to="/support">Contact through Messages to help</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/privacy">Privacy notice</Link>
            </Button>
          </div>
        </section>
      </article>
    </PageShell>
  );
}
