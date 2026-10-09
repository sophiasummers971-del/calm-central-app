import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, Link2, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSessionUser } from "@/lib/auth";
import { completeGoogleConnect, disconnectGoogle, getGoogleStatus, startGoogleConnect } from "@/lib/google.functions";
import { googleProducts, type GoogleConnectorId } from "@/lib/google-config";

function waitForPopup(popup: Window, connectorId: string) {
  return new Promise<string | null>((resolve, reject) => {
    const cleanup = () => { window.removeEventListener("message", onMessage); window.clearInterval(poll); };
    const onMessage = (event: MessageEvent) => {
      const d: unknown = event.data;
      if (event.origin !== window.location.origin || event.source !== popup || !d || typeof d !== "object") return;
      const msg = d as { type?: string; connectorId?: string; code?: unknown };
      if (msg.connectorId !== connectorId) return;
      if (msg.type === "appUserConnectorOAuthComplete") { cleanup(); resolve(typeof msg.code === "string" ? msg.code : null); }
      else if (msg.type === "appUserConnectorOAuthFailed") { cleanup(); popup.close(); reject(new Error("Google connection was not completed.")); }
    };
    window.addEventListener("message", onMessage);
    const poll = window.setInterval(() => { if (popup.closed) { cleanup(); reject(new Error("The Google window was closed before finishing.")); } }, 500);
  });
}

export function GooglePanel({ connectorId, emptyText }: { connectorId: GoogleConnectorId; emptyText: string }) {
  const label = googleProducts.find((p) => p.id === connectorId)?.label ?? "Google";
  const { user, ready } = useSessionUser();
  const qc = useQueryClient();
  const statusFn = useServerFn(getGoogleStatus);
  const startFn = useServerFn(startGoogleConnect);
  const completeFn = useServerFn(completeGoogleConnect);
  const disconnectFn = useServerFn(disconnectGoogle);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const queryKey = ["google", connectorId, user?.id];
  const status = useQuery({ queryKey, queryFn: () => statusFn({ data: { connectorId } }), enabled: !!user });

  if (!ready) return <p className="text-base text-muted-foreground">Loading…</p>;
  if (!user) return (
    <div className="rounded-lg border border-border/60 surface p-5">
      <p className="text-lg">Please sign in first, then connect your own {label}.</p>
      <Link to="/auth" className="mt-3 inline-flex font-bold underline">Sign in</Link>
    </div>
  );

  const connect = async () => {
    setNotice("");
    const popup = window.open("", "lovable-oauth", "width=600,height=720");
    if (!popup) { setNotice("Your browser blocked the Google window. Please allow pop-ups and try again."); return; }
    setBusy(true);
    try {
      const { authorizationUrl } = await startFn({ data: { connectorId } });
      const done = waitForPopup(popup, connectorId);
      popup.location.href = authorizationUrl;
      const code = await done;
      if (code) await completeFn({ data: { code, connectorId } });
      await qc.invalidateQueries({ queryKey });
      setNotice(`Connected to ${label}.`);
    } catch (e) {
      popup.close();
      setNotice(e instanceof Error ? e.message : "Something went wrong.");
    } finally { setBusy(false); }
  };
  const disconnect = async () => {
    setBusy(true);
    try { await disconnectFn({ data: { connectorId } }); await qc.invalidateQueries({ queryKey }); setNotice(`${label} disconnected.`); }
    catch (e) { setNotice(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setBusy(false); }
  };

  const s = status.data;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 surface p-4">
        <div className="min-w-0">
          <p className="font-display text-lg font-bold">{s?.connected ? `${label} connected` : s?.reconnectRequired ? `Reconnect ${label}` : `${label} not connected`}</p>
          <p className="truncate text-base text-muted-foreground">{s?.reconnectRequired ? `Your ${label} access needs to be renewed.` : s?.account || "Only you can see your own Google data here."}</p>
        </div>
        {s?.connected && !s.reconnectRequired ? (
          <Button variant="outline" onClick={disconnect} disabled={busy}><Unlink className="size-5" aria-hidden="true" /> Disconnect</Button>
        ) : (
          <Button onClick={connect} disabled={busy || status.isLoading}><Link2 className="size-5" aria-hidden="true" /> {s?.reconnectRequired ? `Reconnect ${label}` : `Connect my ${label}`}</Button>
        )}
      </div>
      {notice ? <p role="status" className="text-base font-semibold">{notice}</p> : null}
      {status.isLoading ? <p className="text-base text-muted-foreground">Loading your {label}…</p> : null}
      {status.error ? <p className="text-base text-destructive">Could not check your {label}. Please try again.</p> : null}
      {s?.error ? <p className="text-base text-destructive">{s.error}</p> : null}
      {s?.connected && !s.error && s.items.length === 0 ? <p className="text-base text-muted-foreground">{emptyText}</p> : null}
      {s?.items.length ? (
        <ul className="divide-y divide-border/60 rounded-lg border border-border/60 surface">
          {s.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="break-words text-base font-semibold">{item.title}</p>
                <p className="break-words text-sm text-muted-foreground">{item.detail}</p>
              </div>
              {item.url ? <a href={item.url} target="_blank" rel="noreferrer" aria-label={`Open ${item.title}`} className="shrink-0 rounded-md p-2 hover:bg-secondary"><ExternalLink className="size-5" aria-hidden="true" /></a> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
