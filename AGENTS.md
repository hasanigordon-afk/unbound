# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Re-siliant is a **frontend-only React SPA** (Vite 6 + React 18 + Tailwind CSS 3) that uses the [Base44](https://base44.com) cloud platform as its backend. There is no local backend, database, or Docker infrastructure. All data persistence, authentication, and serverless functions run on Base44's cloud.

### Commands

Standard commands are in `package.json`:

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server on port 5173 |
| `npm run build` | Production build to `./dist` |
| `npm run lint` | ESLint (quiet mode) |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run typecheck` | TypeScript checking via `tsc` |

### Environment variables

The app requires a `.env.local` file with Base44 credentials to connect to the backend:

```
VITE_BASE44_APP_ID=<your_app_id>
VITE_BASE44_APP_BASE_URL=<your_backend_url>
```

Without these, the app will still build and the dev server will start, but the proxy to Base44 won't be enabled and API calls will fail. The frontend UI shell loads and renders regardless.

### Non-obvious caveats

- **Lint exits non-zero**: `npm run lint` exits with code 1 due to pre-existing unused-import warnings across ~150+ files. This is expected behavior, not a setup issue.
- **Typecheck exits non-zero**: `npm run typecheck` exits with code 2 due to pre-existing type errors (mostly from `leaflet` library internals and JSX/JS interop). This is expected.
- **No automated test suite**: There are no unit/integration test scripts or test framework configured. Testing is done manually via the browser.
- **Vite dev server output**: The dev server doesn't print the usual `Local: http://localhost:5173` line in some terminal environments, but it is listening on port 5173.
- **Node.js**: Requires Node.js >= 18 (Vite 6 requirement). The VM has Node 22 which works.
