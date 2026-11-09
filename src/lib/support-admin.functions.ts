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
      .select(
        "id, email, topic, message, screenshot_path, created_at, status, resolver_notes, resolved_at",
      )
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;

    return (data ?? []).map((r) => ({ ...r, screenshot_url: null }));
  });

// Screenshots are streamed on demand after a live admin check, so no reusable
// link exists that would outlive a revoked admin role.
export const getSupportScreenshot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => {
    if (!input?.id || typeof input.id !== "string") throw new Error("Missing id");
    return { id: input.id };
  })
  .handler(async ({ data, context }): Promise<{ dataUrl: string | null }> => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError) throw roleError;
    if (!isAdmin) throw new Error("Not allowed");

    const { data: row, error } = await context.supabase
      .from("support_requests")
      .select("screenshot_path")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    if (!row?.screenshot_path) return { dataUrl: null };

    const file = await context.supabase.storage
      .from("support-screenshots")
      .download(row.screenshot_path);
    if (file.error || !file.data) return { dataUrl: null };

    const bytes = new Uint8Array(await file.data.arrayBuffer());
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    const type = file.data.type || "image/png";
    return { dataUrl: `data:${type};base64,${btoa(binary)}` };
  });

export const updateSupportRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    id: string;
    status: SupportStatus;
    resolverNotes: string;
  }) => {
    if (!input?.id) throw new Error("Missing id");
    if (!["open", "in_progress", "resolved"].includes(input.status)) {
      throw new Error("Invalid status");
    }
    return {
      id: input.id,
      status: input.status,
      resolverNotes: (input.resolverNotes ?? "").slice(0, 4000),
    };
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("support_requests")
      .update({
        status: data.status,
        resolver_notes: data.resolverNotes.trim() === "" ? null : data.resolverNotes,
        resolved_at: data.status === "resolved" ? new Date().toISOString() : null,
        updated_by: context.userId,
      })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
