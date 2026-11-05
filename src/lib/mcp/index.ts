import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listPagesTool from "./tools/list-pages";
import listSupportStatusTool from "./tools/list-support-status";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "account-hub",
  title: "Account Hub",
  version: "0.1.0",
  instructions: "Find My Life Folder pages and check your own support message statuses. Health notes, saved accounts and journal entries stay on the user's device and are not available through this remote server. No sending, deletion or sharing tools are enabled.",
  auth: auth.oauth.issuer({ issuer: `https://${projectRef}.supabase.co/auth/v1`, acceptedAudiences: "authenticated" }),
  tools: [listPagesTool, listSupportStatusTool],
});