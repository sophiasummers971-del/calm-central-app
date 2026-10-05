import { useState } from "react";
import { Bell } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { enablePush } from "@/lib/push";
import { savePushToken } from "@/lib/push.functions";

const messages: Record<string, string> = {
  registered: "Alerts are on for this device. We'll tell you when you're close to a goal.",
  "not-configured": "Alerts aren't set up yet. Please contact us through the help page.",
  unsupported: "This browser can't show alerts. On iPhone, add the app to your home screen first.",
  "open-in-new-tab": "Please open the app in its own tab (or the live site) to turn on alerts.",
  denied: "Alerts are blocked. Allow notifications for this site in your browser settings.",
};

export function PushAlertsButton() {
  const save = useServerFn(savePushToken);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    setBusy(true);
    setNote("");
    try {
      const r = await enablePush();
      if (r.status === "registered") await save({ data: { token: r.token } });
      setNote(messages[r.status]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      setNote(
        msg.toLowerCase().includes("unauthorized")
          ? "Please sign in first, then turn on alerts."
          : "Sorry, alerts couldn't be turned on. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button variant="secondary" className="h-14 w-full text-base" onClick={onClick} disabled={busy}>
        <Bell className="size-5" aria-hidden="true" /> {busy ? "Turning on…" : "Alert me when I'm close to a goal"}
      </Button>
      {note ? (
        <p role="status" className="text-base">
          {note}
        </p>
      ) : null}
    </div>
  );
}
