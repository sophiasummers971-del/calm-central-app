import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { GooglePanel } from "@/components/google-panel";

export const Route = createFileRoute("/calendar")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Calendar — My Life Folder" },
      { name: "description", content: "Your upcoming Google Calendar appointments." },
      { property: "og:title", content: "Calendar — My Life Folder" },
      { property: "og:description", content: "Your upcoming Google Calendar appointments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell title="Calendar" intro="Your upcoming Google Calendar appointments.">
      <GooglePanel connectorId="google_calendar" emptyText="No upcoming appointments." />
    </PageShell>
  );
}
