import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/privacy")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title: "Privacy notice — My Life Folder" },
    { name: "description", content: "How My Life Folder handles local health notes, account information, support messages and connected services." },
    { property: "og:title", content: "Privacy notice — My Life Folder" },
    { property: "og:description", content: "Understand what stays on your device and what is shared with connected services." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ], links: [{ rel: "canonical", href: "https://all-my-data.lovable.app/privacy" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return <PageShell title="Privacy notice" intro="Your information, clearly explained.">
    <article className="max-w-3xl space-y-8 leading-relaxed">
      <p className="text-sm text-muted-foreground">Last updated: 07/11/2026</p>
      <section className="space-y-3"><h2 className="font-display text-xl font-bold">Information on your device</h2><p>Your saved accounts, contact details, emergency information, health notes, journal and goals are stored in this browser. They are not automatically synced to your account or other devices. This storage is not encrypted by the app: anyone with access to your browser profile may be able to read it.</p><p>Screen colours, text size and navigation preferences are also saved locally. Clearing browser data can remove your records. Backups and email exports may contain sensitive health information; keep them secure.</p></section>
      <section className="space-y-3"><h2 className="font-display text-xl font-bold">Account and support information</h2><p>Lovable Cloud handles sign-in information and account sessions. When you send a support message, your email address, topic, message and any screenshot are sent to the app’s backend. Authorised support administrators can read submissions and manage their status. Avoid including passwords or unnecessary medical information in support messages.</p></section>
      <section className="space-y-3"><h2 className="font-display text-xl font-bold">Google services</h2><p>Gmail, Drive and Calendar require separate permission. The app requests read-only access and displays email metadata, file information and calendar events. Connection credentials are stored encrypted against your account. You can disconnect each service on its page and revoke access through your Google account. These connections do not give remote assistants access to your Google lists.</p></section>
      <section className="space-y-3"><h2 className="font-display text-xl font-bold">AI appointment notes and notifications</h2><p>If you request an appointment summary, the concern you enter is sent to Lovable’s AI service and its model provider. Only include information you are comfortable sending. Saved concerns and summaries remain in this browser. This notice does not promise that service providers retain no data.</p><p>If you enable goal alerts, Firebase processes a device messaging token and notification content. Goal information may be visible on your lock screen. You can turn off notifications in your browser or phone settings.</p></section>
      <section className="space-y-3"><h2 className="font-display text-xl font-bold">Assistant connections and technical records</h2><p>An assistant you approve can discover app pages and read the topics, dates and statuses of your latest support messages. It cannot read device-local health records, support message bodies or screenshots through these remote tools. Hosting and service providers may process technical logs to run and troubleshoot the service. Some errors may contain provider-returned information.</p></section>
      <section className="space-y-3"><h2 className="font-display text-xl font-bold">Your choices and privacy requests</h2><p>Use Settings to back up or clear device-local records. Clearing local records does not delete your account, support submissions, connection credentials or service-provider logs. For access, correction or deletion requests relating to server-held information, use Messages to help. You may also raise a concern with your local data protection authority, including the UK Information Commissioner’s Office.</p><p>The operator’s legal identity, applicable processing bases, retention periods and international-transfer safeguards have not yet been confirmed. This notice describes the current app behaviour and needs those details before it can be treated as a complete legal privacy policy.</p><div className="flex flex-wrap gap-3"><Button variant="outline" asChild><Link to="/support">Messages to help</Link></Button><Button variant="ghost" asChild><Link to="/terms">Terms of use</Link></Button></div></section>
    </article>
  </PageShell>;
}