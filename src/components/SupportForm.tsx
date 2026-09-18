import { useRef, useState } from "react";
import { Paperclip, Send } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MicButton } from "@/components/MicButton";
import { supabase } from "@/integrations/supabase/client";
import { useSessionUser } from "@/lib/auth";

const schema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please write a real email address, like name@example.com" })
    .max(255, { message: "That email is too long" }),
  topic: z.string().trim().max(120, { message: "Please keep the subject shorter" }),
  message: z
    .string()
    .trim()
    .nonempty({ message: "Please tell us what went wrong" })
    .max(4000, { message: "Please keep your message under 4000 characters" }),
});

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export function SupportForm() {
  const { user } = useSessionUser();
  const fileRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const parsed = schema.safeParse({ email: email || user?.email || "", topic, message });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the boxes above");
      return;
    }

    if (file && file.size > MAX_FILE_BYTES) {
      setError("That picture is too big. Please choose one under 5 MB.");
      return;
    }

    setBusy(true);
    try {
      let screenshotPath: string | null = null;

      if (file) {
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-").slice(-60);
        const path = `${crypto.randomUUID()}-${safeName}`;
        const upload = await supabase.storage.from("support-screenshots").upload(path, file);
        if (upload.error) throw upload.error;
        screenshotPath = upload.data.path;
      }

      const insert = await supabase.from("support_requests").insert({
        user_id: user?.id ?? null,
        email: parsed.data.email,
        topic: parsed.data.topic || null,
        message: parsed.data.message,
        screenshot_path: screenshotPath,
      });
      if (insert.error) throw insert.error;

      setDone(true);
      setTopic("");
      setMessage("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      setError("Sorry, that did not send. Please check you are online and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border bg-secondary p-4 text-lg">
        <p className="font-bold">Thank you — your message is with us.</p>
        <p className="mt-1">
          We will reply by email to <span className="font-semibold">{email || user?.email}</span>.
          You can send another message any time.
        </p>
        <Button className="mt-4 h-14 text-lg" onClick={() => setDone(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form className="mt-4 space-y-5" onSubmit={submit}>
      <div>
        <Label htmlFor="support-email" className="text-lg font-semibold">
          Your email address
        </Label>
        <p className="text-base text-muted-foreground">We use this to send the answer back.</p>
        <Input
          id="support-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={255}
          value={email || user?.email || ""}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className="mt-2 h-14 text-lg"
        />
      </div>

      <div>
        <Label htmlFor="support-topic" className="text-lg font-semibold">
          What is it about? (optional)
        </Label>
        <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <Input
            id="support-topic"
            maxLength={120}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="For example: my information disappeared"
            className="h-14 text-lg"
          />
          <MicButton
            label="what it is about"
            onText={(text) => setTopic((prev) => (prev ? `${prev} ${text}` : text))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="support-message" className="text-lg font-semibold">
          Tell us what happened
        </Label>
        <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <Textarea
            id="support-message"
            rows={5}
            maxLength={4000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What were you doing, and what went wrong?"
            className="text-lg"
          />
          <MicButton
            label="what happened"
            onText={(text) => setMessage((prev) => (prev ? `${prev} ${text}` : text))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="support-file" className="text-lg font-semibold">
          Add a picture of the screen (optional)
        </Label>
        <p className="text-base text-muted-foreground">
          A screenshot helps us see the problem. Pictures up to 5 MB.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            id="support-file"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            variant="secondary"
            className="h-14 text-lg"
            onClick={() => fileRef.current?.click()}
          >
            <Paperclip className="size-5" aria-hidden="true" />
            Choose a picture
          </Button>
          <span className="text-base text-muted-foreground">
            {file ? file.name : "No picture chosen"}
          </span>
        </div>
      </div>

      {error ? (
        <p role="alert" className="rounded-xl border border-destructive p-3 text-lg font-semibold">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={busy} className="h-16 w-full text-xl">
        <Send className="size-6" aria-hidden="true" />
        {busy ? "Sending…" : "Send my message"}
      </Button>
    </form>
  );
}
