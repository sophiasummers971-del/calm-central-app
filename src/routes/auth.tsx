import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogIn, UserPlus, LogOut } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useSessionUser } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in with your email — My Life Folder" },
      {
        name: "description",
        content:
          "Sign in with your email address so your folder belongs to your own account on any device.",
      },
      { property: "og:title", content: "Sign in with your email — My Life Folder" },
      {
        property: "og:description",
        content: "Use your email address to sign in to your own private folder.",
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

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
    void navigate({ to: "/" });
  };

  const signUp = async () => {
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
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
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setMessage("You are signed out.");
  };

  return (
    <PageShell
      title="My account"
      intro="Sign in with your email address. Then your folder is yours on any device."
    >
      {ready && user ? (
        <section className="rounded-2xl border-border/60 surface p-5">
          <h2 className="text-2xl font-bold">You are signed in</h2>
          <p className="mt-2 break-words text-lg">{user.email}</p>
          <Button variant="secondary" className="mt-4 h-16 w-full text-lg" onClick={signOut}>
            <LogOut className="size-6" aria-hidden="true" /> Sign out
          </Button>
        </section>
      ) : (
        <section className="space-y-4 rounded-2xl border-border/60 surface p-5">
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
              Use at least 6 letters or numbers. Write it somewhere safe.
            </p>
          </div>

          <Button className="h-16 w-full text-lg" disabled={busy} onClick={() => void signIn()}>
            <LogIn className="size-6" aria-hidden="true" /> Sign in
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
        <p role="status" className="mt-6 rounded-xl bg-secondary p-4 text-center text-lg font-semibold">
          {message}
        </p>
      ) : null}
    </PageShell>
  );
}
