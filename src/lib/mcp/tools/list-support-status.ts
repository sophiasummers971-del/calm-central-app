import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export const listSupportStatusTool = defineTool({
  name: "list_support_status",
  title: "Check my support messages",
  description: "Read dates, topics and statuses for your latest 20 support messages; excludes message bodies and screenshots.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_args, ctx) => {
    const userId = ctx.getUserId();
    if (!userId) throw new ToolError("Sign in to check your support messages.");
    const client = supabaseForUser(ctx);
    const { data, error } = await client.from("support_requests").select("created_at,topic,status").eq("user_id", userId).order("created_at", { ascending: false }).limit(20);
    if (error) throw new ToolError("Your support messages could not be loaded. Try again.");
    return { content: [{ type: "text", text: data?.length ? data.map((row) => `${new Date(row.created_at).toLocaleDateString("en-GB")}: ${row.topic || "Message"} — ${row.status}`).join("\n") : "You have no support messages yet." }] };
  },
});

export default listSupportStatusTool;