# Bugs Fixed

## 2026-04-27 — Homepage "looks like crap" — production visual fixes

### Symptoms
- Live site `codexel.ai` was rendering a broken WebContainer IDE from an old deploy
- Preview panel showed `404: NOT_FOUND`; terminal showed `SharedArrayBuffer` cross-origin-isolation error
- SPA deep-links to `/factory`, `/sites`, `/deploy` returned 404 from Vercel (wrong catch-all rewrite)
- Hero and copy sections rendered raw `**text**` asterisks (markdown syntax in JSX)
- Replit dev-banner script was loading in production
- `PublicSitePage` fell back to "Public page unavailable" error UI on any non-404 API error when `fallbackToMarketing=true`

### Root Causes
1. **`vercel.json` catch-all rewrite** was `/(.*) → /public/$1` — tried to resolve paths under a non-existent `/public/` directory in the deployment root, so every deep-link 404'd. Correct Vercel SPA rewrite is `/((?!api/).*) → /index.html`.
2. **`outputDirectory` missing** from `vercel.json` — Vite outputs to `dist/public`, not Vercel's default `dist/`.
3. **`/` routed to `PublicSiteHome`** which makes an API call and briefly shows a loading spinner, then falls to `MarketingLanding` only on 404. On Vercel without a serverless API, any fetch error surfaced "Public page unavailable".
4. **Three `**bold**` markdown literals in `marketing-landing.tsx`** — rendered as literal asterisk characters in the browser because JSX does not process markdown.
5. **Replit dev-banner script** in `client/index.html` was loading `https://replit.com/public/js/replit-dev-banner.js` in production.

### Fixes Applied
- **`vercel.json`**: Fixed catch-all rewrite to `"/index.html"`; added `outputDirectory: "dist/public"`; added X-Content-Type-Options, X-Frame-Options, Referrer-Policy security headers.
- **`client/index.html`**: Removed Replit dev-banner `<script>` tag.
- **`client/src/App.tsx`**: Route `/` directly to `MarketingLanding` — no API call, no loading flash, instant render.
- **`client/src/pages/PublicSitePage.tsx`**: When `fallbackToMarketing=true`, also fall back on API error (not just 404).
- **`client/src/pages/marketing-landing.tsx`**: Replaced all three `**...**` markdown literals with `<strong>` JSX elements.

### Validation
- `npm run check` ✅ (TypeScript, exit 0)
- `npm run build` ✅ (Vite + esbuild, exit 0)
- Committed `e931311` and pushed to both `origin/factory` and `origin/main`

---

## 2026-04-26 — P1-1 Multi-tenant schema + RLS

### What was done
Implemented the smallest correct multi-tenant foundation across three files:

- **`shared/schema.ts`**
  - Added `uniqueIndex` to pg-core imports (needed by `tenantMembers` table).
  - Added `tenantId: varchar("tenant_id")` (nullable, no TS forward-ref) to the `projects` table with a `projects_tenant_idx` index.
  - Added `tenantId: varchar("tenant_id")` (nullable) to the `deployments` table.
  - Added new `tenantMembers` pgTable with columns: `id`, `tenantId` (FK→tenants, cascade), `userId` (FK→users, cascade), `role` (owner|admin|member|viewer), `invitedBy`, `joinedAt`, `createdAt`; plus a `UNIQUE(tenantId, userId)` index via `uniqueIndex`.
  - Exported `insertTenantMemberSchema`, `TenantMember`, and `InsertTenantMember` types.

- **`server/storage.ts`**
  - Added `tenantMembers` to table import from `@shared/schema`.
  - Added `TenantMember`, `InsertTenantMember` to type import.
  - Extended `IStorage` interface with four new methods: `getTenantMember`, `addTenantMember`, `getTenantMembers`, `getTenantProjects`.
  - Implemented all four methods in `DatabaseStorage`; `addTenantMember` uses `onConflictDoUpdate` so it's idempotent.

- **`migrations/0001_multi_tenant_rls.sql`** *(new file)*
  - `CREATE TABLE IF NOT EXISTS tenant_members` with UNIQUE constraint.
  - `ALTER TABLE projects ADD COLUMN IF NOT EXISTS tenant_id` + FK constraint.
  - `ALTER TABLE deployments ADD COLUMN IF NOT EXISTS tenant_id` + FK constraint.
  - `CREATE OR REPLACE FUNCTION current_app_user()` — resolves caller from `SET LOCAL app.current_user_id`.
  - Added `SECURITY DEFINER` helpers (`is_tenant_member`, `has_tenant_role`) so RLS policies can check membership without recursive self-references on `tenant_members`.
  - `ALTER TABLE … ENABLE ROW LEVEL SECURITY` on: tenants, tenant_members, projects, deployments, sites, site_leads.
  - Full PERMISSIVE RLS policies (SELECT/INSERT/UPDATE/DELETE) on all six tables; `DROP POLICY IF EXISTS` guards make it re-runnable.
  - `site_leads INSERT` stays public, but now requires a real `site_id` and matching `tenant_id` when provided so public form posts cannot write arbitrary tenant lead rows.
  - Commented superuser-bypass block for service-role.

### Compatibility compromises
- `tenantId` columns are **nullable** on both `projects` and `deployments` so existing single-user records are unaffected.
- No `.references(() => tenants)` in TypeScript for `projects.tenantId` and `deployments.tenantId` (tenants is defined later in the file); the FK constraint is applied at DB level in the migration SQL instead.
- All existing `getProjects(userId)` / `getProject(id, userId)` call sites continue to work without change.

### Validation
- `npm run check` ✅ (exit 0)
- `npm run build` ✅ (exit 0, vite + esbuild both pass)

### How to apply the DB migration
```bash
psql "$DATABASE_URL" -f migrations/0001_multi_tenant_rls.sql
```
The app layer must run `SET LOCAL app.current_user_id = '<userId>'` within each transaction for RLS policies to filter rows correctly.

---

## 2026-04-26 — C1 auth guard hardening

- `server/auth.ts`
  - `isAuthenticated` now rejects non-access JWTs, so refresh tokens can no longer be used to call protected routes.
- `server/routes.ts`
  - Added `isAuthenticated` to workspace endpoints that previously allowed anonymous access (`/api/chat`, `/api/chat/multimodal`, `POST /api/projects`, `POST /api/agents`, `GET /api/projects/:id`, `PATCH /api/checklist/:itemId/toggle`, `GET /api/usage/:userId`).
  - Removed the implicit `projectId || 1` fallback and now require a valid project id owned by `req.user.id` before reading or mutating project data.
  - Removed anonymous project creation by requiring `req.user.id` when creating projects.
- `server/routes/production-auth.ts`
  - Updated protected usage/profile routes to read the authenticated subject from `req.user.id`, matching the JWT middleware contract.
- `server/routes/file-attachments.ts`
  - Updated protected file routes to read the authenticated subject from `req.user.id`, matching the JWT middleware contract.

### Validation

- `npm run check` ✅
- `npm run build` ✅
