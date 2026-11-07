import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  FolderOpen,
  LogIn,
  UserPlus,
  LogOut,
  Mail,
  Settings,
  UserRound,
} from "lucide-react";
import { AccountAvatar } from "@/components/account-avatar";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useSessionUser } from "@/lib/auth";
import { oauthReturnPath } from "@/lib/oauth-return-path";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({ next: oauthReturnPath(search["next"]) }),
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "My account and identity — My Life Folder" },
      {
        name: "description",
        content:
          "View your account identity, sign-in details, personal settings and connected service pages.",
      },
      { property: "og:title", content: "My account and identity — My Life Folder" },
      {
        property: "og:description",
        content: "Your account identity, personal settings and Google service pages in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, ready } = useSessionUser();
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const fullName: unknown = user?.user_metadata["full_name"];
  const displayName =
    typeof fullName === "string" && fullName.trim() ? fullName : "Your personal account";

  useEffect(() => {
    setMessage("");
  }, [user]);

  const signIn = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setMessage("Sorry, that email or password did not work.");
      return;
    }
    setPassword("");
    void navigate({ href: next });
  };

  const signUp = async () => {
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: new URL(next, window.location.origin).href },
    });
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage(
      data.session
        ? "Your account is ready."
        : "Almost done. Please open the email we sent you and click the link.",
    );
    if (data.session) void navigate({ href: next });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setMessage("You are signed out.");
  };

  return (
    <PageShell title="My account" intro="Your identity, your preferences, your space.">
      {ready && user ? (
        <div className="space-y-7">
          <section className="flex flex-wrap items-center gap-5 border-b border-border pb-6">
            <AccountAvatar user={user} className="size-20" />
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-xs font-semibold text-primary">Signed in</p>
              <h2 className="break-words font-display text-xl font-bold">{displayName}</h2>
              <p className="mt-2 break-words text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/settings">
                <Settings />
                Account settings
              </Link>
            </Button>
          </section>
          <section>
            <h2 className="mb-4 font-display text-lg font-bold">Account details</h2>
            <dl className="grid gap-5 sm:grid-cols-3">
              <div>
                <dt className="text-xs text-muted-foreground">Email address</dt>
                <dd className="mt-1 break-words text-sm">{user.email || "Not provided"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Member since</dt>
                <dd className="mt-1 text-sm">
                  {new Date(user.created_at).toLocaleDateString("en-GB")}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Email confirmation</dt>
                <dd className="mt-1 text-sm">
                  {user.email_confirmed_at ? "Confirmed" : "Awaiting confirmation"}
                </dd>
              </div>
            </dl>
          </section>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" asChild>
              <Link to="/my-details">
                <UserRound />
                My personal details
                <ArrowUpRight />
              </Link>
            </Button>
            <Button variant="outline" onClick={signOut}>
              <LogOut />
              Sign out
            </Button>
          </div>
          <section className="border-t border-border pt-6">
            <h2 className="mb-4 font-display text-lg font-bold">Your Google services</h2>
            <ul className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  { to: "/inbox", label: "Gmail", icon: Mail },
                  { to: "/files", label: "Google Drive", icon: FolderOpen },
                  { to: "/calendar", label: "Google Calendar", icon: CalendarDays },
                ] as const
              ).map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="explore-tile flex items-center gap-3 rounded-lg border border-border bg-card p-4"
                  >
                    <Icon className="size-5 text-primary" />
                    <span className="flex-1 text-sm font-semibold">{label}</span>
                    <ArrowUpRight className="size-4" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <p className="border-t border-border pt-4 text-xs text-muted-foreground">
            Health notes and saved details remain on this device. Google services require separate
            consent.
          </p>
        </div>
      ) : (
        <section className="max-w-lg space-y-4 border-t border-border py-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-lg">
              Your email address
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className="h-16 text-lg"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-lg">
              A password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              className="h-16 text-lg"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <p className="text-base text-muted-foreground">
              Use at least 6 characters. Never share your password.
            </p>
          </div>

          <Button className="h-16 w-full text-lg" disabled={busy} onClick={() => void signIn()}>
            <LogIn className="size-6" aria-hidden="true" /> Sign in
          </Button>
          <Button variant="link" asChild>
            <Link to="/forgot-password">Forgot your password?</Link>
          </Button>
          <Button
            variant="secondary"
            className="h-16 w-full text-lg"
            disabled={busy}
            onClick={() => void signUp()}
          >
            <UserPlus className="size-6" aria-hidden="true" /> Make a new account
          </Button>
        </section>
      )}

      {message ? (
        <p
          role="status"
          className="mt-6 rounded-xl bg-secondary p-4 text-center text-lg font-semibold"
        >
          {message}
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-4">
        <Button variant="link" asChild><Link to="/privacy">Privacy notice</Link></Button>
        <Button variant="link" asChild><Link to="/terms">Terms of use</Link></Button>
      </div>
    </PageShell>
  );
}
