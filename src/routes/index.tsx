import { createFileRoute, Link } from "@tanstack/react-router";
import { Wallet, User, HeartPulse, Phone, ChevronRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useAccounts, useHealthInfo, useMyDetails, usePeople } from "@/lib/local-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "My Life Folder — one clear place for your accounts" },
      {
        name: "description",
        content:
          "A calm, easy dashboard to keep your accounts, home address, phone contacts and emergency details in one clear view.",
      },
      { property: "og:title", content: "My Life Folder — one clear place for your accounts" },
      {
        property: "og:description",
        content: "Keep your accounts, contacts and emergency details in one easy view.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { value: accounts, ready } = useAccounts();
  const { value: details } = useMyDetails();
  const { value: health } = useHealthInfo();
  const { value: people } = usePeople();

  const tiles = [
    {
      to: "/accounts" as const,
      label: "My accounts",
      icon: Wallet,
      tile: "bg-tile-accounts",
      line: ready ? `${accounts.length} saved` : "Loading…",
      help: "Bank, phone, electricity and more.",
    },
    {
      to: "/my-details" as const,
      label: "My details",
      icon: User,
      tile: "bg-tile-details",
      line: details.fullName ? details.fullName : "Not filled in yet",
      help: "Your name, home address and phone.",
    },
    {
      to: "/emergency" as const,
      label: "Emergency",
      icon: HeartPulse,
      tile: "bg-tile-emergency",
      line: health.gpName ? `Doctor: ${health.gpName}` : "Not filled in yet",
      help: "Doctor, allergies, medicine, helpers.",
    },
  ];

  const firstHelper = people[0];

  return (
    <PageShell
      title="My Life Folder"
      intro="Everything about you, in one calm place. Tap a big button below."
    >
      <ul className="space-y-4">
        {tiles.map(({ to, label, icon: Icon, tile, line, help }) => (
          <li key={to}>
            <Link
              to={to}
              className={`flex items-center gap-4 rounded-2xl border border-border/60 p-5 ${tile} shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-0.5 hover:glow-edge`}
            >
              <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-card/80 ring-1 ring-border/60">
                <Icon className="size-7" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-2xl font-bold tracking-wide">{label}</span>
                <span className="block text-base text-muted-foreground">{help}</span>
                <span className="mt-1 block truncate text-base font-semibold">{line}</span>
              </span>
              <ChevronRight className="size-7 shrink-0" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-8 rounded-2xl border border-border/60 surface p-5" aria-labelledby="help-now">
        <h2 id="help-now" className="font-display text-2xl font-bold tracking-wide">
          Need help now?
        </h2>
        <p className="mt-1 text-base text-muted-foreground">
          These are your quick phone numbers.
        </p>
        <div className="mt-4 space-y-3">
          {firstHelper?.phone ? (
            <CallButton name={firstHelper.name} phone={firstHelper.phone} />
          ) : null}
          {health.gpPhone ? (
            <CallButton name={health.gpName || "My doctor"} phone={health.gpPhone} />
          ) : null}
          {!firstHelper?.phone && !health.gpPhone ? (
            <p className="text-base">
              No numbers yet. Add them on the{" "}
              <Link to="/emergency" className="font-bold underline">
                Emergency page
              </Link>
              .
            </p>
          ) : null}
        </div>
      </section>
    </PageShell>
  );
}

function CallButton({ name, phone }: { name: string; phone: string }) {
  return (
    <a
      href={`tel:${phone.replace(/[^+\d]/g, "")}`}
      className="flex items-center gap-3 rounded-xl bg-primary px-5 py-4 text-lg font-bold text-primary-foreground"
    >
      <Phone className="size-6" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">
        Call {name} — {phone}
      </span>
    </a>
  );
}
