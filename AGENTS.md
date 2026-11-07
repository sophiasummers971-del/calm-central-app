<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Google lists use authenticated server functions, provider cursor pagination and foreground React Query polling; Gmail metadata uses MIME batches to avoid per-message gateway calls.
- Keep Bun test globals outside the application TypeScript configuration so browser fetch types remain compatible with the edge runtime.
- Health journal entries follow the existing device-local health storage model, with schema validation and date-ordering helpers separated from the page for testing.
- Keep the overview, navigation and page search driven by one shared navigation catalogue so every destination remains discoverable; separate account identity from saved account records and Google service consent.
- Remote MCP tools use managed OAuth and caller-scoped RLS clients; device-local records remain browser-only and are never migrated for integrations.
- Keep browser tools in their owning screen with shared UI actions and static-name telemetry; server tools live in src/lib/mcp and generated transport routes are plugin-owned.
- Password recovery uses browser Cloud Auth through a service layer; allow password updates only with a verified user and keep recovery pages out of the sitemap.
