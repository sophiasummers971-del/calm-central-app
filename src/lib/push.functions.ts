import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/firebase_messaging";

export const savePushToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ token: z.string().min(10).max(4096) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await supabase.from("push_tokens").delete().eq("token", data.token);
    const { error } = await supabase.from("push_tokens").insert({ user_id: userId, token: data.token });
    if (error && error.code !== "23505") throw new Error(error.message);
    return { ok: true };
  });

export const sendGoalAlert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        label: z.string().min(1).max(40),
        done: z.number().min(0).max(1_000_000),
        target: z.number().positive().max(1_000_000),
        unit: z.string().max(20),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const lovableKey = process.env["LOVABLE_API_KEY"];
    const connKey = process.env["FIREBASE_MESSAGING_API_KEY"];
    if (!lovableKey || !connKey) throw new Error("Push alerts are not configured");
    const { data: rows, error } = await context.supabase.from("push_tokens").select("token");
    if (error) throw new Error(error.message);
    const left = Math.max(0, data.target - data.done);
    let sent = 0;
    for (const { token } of rows ?? []) {
      const res = await fetch(`${GATEWAY_URL}/v1/projects/_/messages:send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": connKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            token,
            notification: {
              title: `Almost there: ${data.label}`,
              body: `Only ${left} ${data.unit} to go today — you can do it!`,
            },
            webpush: { fcm_options: { link: "/my-details" } },
          },
        }),
      });
      if (res.ok) sent++;
      else if (res.status === 404 || res.status === 400) {
        await context.supabase.from("push_tokens").delete().eq("token", token);
      } else {
        console.error(`FCM send failed [${res.status}]: ${await res.text()}`);
      }
    }
    return { sent };
  });
