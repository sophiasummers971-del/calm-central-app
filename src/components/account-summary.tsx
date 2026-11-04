import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Settings, UserRound } from "lucide-react";
import { AccountAvatar } from "@/components/account-avatar";
import { Button } from "@/components/ui/button";
import { useSessionUser } from "@/lib/auth";

export function AccountSummary() {
  const { user, ready } = useSessionUser();
  const fullName: unknown = user?.user_metadata["full_name"];
  const name = typeof fullName === "string" && fullName.trim() ? fullName : user ? "Your personal account" : "Your personal space";
  return <section aria-label="Account overview" className="flex flex-wrap items-center gap-4 border-y border-border/70 py-5">
    <AccountAvatar user={user} className="size-12 shrink-0" />
    <div className="min-w-0 flex-1 basis-40">
      <p className="break-words font-semibold">{ready ? name : "Loading your account…"}</p>
      <p className="break-words text-sm text-muted-foreground">{user?.email || "Not signed in"}</p>
    </div>
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" asChild><Link to="/auth"><UserRound />{user ? "My account" : "Sign in"}<ArrowUpRight /></Link></Button>
      <Button variant="ghost" size="icon" asChild><Link to="/settings" aria-label="Open settings" title="Settings"><Settings /></Link></Button>
    </div>
  </section>;
}