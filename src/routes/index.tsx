import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, HeartPulse, Phone, Sparkles } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { AccountSummary } from "@/components/account-summary";
import { Button } from "@/components/ui/button";
import { useAccounts, useHealthInfo, useJournal, usePeople } from "@/lib/local-store";
import { navigationGroups } from "@/lib/navigation";
import folderSculpture from "@/assets/folder-sculpture.jpg";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title: "My Life Folder — your personal overview" },
    { name: "description", content: "Your personal details, connected Google services, health journal, goals and emergency information in one organised folder." },
    { property: "og:title", content: "My Life Folder — your personal overview" },
    { property: "og:description", content: "Explore your accounts, daily health, appointments and personal settings in one clear overview." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Index,
});

function Index() {
  const { value: accounts, ready } = useAccounts();
  const { value: journal } = useJournal();
  const { value: health } = useHealthInfo();
  const { value: people } = usePeople();
  const firstHelper = people.find((person) => person.phone);
  return <PageShell title="My Life Folder" intro="Your life, thoughtfully organised.">
    <section className="folder-cover relative mb-6 overflow-hidden" aria-label="Your folder">
      <img src={folderSculpture} alt="Sculptural glass folders with cyan edges and a pink tab" width={1536} height={768} className="absolute inset-0 h-full w-full object-cover object-right" />
      <div className="relative z-10 max-w-[60%] px-5 py-8 sm:px-8 sm:py-10">
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold text-cover-muted"><span className="h-px w-6 bg-primary" />A space of your own</p>
        <h2 className="font-display text-xl font-bold text-cover-foreground sm:text-2xl">Less scattered.<br />More you.</h2>
        <Button asChild className="mt-5 h-auto whitespace-normal px-3 py-2 text-xs sm:text-sm"><Link to="/health-journal"><Sparkles />Open your journal<ArrowUpRight /></Link></Button>
      </div>
    </section>
    <AccountSummary />
    <div className="my-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground"><span><strong className="text-foreground">{ready ? accounts.length : "—"}</strong> saved accounts</span><span><strong className="text-foreground">{journal.length}</strong> journal entries</span><Link to="/emergency" className="inline-flex items-center gap-2 text-accent hover:underline"><HeartPulse className="size-4" />Emergency details<ArrowUpRight className="size-3" /></Link></div>
    <div className="space-y-8">
      {navigationGroups.map((group, index) => <section key={group.label} aria-labelledby={`section-${index}`}>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-1"><h2 id={`section-${index}`} className="flex items-center gap-3 font-display text-lg font-bold"><span className="text-xs text-primary">0{index + 1}</span>{group.label}</h2><p className="text-xs text-muted-foreground">{group.description}</p></div>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {group.items.map(({ to, label, detail, icon: Icon }) => <li key={to}><Link to={to} className={`explore-tile group flex h-full min-h-24 items-center gap-3 rounded-lg border border-border/70 bg-card p-4 ${to === "/emergency" ? "explore-tile-accent" : ""}`}><span className={`flex size-10 shrink-0 items-center justify-center rounded-md ${index === 1 ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"}`}><Icon className="size-5" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{label}</span><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{detail}</span></span><ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" /></Link></li>)}
        </ul>
      </section>)}
    </div>
    {(firstHelper || health.gpPhone) && <section className="mt-8 border-t border-border py-5" aria-label="Quick contacts"><h2 className="mb-3 font-display text-lg font-bold">Your quick contacts</h2><div className="flex flex-wrap gap-3">{firstHelper && <CallButton name={firstHelper.name} phone={firstHelper.phone} />}{health.gpPhone && <CallButton name={health.gpName || "My doctor"} phone={health.gpPhone} />}</div></section>}
  </PageShell>;
}

function CallButton({ name, phone }: { name: string; phone: string }) {
  return <Button asChild variant="secondary" className="h-auto max-w-full whitespace-normal py-3"><a href={`tel:${phone.replace(/[^+\d]/g, "")}`}><Phone /><span className="break-words">{name} · {phone}</span></a></Button>;
}