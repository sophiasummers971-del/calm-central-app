import { defineTool } from "@lovable.dev/mcp-js";
import { navigationItems } from "@/lib/navigation";

export const listPagesTool = defineTool({
  name: "list_pages",
  title: "List app pages",
  description: "Find the app's personal, health and settings pages; device-only notes are not accessible remotely.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({ content: [{ type: "text", text: navigationItems.map((item) => `${item.label}: ${item.to} — ${item.detail}`).join("\n") }] }),
});

export default listPagesTool;