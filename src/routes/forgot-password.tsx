import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { recoveryEmailSchema } from "@/lib/password-recovery";
import { requestPasswordReset } from "@/lib/password-recovery-service";

export const Route = createFileRoute("/forgot-password")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Forgot password — My Life Folder" },
      {
        name: "description",
        content: "Request a secure email link to reset your My Life Folder password.",
      },
      { property: "og:title", content: "Forgot password — My Life Folder" },
      {
        property: "og:description",
        content: "Recover access to your personal account with an email link.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = recoveryEmailSchema.safeParse(email);
    if (!result.success) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await requestPasswordReset(result.data);
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <PageShell title="Reset your password" intro="Get back to your personal space.">
      <section className="max-w-lg space-y-5 border-t border-border py-6">
        {sent ? (
          <div role="status" className="space-y-3">
            <h2 className="font-display text-xl font-bold">Check your email</h2>
            <p>
              If an account uses this address, you will receive a reset link. Check your spam folder
              too.
            </p>
            <Button variant="outline" onClick={() => setSent(false)}>
              <Mail />
              Send another link
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="recovery-email">Account email address</Label>
              <Input
                id="recovery-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={busy}
              />
            </div>
            <Button type="submit" disabled={busy}>
              <Mail />
              {busy ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}
        {error && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
        <Button variant="ghost" asChild>
          <Link to="/auth" search={{ next: "/" }}>
            <ArrowLeft />
            Back to sign in
          </Link>
        </Button>
      </section>
    </PageShell>
  );
}
