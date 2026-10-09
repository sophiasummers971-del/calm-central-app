import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { GooglePanel } from "@/components/google-panel";

export const Route = createFileRoute("/files")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Files — My Life Folder" },
      { name: "description", content: "Your recently changed Google Drive files." },
      { property: "og:title", content: "Files — My Life Folder" },
      { property: "og:description", content: "Your recently changed Google Drive files." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell title="Files" intro="Your recently changed Google Drive files.">
      <GooglePanel connectorId="google_drive" emptyText="No Drive files found." />
    </PageShell>
  );
}
