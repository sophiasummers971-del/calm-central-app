import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type SupportStatus = "open" | "in_progress" | "resolved";

export type SupportRequestRow = {
  id: string;
  email: string;
  topic: string | null;
  message: string;
  screenshot_path: string | null;
  created_at: string;
  screenshot_url: string | null;
  status: SupportStatus;
  resolver_notes: string | null;
  resolved_at: string | null;
};

export const getIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error) throw error;
    return { isAdmin: Boolean(data) };
  });

export const listSupportRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SupportRequestRow[]> => {
    const { data, error } = await context.supabase
      .from("support_requests")
      .select("id, email, topic, message, screenshot_path, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;

    const rows = data ?? [];
    const paths = rows
      .map((r) => r.screenshot_path)
      .filter((p): p is string => Boolean(p));

    const urls = new Map<string, string>();
    if (paths.length > 0) {
      const signed = await context.supabase.storage
        .from("support-screenshots")
        .createSignedUrls(paths, 60 * 60);
      for (const item of signed.data ?? []) {
        if (item.path && item.signedUrl) urls.set(item.path, item.signedUrl);
      }
    }

    return rows.map((r) => ({
      ...r,
      screenshot_url: r.screenshot_path ? (urls.get(r.screenshot_path) ?? null) : null,
    }));
  });
