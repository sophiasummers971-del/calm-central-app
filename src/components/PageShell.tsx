import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { ChevronDown, Menu, X, Home, Wallet, User, HeartPulse, Settings, HelpCircle, Mail, FolderOpen, CalendarDays, Sparkles, Target, Stethoscope, MessageSquare, Map as MapIcon, BookOpen, Leaf } from "lucide-react";
import { useSessionUser } from "@/lib/auth";
import { AccountAvatar } from "@/components/account-avatar";

const groups = [
  { label: "Personal", items: [
    { to: "/my-details", label: "My details", icon: User },
    { to: "/accounts", label: "Accounts", icon: Wallet },
    { to: "/inbox", label: "Inbox", icon: Mail },
    { to: "/files", label: "Files", icon: FolderOpen },
    { to: "/calendar", label: "Calendar", icon: CalendarDays },
  ] },
  { label: "Health", items: [
    { to: "/emergency", label: "Emergency", icon: HeartPulse },
    { to: "/appointment", label: "Appointment notes", icon: Sparkles },
    { to: "/goal-progress", label: "Goal progress", icon: Target },
    { to: "/symptom-checker", label: "Symptom checker", icon: Stethoscope },
    { to: "/health-tips", label: "Health tips", icon: Leaf },
    { to: "/wellness-guides", label: "Wellness guides", icon: BookOpen },
  ] },
  { label: "Help", items: [
    { to: "/faq", label: "Help and FAQ", icon: HelpCircle },
    { to: "/support", label: "Send us a message", icon: MessageSquare },
    { to: "/sitemap", label: "Map of pages", icon: MapIcon },
    { to: "/settings", label: "Settings", icon: Settings },
  ] },
] as const;

function NavGroups({ onNavigate }: { onNavigate?: () => void }) {
  const [open, setOpen] = useState<Record<string, boolean>>({ Personal: true, Health: true, Help: true });
  return (
    <nav aria-label="Main pages" className="space-y-2">
      <Link to="/" onClick={onNavigate} activeOptions={{ exact: true }} activeProps={{ className: "bg-secondary text-primary" }} className="flex min-h-11 items-center gap-3 rounded-md px-3 font-semibold hover:bg-secondary">
        <Home className="size-5" aria-hidden="true" /> Overview
      </Link>
      {groups.map((g) => {
        const isOpen = open[g.label];
        return (
          <div key={g.label}>
            <button type="button" aria-expanded={isOpen} onClick={() => setOpen({ ...open, [g.label]: !isOpen })} className="flex min-h-11 w-full items-center justify-between rounded-md px-3 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground hover:bg-secondary">
              {g.label}
              <ChevronDown className={`size-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
            <div className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
              <ul className="overflow-hidden border-l border-border/60 ml-4 pl-2">
                {g.items.map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <Link to={to} onClick={onNavigate} activeProps={{ className: "bg-secondary text-primary" }} className="flex min-h-10 items-center gap-3 rounded-md px-3 text-base hover:bg-secondary">
                      <Icon className="size-5 shrink-0" aria-hidden="true" /> {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

export function PageShell({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  const { user, ready } = useSessionUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const name: unknown = user?.user_metadata["full_name"];
  const greeting = ready && user ? `Hello, ${typeof name === "string" && name.trim() ? name.trim().split(" ")[0] : "welcome back"}` : "Welcome";

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="hidden border-r border-border/60 bg-sidebar p-4 lg:sticky lg:top-0 lg:block lg:h-dvh lg:overflow-y-auto">
        <p className="mb-4 px-3 font-display text-lg font-bold text-primary">My Life Folder</p>
        <NavGroups />
      </aside>

      {menuOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-background/70" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto border-r border-border/60 bg-sidebar p-4 animate-in slide-in-from-left duration-300">
            <div className="mb-4 flex items-center justify-between px-3">
              <p className="font-display text-lg font-bold text-primary">My Life Folder</p>
              <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} className="rounded-md p-2 hover:bg-secondary"><X className="size-5" /></button>
            </div>
            <NavGroups onNavigate={() => setMenuOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/95">
          <div className="mx-auto flex max-w-4xl items-center gap-3 px-3 py-3 sm:px-5">
            <button type="button" aria-label="Open menu" onClick={() => setMenuOpen(true)} className="rounded-md border border-border/60 p-2 lg:hidden"><Menu className="size-6" /></button>
            <p className="min-w-0 flex-1 truncate text-base text-muted-foreground">{greeting}</p>
            <Link to="/auth" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border/70 bg-card px-3 text-sm font-semibold hover:bg-secondary">
              <AccountAvatar user={user} className="size-8" />
              {ready && user ? "My account" : "Sign in"}
            </Link>
          </div>
        </header>
        <main id="page-content" className="mx-auto max-w-4xl px-3 py-5 sm:px-5 sm:py-6">
          <h1 className="break-words font-display text-2xl font-bold sm:text-3xl">{title}</h1>
          {intro ? <p className="mt-2 max-w-2xl text-base text-muted-foreground sm:text-lg">{intro}</p> : null}
          <div className="mt-5">{children}</div>
        </main>
      </div>
    </div>
  );
}
