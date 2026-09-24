import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Home,
  Wallet,
  User,
  HeartPulse,
  Settings,
  HelpCircle,
  Sparkles,
  LogIn,
  Map,
  Lightbulb,
  Leaf,
  Stethoscope,
  ChevronRight,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/sitemap")({
  head: () => ({
    meta: [
      { title: "Map of pages — find every page in My Life Folder" },
      {
        name: "description",
        content:
          "A simple map of every page: home, accounts, my details, emergency, appointment notes, settings, help and sign in.",
      },
      { property: "og:title", content: "Map of pages — find every page in My Life Folder" },
      {
        property: "og:description",
        content: "Every page in one simple list, with a short line about what it does.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SitemapPage,
});

const pages = [
  { to: "/" as const, label: "Home", icon: Home, help: "Your big buttons and quick phone numbers." },
  {
    to: "/accounts" as const,
    label: "My accounts",
    icon: Wallet,
    help: "Bank, phone, gas, water and other accounts.",
  },
  {
    to: "/my-details" as const,
    label: "My details",
    icon: User,
    help: "Your name, home address, phone and the people who help you.",
  },
  {
    to: "/emergency" as const,
    label: "Emergency",
    icon: HeartPulse,
    help: "Doctor, allergies, medicine and quick calls like 999 and 111.",
  },
  {
    to: "/appointment" as const,
    label: "Appointment notes",
    icon: Sparkles,
    help: "Say how you feel and get a clear list for the doctor.",
  },
  { to: "/health-tips" as const, label: "Health tips", icon: Lightbulb, help: "Small, easy steps for water, food, sleep and medicine." },
  { to: "/wellness-guides" as const, label: "Wellness guides", icon: Leaf, help: "Calm step-by-step guides for breathing, stress and sleep." },
  { to: "/symptom-checker" as const, label: "Symptom checker", icon: Stethoscope, help: "Yes or no questions to help you choose who to call." },
  {
    to: "/settings" as const,
    label: "Settings",
    icon: Settings,
    help: "See what is saved, make a backup, or clear everything.",
  },
  {
    to: "/faq" as const,
    label: "Help",
    icon: HelpCircle,
    help: "Answers, fixes for problems, screen colours and the contact form.",
  },
  {
    to: "/auth" as const,
    label: "Sign in",
    icon: LogIn,
    help: "Sign in with your email to use your own account.",
  },
  {
    to: "/sitemap" as const,
    label: "Map of pages",
    icon: Map,
    help: "This page. Every page in one list.",
  },
];

function SitemapPage() {
  return (
    <PageShell title="Map of pages" intro="Every page in this app, with a short line about each one.">
      <ul className="space-y-3">
        {pages.map(({ to, label, icon: Icon, help }) => (
          <li key={to}>
            <Link
              to={to}
              className="flex items-center gap-4 rounded-2xl border border-border/60 surface p-4 transition-all duration-300 hover:-translate-y-0.5 hover:glow-edge sm:p-5"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-card/80 ring-1 ring-border/60">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-xl font-bold tracking-wide">{label}</span>
                <span className="block text-base text-muted-foreground">{help}</span>
              </span>
              <ChevronRight className="size-6 shrink-0" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
