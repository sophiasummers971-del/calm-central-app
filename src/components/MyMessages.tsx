import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSessionUser } from "@/lib/auth";

type Msg = {
  id: string;
  created_at: string;
  topic: string | null;
  message: string;
  status: string;
  screenshot_path: string | null;
  screenshot_url?: string | null;
};

const statusText: Record<string, string> = {
  open: "Waiting for us",
  in_progress: "We are working on it",
  resolved: "Done",
};

export function MyMessages() {
  const { user, ready } = useSessionUser();
  const [items, setItems] = useState<Msg[] | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("support_requests")
      .select("id, created_at, topic, message, status, screenshot_path")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(async ({ data }) => {
        const rows = (data as Msg[]) ?? [];
        const withUrls = await Promise.all(
          rows.map(async (m) => {
            if (!m.screenshot_path) return m;
            const { data: signed } = await supabase.storage
              .from("support-screenshots")
              .createSignedUrl(m.screenshot_path, 3600);
            return { ...m, screenshot_url: signed?.signedUrl ?? null };
          }),
        );
        setItems(withUrls);
      });
  }, [user]);

  return (
    <section
      aria-labelledby="my-messages"
      className="mt-8 space-y-4 rounded-2xl border border-border/60 surface p-4 sm:p-5"
    >
      <h2 id="my-messages" className="font-display text-2xl font-bold">
        My messages to help
      </h2>
      {!ready ? null : !user ? (
        <p className="text-base">
          <Link to="/auth" className="font-bold underline">Sign in</Link> to see your messages.
        </p>
      ) : items === null ? (
        <p className="text-base">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-base">No messages yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((m) => (
            <li key={m.id} className="rounded-xl border border-border/50 bg-secondary/60 p-4">
              <p className="text-lg font-bold">{m.topic || "Message"}</p>
              <p className="text-base">
                {new Date(m.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                · <strong>{statusText[m.status] ?? m.status}</strong>
                {m.screenshot_path ? " · picture added" : ""}
              </p>
              <p className="mt-2 whitespace-pre-wrap break-words text-base">{m.message}</p>
              {m.screenshot_url ? (
                <a href={m.screenshot_url} target="_blank" rel="noreferrer" className="mt-3 block">
                  <img
                    src={m.screenshot_url}
                    alt="Picture you added to this message"
                    className="max-h-48 rounded-xl border border-border/50"
                  />
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      <Link to="/support" className="inline-block text-lg font-bold underline">
        Send a new message
      </Link>
    </section>
  );
}
