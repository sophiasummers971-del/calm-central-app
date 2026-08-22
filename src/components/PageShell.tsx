import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Home,
  Wallet,
  User,
  HeartPulse,
  Settings,
  LogIn,
  CircleUser,
  HelpCircle,
} from "lucide-react";
import { ReadAloudButton } from "@/components/ReadAloudButton";
import { BigTextButton } from "@/components/BigTextButton";
import { useSessionUser } from "@/lib/auth";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/accounts", label: "Accounts", icon: Wallet },
  { to: "/my-details", label: "Details", icon: User },
  { to: "/emergency", label: "Emergency", icon: HeartPulse },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/faq", label: "Help", icon: HelpCircle },
] as const;


export function PageShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  const { user, ready } = useSessionUser();

  return (
    <div className="min-h-screen pb-28">
      <header className="sticky top-0 z-20 border-b border-border/60 surface">
        <div className="mx-auto max-w-3xl px-4 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-display text-3xl font-bold tracking-wide">{title}</h1>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card/60 px-4 py-3 text-base font-semibold transition-colors hover:bg-secondary"
            >
              {ready && user ? (
                <>
                  <CircleUser className="size-6" aria-hidden="true" />
                  My account
                </>
              ) : (
                <>
                  <LogIn className="size-6" aria-hidden="true" />
                  Sign in
                </>
              )}
            </Link>
          </div>
          {intro ? <p className="mt-2 text-lg text-muted-foreground">{intro}</p> : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <ReadAloudButton targetId="page-content" />
            <BigTextButton />
          </div>
          <div className="gold-rule mt-4 h-px w-full" aria-hidden="true" />
        </div>
      </header>

      <main id="page-content" className="mx-auto max-w-3xl px-4 py-6">
        {children}
      </main>

      <nav
        aria-label="Main pages"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 surface"
      >
        <ul className="mx-auto grid max-w-3xl grid-cols-6">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                activeOptions={{ exact: to === "/" }}
                activeProps={{ className: "bg-secondary text-secondary-foreground" }}
                className="flex flex-col items-center gap-1 px-1 py-3 text-center text-xs font-semibold text-muted-foreground"
              >
                <Icon className="size-6" aria-hidden="true" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
