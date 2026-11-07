import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { useSessionUser } from "@/lib/auth";

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  staticData: { sitemap: false },
  validateSearch: (search: Record<string, unknown>) => ({ authorization_id: typeof search["authorization_id"] === "string" ? search["authorization_id"] : "" }),
  head: () => ({ meta: [
    { title: "Connect an assistant — My Life Folder" },
    { name: "description", content: "Review and approve secure assistant access to your account." },
    { property: "og:title", content: "Connect an assistant — My Life Folder" },
    { property: "og:description", content: "Review secure assistant access to your account." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("This connection link is missing its request. Start again from your assistant.");
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error("Your account could not be checked. Please try again.");
    if (!data.session) throw redirect({ to: "/auth", search: { next: location.pathname + location.searchStr + location.hash } });
  },
  loader: async ({ location }) => {
    const id = new URLSearchParams(location.searchStr).get("authorization_id");
    if (!id) throw new Error("Start this connection again from your assistant.");
    const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(id);
    if (error) throw new Error("This connection request is invalid or has expired. Start again from your assistant.");
    if (data && "redirect_url" in data && typeof data.redirect_url === "string") throw redirect({ href: data.redirect_url });
    return data;
  },
  pendingComponent: () => <PageShell title="Connect an assistant"><p role="status">Checking your connection request…</p></PageShell>,
  errorComponent: ({ error }) => <PageShell title="Connection unavailable"><p role="alert">{error instanceof Error ? error.message : "This connection request could not be loaded."}</p><Button asChild variant="outline" className="mt-4"><Link to="/auth" search={{ next: "/" }}>My account</Link></Button></PageShell>,
  component: ConsentPage,
});

function ConsentPage() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const { user } = useSessionUser();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const clientName = details && "client" in details ? details.client.name : "your assistant";
  async function decide(approve: boolean) {
    setBusy(true);
    setError("");
    try {
      const result = approve ? await supabase.auth.oauth.approveAuthorization(authorization_id) : await supabase.auth.oauth.denyAuthorization(authorization_id);
      if (result.error || !result.data?.redirect_url) throw new Error("The connection decision could not be saved. Please try again.");
      window.location.href = result.data.redirect_url;
    } catch {
      setError("The connection decision could not be saved. Please try again.");
      setBusy(false);
    }
  }
  return <PageShell title={`Connect ${clientName} to My Life Folder`}>
    <section className="max-w-xl space-y-5">
      <p className="break-words">Signed in as {user?.email || "your account"}</p>
      <p>This lets {clientName} use this app as you.</p>
      {details && "redirect_uri" in details && <p className="break-all text-sm text-muted-foreground">Return address: {details.redirect_uri}</p>}
      {details && "scope" in details && <ul className="list-disc space-y-2 pl-5">{details.scope.split(" ").filter(Boolean).map((scope) => <li key={scope}>{scope === "openid" ? "Confirm your identity" : scope === "email" ? "Share your email address" : scope === "profile" ? "Share your basic profile" : `Additional permission requested: ${scope}`}</li>)}</ul>}
      <p>Your assistant can find app pages and check your own support message dates, topics and statuses. Device-only health notes and journal entries are not included.</p>
      <p className="text-sm text-muted-foreground">This does not bypass your account permissions. Your assistant cannot send messages, delete information or share screenshots.</p>
      {error && <p role="alert">{error}</p>}
      <div className="flex flex-wrap gap-3"><Button disabled={busy} onClick={() => void decide(true)}>Approve connection</Button><Button variant="outline" disabled={busy} onClick={() => void decide(false)}>Cancel connection</Button></div>
      <Button asChild variant="ghost"><Link to="/auth" search={{ next: location.pathname + location.search }}>Switch account</Link></Button>
    </section>
  </PageShell>;
}