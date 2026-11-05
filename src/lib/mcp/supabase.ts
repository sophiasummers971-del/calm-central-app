import { createClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

function configuredValue(names: string[]): string | undefined {
  return names.map((name) => process.env[name]?.trim()).find(Boolean);
}

function publishableKey(): string {
  const direct = configuredValue(["SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_PUBLISHABLE_KEY"]);
  if (direct) return direct;
  const dictionary = process.env["SUPABASE_PUBLISHABLE_KEYS"];
  if (dictionary) {
    try {
      const parsed: unknown = JSON.parse(dictionary);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const values = parsed as Record<string, unknown>;
        const key = [values["default"], ...Object.values(values)].find((value): value is string => typeof value === "string" && value.trim().startsWith("sb_publishable_"));
        if (key) return key.trim();
      }
    } catch { /* A legacy key may still be configured. */ }
  }
  const legacy = configuredValue(["SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY"]);
  if (legacy) return legacy;
  throw new Error("App connection is not configured.");
}

export function supabaseForUser(ctx: ToolContext) {
  const token = ctx.getToken();
  if (!token) throw new Error("Sign in to access your account.");
  const url = configuredValue(["SUPABASE_URL", "VITE_SUPABASE_URL"]);
  if (!url) throw new Error("App connection is not configured.");
  return createClient(url, publishableKey(), {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}