<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- All backend reads go through `src/services/api.ts` (`withFallback`) and the hooks in `src/services/queries.ts`; never fetch the API elsewhere. Why: one place for the API URL and the automatic demo-data fallback.
- Portfolio data is fetched in the browser with `useQuery` + demo `placeholderData`, not in route loaders. Why: the FastAPI server runs on the visitor's machine (localhost), so the server render cannot reach it.
- Skill category colours and the Data/Dev family come only from `src/lib/categories.ts`. Why: badges, charts and hero bubbles must stay consistent for any category name the API returns.
- Demo data lives in `src/services/demo-data.ts` and mirrors the OpenAPI schemas in `src/services/types.ts`. Why: the fallback must render exactly like live data.
