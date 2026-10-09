import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { GooglePanel } from "@/components/google-panel";

export const Route = createFileRoute("/inbox")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Inbox — My Life Folder" },
      { name: "description", content: "Your latest Gmail messages, from your own account." },
      { property: "og:title", content: "Inbox — My Life Folder" },
      { property: "og:description", content: "Your latest Gmail messages, from your own account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell title="Inbox" intro="Your latest Gmail messages, from your own account.">
      <GooglePanel connectorId="google_mail" emptyText="Your inbox is empty." />
    </PageShell>
  );
}
