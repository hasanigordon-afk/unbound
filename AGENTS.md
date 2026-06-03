# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Re-siliant ("Rebuild. Recover. Rise.") is a **frontend-only** React application built on the Base44 low-code platform. The backend (database, auth, serverless functions) is entirely hosted remotely on Base44 — there is no local database or backend server.

### Running services

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server on port 5173 |
| `npm run build` | Production build (outputs to `./dist`) |
| `npm run lint` | ESLint (has pre-existing unused-import errors) |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run typecheck` | TypeScript checking (has pre-existing type errors) |
| `npm run preview` | Preview production build |

### Environment variables

A `.env.local` file is required at the project root with:

```
VITE_BASE44_APP_ID=698cbbdc830161c35d66ad0e
VITE_BASE44_APP_BASE_URL=https://re-silient-app.base44.app
BASE44_LEGACY_SDK_IMPORTS=true
```

The app ID is also stored in `base44/.app.jsonc`.

### Key caveats

- The Vite dev server suppresses warnings (logLevel: 'error' in `vite.config.js`), so terminal output is minimal — the dev server will not print "ready" banner. Verify it's running with `curl http://localhost:5173/`.
- ESLint is scoped to `src/components/**` and `src/pages/**` only (excludes `src/lib/`, `src/components/ui/`).
- The `typecheck` script uses jsconfig.json which also only checks `src/components/**/*.js`, `src/pages/**/*.jsx`, and `src/Layout.jsx`.
- Unauthenticated users are redirected to `/Resiliant` (the public landing page). Public routes: `/Resiliant`, `/about`, `/onboarding`.
- The Base44 vite plugin handles API proxying (`/api` -> backend URL) and provides HMR/navigation notifiers.
