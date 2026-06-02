# AGENTS.md

## Cursor Cloud specific instructions

### Product

Single **Base44-hosted** React SPA (ReZilient / Re-siliant / Unbound recovery platform). Frontend in `src/`, platform schema in `base44/`. There is no local API or database—E2E dev requires Vite plus the hosted Base44 backend.

### Required services

| Service | Command / config |
|---------|------------------|
| Vite dev server | `npm run dev` (default `http://localhost:5173`) |
| Base44 backend | Set `VITE_BASE44_APP_BASE_URL` (this repo: `https://unbound.base44.app`) |

App ID is in `base44/.app.jsonc` (`698cbbdc830161c35d66ad0e`). Copy `README.md` into `.env.local`:

```bash
VITE_BASE44_APP_ID=698cbbdc830161c35d66ad0e
VITE_BASE44_APP_BASE_URL=https://unbound.base44.app
```

`.env.local` is gitignored; create it per session if missing.

### Standard commands

See `package.json` and `README.md`:

- **Install:** `npm install`
- **Dev:** `npm run dev` — with env set, Vite proxies `/api` to Base44 (`[base44] Proxy enabled` in logs)
- **Build:** `npm run build` → `./dist`
- **Preview build:** `npm run preview`
- **Lint:** `npm run lint` (many existing unused-import violations; `npm run lint:fix` can auto-fix)
- **Typecheck:** `npm run typecheck` (partial `src/` include; expect existing TS errors)
- **Tests:** none defined in this repo

### Dev server notes

- Prefer **tmux** for long-running `npm run dev` (e.g. session `vite-dev-server`).
- Vite may bind on `::1` only; use `http://localhost:5173` from the VM browser.
- Without `VITE_BASE44_APP_BASE_URL`, build/dev still work but the Base44 API proxy is disabled.

### Auth / public access

`public_settings` for this app is `public_without_login`. Unauthenticated users see the marketing landing at `/Resiliant`; protected routes may 401 on entity APIs until a valid `access_token` is provided (URL param or `base44_access_token` in localStorage). Full participant/counselor flows need Base44 login credentials.

### Optional integrations (platform-side only)

Gmail/Calendar connectors, Contentful, YouTube discovery, LLM—configured in Base44 builder, not in local `.env` for Vite.
