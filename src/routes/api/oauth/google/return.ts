import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/oauth/google/return")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const connectorId = url.searchParams.get("connector_id") ?? "";
        const code = url.searchParams.get("code") ?? "";
        const success = url.searchParams.get("success") === "true";
        const noOffline = url.searchParams.get("offline_access_allowed") === "false";
        const result = success && (code || noOffline) ? { success: true, connectorId, code: code || null } : { success: false, connectorId, code: null };
        const safeJson = JSON.stringify(result).replace(/</g, "\\u003c");
        const html = `<!DOCTYPE html><html><head><title>Finishing connection…</title></head><body><p>${result.success ? "Connected, closing…" : "Connection failed. You can close this window."}</p><script>const r=${safeJson};if(window.opener&&window.opener!==window){window.opener.postMessage({type:r.success?"appUserConnectorOAuthComplete":"appUserConnectorOAuthFailed",connectorId:r.connectorId,code:r.code},window.location.origin);}window.close();</script></body></html>`;
        return new Response(html, { headers: { "Content-Type": "text/html" } });
      },
    },
  },
});
