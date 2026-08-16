import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Home, Wallet, User, HeartPulse, Settings } from "lucide-react";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/accounts", label: "Accounts", icon: Wallet },
  { to: "/my-details", label: "Details", icon: User },
  { to: "/emergency", label: "Emergency", icon: HeartPulse },
  { to: "/settings", label: "Settings", icon: Settings },
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
  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-3xl px-4 py-5">
          <h1 className="text-3xl font-bold">{title}</h1>
          {intro ? <p className="mt-2 text-lg text-muted-foreground">{intro}</p> : null}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>

      <nav
        aria-label="Main pages"
        className="fixed inset-x-0 bottom-0 border-t bg-card"
      >
        <ul className="mx-auto grid max-w-3xl grid-cols-5">
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
