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
    <div className="min-h-dvh pb-24 sm:pb-28">
      <header className="sticky top-0 z-20 border-b border-border/60 surface">
        <div className="mx-auto max-w-3xl px-3 py-4 sm:px-5 sm:py-5">
          <div className="grid grid-cols-1 items-center gap-3 min-[380px]:grid-cols-[minmax(0,1fr)_auto]">
            <h1 className="min-w-0 break-words font-display text-2xl font-bold sm:text-3xl">{title}</h1>
            <Link
              to="/auth"
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-border/70 bg-card/60 px-3 py-2 text-sm font-semibold transition-colors hover:bg-secondary sm:px-4 sm:py-3 sm:text-base"
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
          {intro ? <p className="mt-2 max-w-2xl text-base text-muted-foreground sm:text-lg">{intro}</p> : null}
          <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <ReadAloudButton targetId="page-content" />
            <BigTextButton />
          </div>
          <div className="gold-rule mt-4 h-px w-full" aria-hidden="true" />
        </div>
      </header>

      <main id="page-content" className="mx-auto max-w-3xl px-3 py-4 sm:px-5 sm:py-6">
        {children}
      </main>

      <nav
        aria-label="Main pages"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 surface"
      >
        <ul className="mx-auto grid max-w-3xl grid-cols-6 px-1 sm:px-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                activeOptions={{ exact: to === "/" }}
                activeProps={{ className: "bg-secondary text-secondary-foreground" }}
                className="flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 rounded-md px-0.5 py-2 text-center text-[0.65rem] font-semibold leading-tight text-muted-foreground sm:min-h-18 sm:px-2 sm:py-3 sm:text-xs"
              >
                <Icon className="size-5 shrink-0 sm:size-6" aria-hidden="true" />
                <span className="max-w-full break-all">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
