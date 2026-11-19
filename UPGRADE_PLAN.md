# SeinTrack upgrade plan: SolidStart v2 (no Vinxi) and dependency security

_Written 2026-11-19._

## Status (2026-11-19)

Phases 1–3 are applied on `upgrade/solidstart-v2` (uncommitted). Package versions were taken from the npm registry on 2026-11-19:
- `@solidjs/start` 2.0.4 and `nitro` 3.0.261103-rc (Nitro 3 is still a release candidate)
- `vite` 8.3.8
- `solid-js` 1.9.19
- `@solidjs/router` 1.0.3 (the Solid 1 line; 2.0 needs Solid 2)
- `@solidjs/meta` 0.29.8
- `@kobalte/core` 0.13.14
- `@tanstack/solid-query` 5.108.0
- tRPC 11.28
- `hono` 4.13.18
- `kysely` 0.29.9
- `valibot` 1.5.0
- `@sentry/solid` and `@sentry/node` 11.14 (`@sentry/solidstart` 10.71 still requires Start v1, so it was dropped)

**Still to do by hand:** `pnpm install` (writes the new lockfile), `pnpm typecheck`, `pnpm build`, `pnpm dev`, the section 6 checklist, `pnpm audit --prod`. Then commit `pnpm-lock.yaml`, because Docker uses `--frozen-lockfile`.
**Deliberately not done:** Biome 1 → 2, ESLint 9 → 10, Tailwind 3 → 4, Solid 2.0.

## 1. Where things stand

| | `origin/main` (last working) | local `main` (2 unpushed commits: "failed update", "ges") |
|---|---|---|
| Framework | `@solidjs/start` 1.0.9 + `vinxi` 0.4.3 (Vite 5.4.10, Nitro 2.9.7, h3 1.x) | No SolidStart. Solid **2.0 RC** "Start mode" (`@solidjs/vite-plugin` 3.0.0-next.57) |
| Solid / router | `solid-js` 1.9.3, `@solidjs/router` 0.14.10 | `solid-js` 2.0.0-rc.21, router 2.0.0-next.44, Kobalte 2.0.0-alpha.4 |
| Config | `app.config.ts` (`ssr: false`, middleware, Sentry Vite plugin) | `vite.config.ts` + `filesystem-routing` |
| tRPC | v10 via `@solid-mediakit/trpc` + Hono | v11 + hand-written client |

The local commits skipped a step. They moved to **Solid 2.0**, which is still a release candidate, and almost every Solid package went to `-next`, `-rc` or `-alpha` builds at the same time. That is why it is hard to get working.

### Recommended path
SolidStart **v2** is stable. It removes Vinxi and runs on Vite 8's Environment API, and it **still targets Solid 1.x**. That means you can drop Vinxi without rewriting components for Solid 2.0. SolidStart is now in maintenance mode, with Solid 2.0's built-in Start mode as the long-term successor. Maintenance mode still includes security patches, so v2 is safe to run while Solid 2.0 stabilises.

**Plan:** set the Solid 2 attempt aside on a branch, start from `origin/main`, and work through these steps:
1. Security bumps
2. SolidStart v2 migration
3. Remaining dependency updates

Solid 2.0 becomes a separate project later (section 7).

---

## 2. Phase 0: Preparation (about 15 minutes)

```bash
# keep the Solid 2 attempt; nothing is lost
git branch solid2-attempt main
git switch -c upgrade/solidstart-v2 origin/main

node -v          # must be >= 24 (SolidStart v2 requirement); you already run 26 locally
corepack enable && pnpm -v
pnpm install --frozen-lockfile && pnpm build   # confirm the baseline still builds
pnpm audit       # save output as the "before" snapshot
```

Bring over the useful, framework-independent parts of the failed attempt:

```bash
git checkout solid2-attempt -- compose.yaml .env.example instrument.server.mjs README.md
git rm public/instrument.server.mjs   # it was publicly served from /public; keep it at the repo root
```

Also copy the safety settings from `solid2-attempt:pnpm-workspace.yaml` (`minimumReleaseAge`, `allowBuilds`). Leave out the Solid 2 `overrides` and `peerDependencyRules`.

---

## 3. Phase 1: Security fixes for the current stack (you can ship this on its own)

These versions are in the **old** lockfile and have published advisories:

| Package | Locked | Advisory (examples) | Minimum fixed version | Action |
|---|---|---|---|---|
| `hono` | 4.6.6 | JWT alg confusion CVE-2026-22817 (high, fixed 4.11.4); serveStatic middleware bypass CVE-2026-39407 (fixed 4.12.12); several more up to 4.12.16 | ≥ 4.13.16 | `pnpm up hono@^4 --latest` |
| `@trpc/server` / client | 10.45.2 | CVE-2025-68130 prototype pollution (only with `experimental_caller`, which SeinTrack doesn't use) | 11.8.0+ | Goes to **v11** in phase 2 (section 4.8), together with removing `@solid-mediakit/trpc` |
| `kysely` | 0.27.4 | CVE-2026-32763 JSON-path SQL injection, affects ≥ 0.26 < 0.28.12 (MySQL/SQLite dialects; you use Postgres, so low real risk) | ≥ 0.28.17 | `pnpm up kysely@latest kysely-codegen@latest` |
| `valibot` | 1.0.0-beta.1 | CVE-2025-66020 ReDoS in `EMOJI_REGEX` (high) | ≥ 1.2.0 | `pnpm up valibot@^1` (beta → stable; recheck schemas) |
| `vite` (via vinxi) | 5.4.10 | Many dev-server `server.fs.deny` bypasses. These matter because `dev` runs with `--host` | Removed by phase 2 | Go away with Vinxi |
| `h3`, `nitropack`, `esbuild`, `rollup`, `cross-spawn` (via vinxi) | old | Assorted transitive advisories | Removed by phase 2 | Go away with Vinxi |

> I couldn't run `pnpm audit` from here because registry access was blocked. Run `pnpm audit --prod` and `pnpm audit` yourself. The table covers the direct dependencies I checked by hand. The audit output is the authoritative list.

---

## 3a. `pnpm audit` results (branch `upgrade/solidstart-v2`, i.e. the old `origin/main` code, 2026-11-19)

**Totals:** 229 findings (**4 critical, 93 high**, 106 moderate, 26 low) across 847 packages.

### Removed by the migration (112 findings: 1 critical, 44 high)
Every path to these goes through `vinxi`, `@solidjs/start` v1, `@sentry/solidstart` or `@solid-mediakit/trpc`. The main ones are `tar` (critical), `h3` request smuggling, `undici`, `node-forge`, `vite` 5, `rollup`, `serialize-javascript`, `lodash`, `defu`, `zod` 3 and `@fastify/busboy`. Phase 2 fixes them with no extra work, as long as SolidStart v2 / Nitro 3 / the new Sentry SDK don't bring old copies back (re-audit after phase 2).

### Still there after the migration (117 findings) → fix list
| Pkg (locked) | Worst | Runtime? | Real exposure in SeinTrack | Fix |
|---|---|---|---|---|
| `seroval` 1.1.1 (via `solid-js`, router, meta, Kobalte, solid-query) | **2 critical**, 8 high (RCE/type confusion in `fromJSON`, DoS) | Yes (client bundle) | Low. `fromJSON` on untrusted input is SolidStart's server-function path; the app uses tRPC/superjson and `ssr:false`. Fix it anyway. | Upgrade `solid-js` to latest 1.9.x. If `pnpm why seroval` still shows < 1.6.8, add `pnpm.overrides: { "seroval": "^1.6.8", "seroval-plugins": "^1.6.8" }` |
| `solid-js` 1.9.3 | high: XSS, JSX fragment escaping | Yes | SSR-only issue; app is `ssr:false`. | `solid-js@^1.9` latest |
| `hono` 4.6.6 | 5 high, 39 moderate, 3 low | **Yes, server** | Most are in middleware you don't use (JWT/JWK, serveStatic, ipRestriction, bodyLimit, cache). Cookie/header ones touch `hono/cookie`, which section 4.8 starts using. | `hono@^4` latest (≥ 4.13.16) |
| `@trpc/server` 10.45.2 | high: prototype pollution | Yes, server | Only `experimental_caller`, which isn't used. | tRPC v11 (≥ 11.8.0), see 4.8 |
| `kysely` 0.27.4 | 3 high: SQL injection | Yes, server | MySQL/SQLite JSON-path / `sql.lit`; you use Postgres and typed queries. Low. | `kysely@latest` (≥ 0.28.17) + `kysely-codegen@latest` |
| `uuid` 11.0.2 / 8.3.2 (via `node-cron`) | moderate | Yes | Low | `uuid@latest`, or replace with `crypto.randomUUID()`. Drop `node-cron`/`cron` (unused, commented out). |
| `postcss` 8.4.47, `nanoid` 3.3.7, `source-map-js`, `browserslist`, `autoprefixer` chain | high | **Build-time only** | Only processes your own CSS | `pnpm update` within ranges |
| `tailwindcss` 3 chain: `glob` 10, `minimatch` 9, `brace-expansion` 2, `cross-spawn`, `yaml`, `postcss-selector-parser` | high | Build-time only | No runtime exposure | `pnpm update` (tailwind 3.4.x latest); `glob` CLI issue isn't reachable |
| `esbuild` (via `tsx`) | moderate: dev-server CORS | Dev/migrations | None (`tsx` doesn't run esbuild's serve) | `tsx@latest` |
| `git-diff` 2.0.6 (via `kysely-codegen`) | **critical**: command injection | Dev only | Only when running `pnpm sql` | `kysely-codegen@latest` |
| eslint chain: `flatted`, `js-yaml`, `minimatch` 3, `brace-expansion` 1, `ajv`, `@humanfs/node`, `@eslint/plugin-kit`, `diff` | high/moderate | Dev only | None in production | `eslint`, `typescript-eslint`, `eslint-plugin-*` → latest |

### Extra recommendations from the audit
1. **Move build-only packages to `devDependencies`:** `tailwindcss`, `tailwindcss-animate`, `postcss`, `autoprefixer`, and `tsx` (unless the container runs migrations). The Docker `prod-deps` stage would then stop shipping them, and `pnpm audit --prod` would show only what actually runs.
2. **Run `pnpm update` early.** Many transitive findings (`brace-expansion`, `minimatch`, `nanoid`, `postcss`, `cross-spawn`, `browserslist`) are fixed by refreshing the lockfile within existing semver ranges, without touching `package.json`.
3. **CI gate:** `pnpm audit --prod --audit-level=high` in `deploy.yml`.
4. `audit.json` is a generated file. Add it to `.gitignore` or delete it after use. Run `pnpm audit --json | Out-File -Encoding utf8 audit.json` so the output is UTF-8 rather than PowerShell's default UTF-16.

---

## 4. Phase 2: SolidStart v1 → v2 (removes Vinxi)

Follow the official guide: <https://docs.solidjs.com/solid-start/v2/migrating-from-v1>. Below is what it means for this repo.

### 4.1 Dependencies
```bash
pnpm remove vinxi @solid-mediakit/trpc
pnpm add @solidjs/start@latest nitro@latest solid-js@^1 @solidjs/router@latest @solidjs/meta@latest
pnpm add -D vite@^8 vite-plugin-solid@latest typescript@latest

# tRPC v11 (see 4.8)
pnpm add @trpc/server@^11 @trpc/client@^11 @hono/trpc-server@latest
```
Keep everything on Solid **1.x**. Do not add any `-next`, `-rc` or `@solidjs/web` packages.

### 4.2 `app.config.ts` → `vite.config.ts`
```ts
import { solidStart } from "@solidjs/start/config";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    solidStart({
      ssr: false,                       // same as today (SPA mode)
      middleware: "./src/middleware.ts",
    }),
    nitro(),
  ],
  nitro: { preset: "node_server" },     // Docker / plain node
  server: { port: 3000 },
});
```
Then delete `app.config.ts`, and remove `.vinxi` and `app.config.timestamp_*.js` from `.gitignore`.

### 4.3 Scripts (`package.json`)
```jsonc
"dev":     "vite dev --host",
"build":   "vite build",
"preview": "vite preview",                       // local check only
"start":   "node --env-file-if-exists=.env --import ./instrument.server.mjs .output/server/index.mjs"
```
Confirm the output path after the first build. Nitro's `node_server` preset writes `.output/server/index.mjs`. The old `start` script (`pnpx tsx && … pnpx node-env-run`) can go. Set `"engines": { "node": ">=24" }`.

### 4.4 TypeScript
Keep `/// <reference types="@solidjs/start/env" />` in `src/global.d.ts`, or add `"@solidjs/start/env"` to `compilerOptions.types`. Remove any `vinxi/types/client` reference.

### 4.5 Code changes

| File | Change |
|---|---|
| `src/server/hono.ts` | Covered in 4.8: the inline `createContext` and the `vinxi/server` import go away. |
| `src/server/trpc/context.ts` | Covered in 4.8: replaced with the Hono/fetch-adapter version. |
| `src/routes/api/trpc/[trpc].ts` | Keep it, with `APIEvent` still from `@solidjs/start/server`. Remove the commented-out `fetchRequestHandler` block. |
| `src/middleware.ts` | Move to the v2 array form: `export default createMiddleware([async (event, next) => { const res = await next(); return res; }])`. The `onBeforeResponse` object form still works but is deprecated. Sentry middleware: see 4.6. |
| `src/utils/trpc.ts` | Covered in 4.8. |
| `src/app.tsx`, `entry-client.tsx`, `entry-server.tsx` | Mostly unchanged in v2. Check them against the v2 entrypoint docs. `trpc.Provider` removal is covered in 4.8. |
| Serialization | v2 defaults to JSON (CSP-safe). Server functions aren't used (everything goes through tRPC/superjson), so no action is needed. |

### 4.6 Sentry
Check whether `@sentry/solidstart` (latest) supports SolidStart v2 and Vite 8.
- **If it does:** upgrade it and keep the Vite plugin in `vite.config.ts`.
- **If it doesn't:** use `@sentry/solid` on the client (in `entry-client.tsx`, with `solidRouterBrowserTracingIntegration`) and `@sentry/node` on the server through `instrument.server.mjs`. That is the setup `solid2-attempt` already uses. Move the DSN to an env var while you're at it.

### 4.7 Docker / CI
- `Dockerfile`: use `node:24-slim` or newer, and `COPY --from=build /app/.output /app/.output` instead of `dist`. Leave `instrument.server.mjs` at the repo root.
- `.github/workflows/deploy.yml`: update `docker/login-action@v1` to `@v3`. Consider adding a `pnpm audit --prod --audit-level=high` step before the build.

### 4.8 tRPC v10 → v11 and removing `@solid-mediakit/trpc`

`@solid-mediakit/trpc` only supports tRPC v10 and SolidStart v1, and it's the only reason the app needs a `trpc.Provider`. Replace it with a small wrapper of your own around the plain tRPC v11 client and `@tanstack/solid-query`. That wrapper **already exists** on the `solid2-attempt` branch, and it keeps mediakit's call-site API:

```ts
trpc.someQuery.createQuery(() => input, () => options)
trpc.someMutation.createMutation(() => options)
trpc.someInfinite.createInfiniteQuery(() => input, () => options)
```

Because the API is the same, **none of the roughly 45 call sites need to change**: `index.tsx`, `Menu.tsx`, `DayEditor.tsx`, `ListMonth.tsx`, `TodoPanel.tsx`, `UnDoneTodos.tsx`, `NewProject.tsx` and `test.tsx`. The code never uses `trpc.useContext()`/`useUtils()`. Cache invalidation already goes through the global `MutationCache.onSuccess`.

**Server side.** No router changes are needed. `initTrpc.ts` and every file in `routers/` are identical between `origin/main` (v10) and `solid2-attempt` (v11), and nothing uses the removed v10 APIs (`rawInput`, `createTRPCProxyClient`, `inferAsyncReturnType`).

```bash
pnpm remove @solid-mediakit/trpc
pnpm add @trpc/server@^11 @trpc/client@^11 @hono/trpc-server@latest

# framework-free files from the attempt can be taken as-is
git checkout solid2-attempt -- src/server/trpc/context.ts src/server/hono.ts
# the client wrapper needs a small port back to Solid 1 (below)
git checkout solid2-attempt -- src/utils/trpc.ts
```

- **`context.ts`** (as-is): reads the cookie with `hono/cookie` and writes it through tRPC's `resHeaders`. That removes `vinxi/server` and the mediakit type import. It also collapses the four copies of the create-user logic into a single `createUser`/`resolveUser`. The returned context changes from `{ db, id, req, res }` to `{ db, id, req, resHeaders }`. Grep the routers for `ctx.res` before relying on this (none use it today).
- **`hono.ts`** (as-is): becomes `trpcServer({ endpoint: "/api/trpc", router: appRouter, createContext })`.
- **`src/utils/trpc.ts`**: port it back to Solid 1 and TanStack Solid Query v5:
  1. `import { getRequestEvent } from "solid-js/web";` (not `@solidjs/web`).
  2. If your installed `@tanstack/solid-query` v5 doesn't export `useQuery`/`useMutation`/`useInfiniteQuery`, use `createQuery`/`createMutation`/`createInfiniteQuery`, plus the matching `CreateQueryResult`/`CreateMutationResult`/`CreateInfiniteQueryResult` types. Either way, the options are passed as an accessor function.
  3. Keep `transformer: superjson` on `httpBatchLink`. In v11 the transformer goes on the link, not the client. The server's `initTRPC.create({ transformer: superjson })` stays the same.
  4. Keep `createQueryClient()`. Because `ssr: false`, a module-level singleton would also work.
- **`src/app.tsx`**: remove `<trpc.Provider>` and keep only `<QueryClientProvider client={queryClient}>`. Remove `trpc` from the import and use `createQueryClient()` from `~/utils/trpc`.
- **`src/routes/api/trpc/[trpc].ts`**: delete the commented-out `fetchRequestHandler` block and its unused `createContext`/`appRouter` imports. It only calls `app.request(event.request)`.

**Check:** `pnpm tsc --noEmit`, with output types inferred on all call sites. Network tab: batched `GET /api/trpc/a,b?batch=1` and `POST` for mutations. The `user` cookie is set on the first request. The infinite "done todos" list pages correctly.

---

## 5. Phase 3: Remaining dependency updates (one PR per group)

Run `pnpm outdated` first. Suggested order, smallest risk first:

1. **Patch/minor, same major:** `pg`, `@types/pg`, `postcss`, `autoprefixer`, `chart.js`, `class-variance-authority`, `clsx`, `superjson`, `tailwind-merge@2`, `date-fns`, `tsx`, `typescript-eslint`, `@solid-primitives/*` (stable 1.x line, not `-next`).
2. ~~tRPC 10 → 11~~: moved into phase 2 (section 4.8).
3. **TanStack Solid Query** to latest stable v5 (not the v6 RC used for Solid 2), plus the devtools package.
4. **Kobalte** to latest `0.13.x` (stable, Solid 1). Check the `ui/*` components.
5. **Utility majors:** `uuid` (or replace with `crypto.randomUUID()` and remove the dependency), `cron` / `node-cron` (only one is needed, and the cron code in `hono.ts` is commented out; consider removing both), `dotenv` (redundant with `--env-file`, so remove it unless `src/tools/*.ts` need it).
6. **Tooling:** Biome 1 → 2 (`pnpm biome migrate --write`), ESLint 9 → latest, `@types/node` to match the Node major you deploy.
7. **Leave for later:** Tailwind 3 → 4 (it's a CSS/config rewrite, out of scope here). `solid-transition-group` stays on Solid 1.

After each group: `pnpm build && pnpm check && pnpm audit`.

---

## 6. Phase 4: Verification checklist

- [ ] `pnpm dev`: app loads, there are no Vinxi processes, and `/api/trpc/*` responds.
- [ ] First visit with no `user` cookie: a user is created and the cookie is set (`httpOnly`, 1-year expiry). Test both `DEMO=1` and the default mode.
- [ ] `git grep -n solid-mediakit` returns nothing. Every tRPC router works: dates, projects, todos, stats. Add time, edit a day, toggle todos, confetti.
- [ ] Charts render and toasts show on errors (the MutationCache/QueryCache handlers).
- [ ] `pnpm migrate:latest` runs against Postgres from `compose.yaml`.
- [ ] `pnpm build && pnpm start` serves on :3000. The Docker image builds and runs.
- [ ] Sentry receives a test error from both client and server.
- [ ] `pnpm audit` shows no high/critical issues. `git grep -n vinxi` returns nothing.

---

## 7. Later: Solid 2.0

Once Solid 2.0, `@solidjs/router` 2, Kobalte, TanStack Query and solid-primitives all have **stable** Solid 2 releases, restart from the `solid2-attempt` branch. It already contains the Start-mode `vite.config.ts`, `Document.tsx`/`App.tsx`/`router.ts` split and component rewrites. Rebase it onto the phase 3 result rather than repeating the work. Until then, SolidStart v2 receives security patches.

## References
- tRPC v11 migration guide: https://trpc.io/docs/migrate-from-v10-to-v11
- SolidStart v2 migration guide: https://docs.solidjs.com/solid-start/v2/migrating-from-v1
- SolidStart v2 `vite.config.ts` reference: https://docs.solidjs.com/solid-start/v2/reference/entrypoints/vite-config
- Release announcement: https://github.com/solidjs/solid-start/discussions/2281
