import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight, ChevronDown, ChevronRight, FolderHeart, Home, Menu, PanelLeftClose, PanelLeftOpen, Search, Settings, X } from "lucide-react";
import { useSessionUser } from "@/lib/auth";
import { navigationGroups, navigationItems } from "@/lib/navigation";
import { AccountAvatar } from "@/components/account-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function NavGroups({ compact, onNavigate }: { compact: boolean; onNavigate?: () => void }) {
  const [open, setOpen] = useState<Record<string, boolean>>({ "Your life": true, "Your health": true, "Your space": true });
  return <nav aria-label="Main pages" className="space-y-5">
    <Link to="/" onClick={onNavigate} title={compact ? "Overview" : undefined} activeOptions={{ exact: true }} activeProps={{ className: "nav-selected" }} className={`nav-link ${compact ? "justify-center" : ""}`}><Home className="size-5 shrink-0" />{!compact && <span>Overview</span>}</Link>
    {navigationGroups.map((group) => <div key={group.label}>
      {!compact && <Button variant="ghost" aria-expanded={open[group.label]} onClick={() => setOpen({ ...open, [group.label]: !open[group.label] })} className="mb-1 h-8 w-full justify-between px-3 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground">{group.label}<ChevronDown className={`transition-transform ${open[group.label] ? "rotate-180" : ""}`} /></Button>}
      <div className={`grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none ${compact || open[group.label] ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <ul className="overflow-hidden space-y-1">
          {group.items.map(({ to, label, icon: Icon }) => <li key={to}><Link to={to} onClick={onNavigate} title={compact ? label : undefined} activeProps={{ className: "nav-selected" }} className={`nav-link ${compact ? "justify-center" : ""}`}><Icon className="size-[1.05rem] shrink-0" />{!compact && <span>{label}</span>}</Link></li>)}
        </ul>
      </div>
    </div>)}
  </nav>;
}

export function PageShell({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  const { user } = useSessionUser();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const group = navigationGroups.find((item) => item.items.some((page) => page.to === location.pathname));
  const results = navigationItems.filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(search.toLowerCase()));
  useEffect(() => { setCompact(localStorage.getItem("mycare.compact-nav") === "true"); }, []);
  useEffect(() => {
    if (!menuOpen) return;
    closeButton.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setMenuOpen(false); menuButton.current?.focus(); } };
    document.addEventListener("keydown", escape);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", escape); };
  }, [menuOpen]);
  const toggleCompact = () => { setCompact(!compact); localStorage.setItem("mycare.compact-nav", String(!compact)); };
  return <div className={`app-layout ${compact ? "app-layout-compact" : ""}`}>
    <a href="#page-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-primary focus:p-3 focus:text-primary-foreground">Skip to content</a>
    <aside className="desktop-sidebar">
      <Link to="/" className={`mb-7 flex items-center gap-3 px-2 ${compact ? "justify-center" : ""}`} title="My Life Folder"><FolderHeart className="size-8 shrink-0 text-primary" />{!compact && <span className="font-display text-sm font-bold">My Life<br />Folder<span className="text-accent">.</span></span>}</Link>
      <NavGroups compact={compact} />
      <div className="mt-6 border-t border-border pt-4"><Button variant="ghost" size={compact ? "icon" : "default"} className="w-full text-muted-foreground hover:bg-secondary hover:text-foreground" onClick={toggleCompact} aria-label={compact ? "Expand sidebar" : "Collapse sidebar"} title={compact ? "Expand sidebar" : "Collapse sidebar"}>{compact ? <PanelLeftOpen /> : <><PanelLeftClose />Collapse sidebar</>}</Button></div>
    </aside>
    {menuOpen && <div className="fixed inset-0 z-40 lg:hidden">
      <Button variant="ghost" className="absolute inset-0 h-full w-full rounded-none bg-background/80" aria-label="Close navigation overlay" onClick={() => setMenuOpen(false)} />
      <aside aria-label="Mobile navigation" className="absolute inset-y-0 left-0 w-72 max-w-[88vw] overflow-y-auto border-r border-border bg-sidebar p-4 animate-in slide-in-from-left motion-reduce:animate-none">
        <div className="mb-5 flex items-center justify-between"><Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 font-display text-sm font-bold"><FolderHeart className="text-primary" />My Life Folder</Link><Button ref={closeButton} variant="ghost" size="icon" aria-label="Close menu" onClick={() => { setMenuOpen(false); menuButton.current?.focus(); }}><X /></Button></div><NavGroups compact={false} onNavigate={() => setMenuOpen(false)} />
      </aside>
    </div>}
    <div className="min-w-0">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[76rem] items-center gap-3 px-4 py-3 sm:px-8">
          <Button ref={menuButton} variant="outline" size="icon" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)} className="shrink-0 lg:hidden"><Menu /></Button>
          <div className="flex min-w-0 flex-1 items-center gap-2 text-sm"><span className="hidden text-muted-foreground sm:inline">{group?.label || "Your folder"}</span><ChevronRight className="hidden size-3 text-muted-foreground sm:block" /><span className="truncate font-medium">{title === "My Life Folder" ? "Overview" : title}</span></div>
          <Button variant="ghost" size="icon" onClick={() => { setSearch(""); setSearchOpen(true); }} aria-label="Search pages" title="Search pages" className="shrink-0 hover:bg-secondary hover:text-foreground"><Search /></Button>
          <Button variant="ghost" size="icon" asChild className="hidden hover:bg-secondary hover:text-foreground sm:inline-flex"><Link to="/settings" aria-label="Settings" title="Settings"><Settings /></Link></Button>
          <Link to="/auth" aria-label={user ? "My account" : "Sign in"} title={user ? "My account" : "Sign in"} className="shrink-0"><AccountAvatar user={user} className="size-9" /></Link>
        </div>
      </header>
      <main id="page-content" className="page-enter mx-auto max-w-[76rem] px-4 py-7 sm:px-8 sm:py-9">
        <h1 className="break-words font-display text-2xl font-bold sm:text-3xl">{title}</h1>
        {intro && <p className="mt-2 max-w-2xl text-base text-muted-foreground">{intro}</p>}
        <div className="mt-6">{children}</div>
      </main>
    </div>
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}><DialogContent className="max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>Find your page</DialogTitle></DialogHeader><Input aria-label="Search pages" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your folder…" /><ul className="divide-y divide-border">{results.map(({ to, label, detail, icon: Icon }) => <li key={to}><Link to={to} onClick={() => setSearchOpen(false)} className="flex items-center gap-3 rounded-md px-2 py-3 hover:bg-secondary"><Icon className="size-5 text-primary" /><span className="min-w-0 flex-1"><span className="block font-semibold">{label}</span><span className="block text-sm text-muted-foreground">{detail}</span></span><ArrowUpRight className="size-4" /></Link></li>)}</ul>{results.length === 0 && <p className="text-muted-foreground">No matching pages.</p>}</DialogContent></Dialog>
  </div>;
}