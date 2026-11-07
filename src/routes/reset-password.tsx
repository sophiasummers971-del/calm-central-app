import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound, Mail } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { newPasswordSchema } from "@/lib/password-recovery";
import { updateRecoveredPassword } from "@/lib/password-recovery-service";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Choose a new password — My Life Folder" },
      {
        name: "description",
        content: "Securely choose a new password after opening your My Life Folder recovery email.",
      },
      { property: "og:title", content: "Choose a new password — My Life Folder" },
      {
        property: "og:description",
        content: "Complete account recovery and return to your personal folder.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [access, setAccess] = useState<"loading" | "ready" | "unavailable">("loading");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const lifecycle = { active: true };
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (lifecycle.active) setAccess(session ? "ready" : "unavailable");
    });
    void supabase.auth
      .getSession()
      .then(({ data: sessionData, error: sessionError }) => {
        if (lifecycle.active)
          setAccess(!sessionError && sessionData.session ? "ready" : "unavailable");
      })
      .catch(() => {
        if (lifecycle.active) setAccess("unavailable");
      });
    return () => {
      lifecycle.active = false;
      data.subscription.unsubscribe();
    };
  }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = newPasswordSchema.safeParse({ password, confirmation });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Check your password.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await updateRecoveredPassword(password, confirmation);
      setPassword("");
      setConfirmation("");
      setDone(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please request a new link.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <PageShell title="Choose a new password" intro="A fresh start for your account.">
      <section className="max-w-lg space-y-5 border-t border-border py-6">
        {done ? (
          <div role="status" className="space-y-4">
            <h2 className="font-display text-xl font-bold">Password updated</h2>
            <p>Your new password is ready to use.</p>
            <Button asChild>
              <Link to="/auth" search={{ next: "/" }}>
                Go to my account
              </Link>
            </Button>
          </div>
        ) : access === "loading" ? (
          <p role="status">Checking your reset link…</p>
        ) : access === "unavailable" ? (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold">A new link is needed</h2>
            <p>
              Open the latest reset email. If the link has expired or already been used, request
              another one.
            </p>
            <Button asChild>
              <Link to="/forgot-password">
                <Mail />
                Request a new link
              </Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                disabled={busy}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Use a long, unique password with at least 6 characters.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                disabled={busy}
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
              />
            </div>
            <Button type="submit" disabled={busy}>
              <KeyRound />
              {busy ? "Updating…" : "Save new password"}
            </Button>
          </form>
        )}
        {error && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
      </section>
    </PageShell>
  );
}
