# CODEXEL WORK BOARD — AI Multi-Agent Coordination
> Last updated: 2026-04-04 | Protocol: Atomic Claim → Work → Release → Log

## HOW TO USE THIS BOARD
1. **Claim a task** — add your agent name + timestamp to the Claimed column BEFORE editing files
2. **Never edit a file claimed by another agent** — check this board first
3. **Release when done** — move to Done, write to CHANGELOG.md, update HIVE.md if architectural
4. **One agent per file** — if you need a file someone else owns, wait or coordinate via HIVE.md

---

## 🔴 CRITICAL FIXES (Phase 0) — DO THESE FIRST

| # | Task | Files Affected | Claimed By | Status |
|---|------|---------------|-----------|--------|
| C1 | Fix isAuthenticated (refresh tokens + unguarded workspace routes) | server/auth.ts, server/routes.ts | GitHub Copilot — 2026-04-26 04:54 PT | ✅ DONE |
| C2 | Fix FK type mismatch (varchar vs integer) | shared/schema.ts | GitHub Copilot — 2026-04-26 14:54 PT | ✅ DONE |
| C3 | Fix triple-registered /api/deployments route | server/routes.ts | GitHub Copilot — 2026-04-26 14:54 PT | ✅ DONE |
| C4 | Remove HTTP self-loops (localhost fetches) | server/routes.ts | GitHub Copilot — 2026-04-26 14:54 PT | ✅ DONE |
| C5 | Add auth to all Stripe/subscription routes | server/routes/subscriptions.ts | GitHub Copilot — 2026-04-26 14:54 PT | ✅ DONE |
| C6 | Fix cache key (uses 'auth-present' not userId) | server/services/caching-service.ts | GitHub Copilot — 2026-04-26 14:45 PT | ✅ DONE |
| C7 | Add HMAC verification to GitHub webhook | server/routes/phase11-routes.ts | GitHub Copilot — 2026-04-26 14:54 PT | ✅ DONE |
| C8 | Fix error handler (throws after res.json) | server/index.ts | GitHub Copilot — 2026-04-26 14:54 PT | ✅ DONE |
| C9 | Add CORS middleware | server/index.ts | GitHub Copilot — 2026-04-26 14:54 PT | ✅ DONE |
| C10 | Replace all hardcoded userId=1 (11+ files) | multiple | GitHub Copilot — 2026-04-26 14:33 PT | ✅ DONE |
| C11 | Switch routes.ts to real orchestrator | server/routes.ts, server/services/ | GitHub Copilot — 2026-04-26 14:54 PT | ✅ DONE |

---

## 🟡 PHASE 1 — Foundation

| # | Task | Files Affected | Claimed By | Status |
|---|------|---------------|-----------|--------|
| P1-1 | Multi-tenant schema + RLS | shared/schema.ts, migrations/ | GitHub Copilot — 2026-04-26 15:05 PT | ✅ DONE |
| P1-2 | JWT auth with refresh tokens | server/auth.ts, server/db.ts, server/storage.ts, server/routes/sites.ts, server/routes/deploy.ts, server/services/deployment-service.ts | GitHub Copilot — 2026-04-26 15:29 PT | ✅ DONE |
| P1-3 | Lead capture + calculator | client/src/templates/, client/src/components/widgets/, client/src/lib/site-leads.ts | GitHub Copilot — 2026-04-26 15:42 PT | ✅ DONE |
| P1-4 | DSCR/Mortgage templates | client/src/templates/, client/src/components/templates/, client/src/pages/TemplatePreview.tsx, client/src/pages/SiteDashboard.tsx, client/src/pages/SiteFactory.tsx, server/routes/sites.ts | GitHub Copilot — 2026-04-26 16:17 PT | ✅ DONE |
| P1-5 | AI SEO engine core | server/services/seo-engine.ts, server/routes/seo-dynamic.ts, server/services/site-factory.ts, server/services/content-worker.ts | GitHub Copilot — 2026-04-26 16:55 PT | ✅ DONE |

---

## 🟢 PHASE 2 — AI Systems

| # | Task | Files Affected | Claimed By | Status |
|---|------|---------------|-----------|--------|
| P2-1 | HIVE mind engine | server/services/hive/ | — | 🟡 PENDING |
| P2-2 | Memory OS (3-tier) | server/services/hive/memory-os.ts | — | 🟡 PENDING |
| P2-3 | Agent swarm orchestrator | server/services/hive/queen.ts | — | 🟡 PENDING |
| P2-4 | Content engine | server/services/content-engine.ts | — | 🟡 PENDING |
| P2-5 | Site factory engine | server/services/site-factory.ts | — | 🟡 PENDING |

---

## 🔵 PHASE 3 — Deployment

| # | Task | Files Affected | Claimed By | Status |
|---|------|---------------|-----------|--------|
| P3-1 | Deployment pipeline | server/services/deployment/ | — | 🔵 PENDING |
| P3-2 | Wave 1: 20 DSCR domains | deployment configs | — | 🔵 PENDING |
| P3-3 | Wave 2: Personal brand | deployment configs | — | 🔵 PENDING |
| P3-4 | Wave 3: All 242 domains | deployment configs | — | 🔵 PENDING |

---

## ✅ COMPLETED

| Task | Completed By | Date | Notes |
|------|-------------|------|-------|
| Homepage visual fix | GitHub Copilot | 2026-04-27 | Fixed broken vercel.json SPA rewrite, routed `/` directly to `MarketingLanding`, removed Replit dev banner from `index.html`, fixed `**bold**` markdown literals rendering as asterisks, hardened `PublicSitePage` error fallback. Pushed to `main` + `factory`. |
| P1-5 public slug + canonical runtime | GitHub Copilot | 2026-04-26 | Added a host-aware public site render API, switched root/slug routes to render real site-backed public pages, reused template rendering on home routes, and applied runtime canonical/meta/OG/schema tags through `SEOHead` so generated SEO pages are now crawlable |
| P1-5 SEO structure follow-up | GitHub Copilot | 2026-04-26 | Enforced per-site unique normalized slugs inside the canonical SEO engine, synced normalized page manifests back into site config, and generated persistent internal-link maps so site creation and regeneration now produce stable crawl paths |
| P1-5 SEO engine core | GitHub Copilot | 2026-04-26 | Added canonical `seo-engine.ts`, persisted durable SEO settings/keyword models/meta/social/schema bundles into site config, regenerated SEO on site creation and content-worker updates, fixed authoritative sitemap/robots/config routes, and corrected the SEO Blitz score write path |
| P1-4 selector + persistence slice | GitHub Copilot | 2026-04-26 | Added shared mortgage template IDs, shipped reusable selector cards into `SiteDashboard` and `SiteFactory`, validated template saves on server routes, and added thumbnail assets for all six mortgage templates |
| P1-4 long-form + city quick variants | GitHub Copilot | 2026-04-26 | Added `LongFormMortgage` and `CityMortgageQuick`, registered both in the template registry and preview map, and validated with `npm run check` + `npm run build` |
| P1-4 metadata + preview guard slice | GitHub Copilot | 2026-04-26 | Wired real site/domain/state metadata into templates, normalized JSON page payloads from site config, and added explicit missing/invalid preview states in `TemplatePreview` |
| P1-4 template foundation slice | GitHub Copilot | 2026-04-26 | Added shared template config schemas, shared trust/CTA/footer chrome, and rewired remaining mortgage templates to the tenant-safe site lead helper |
| P1-3 Lead capture + calculator | GitHub Copilot | 2026-04-26 | Added shared site lead submit helper, fixed template payload contract drift, surfaced submit errors, restored DSCR landing apply form, and passed calculator context into lead submissions |
| Public lead capture RLS hardening | GitHub Copilot | 2026-04-26 | Added `public_capture_site_lead()` migration, routed public lead inserts through DB-owned function, and moved authenticated lead stats back under caller DB context |
| P1-1 Multi-tenant schema + RLS | GitHub Copilot | 2026-04-26 | `tenantMembers` table, `tenantId` on projects/deployments, RLS SQL migration |
| P1-2 Runtime RLS user context | GitHub Copilot | 2026-04-26 | Added `withDatabaseUser()` transaction helper, wired project/site/deployment reads+writes to set `app.current_user_id`, and locked deployment status routes behind auth |
| MASTER_PLAN.md | Copilot | 2026-04-03 | Phases 0–5, 242 domains |
| PRD.md | Copilot | 2026-04-03 | 18 features, full spec |
| AGENTS.md | Copilot | 2026-04-03 | Universal AI instructions |
| Obsidian vault structure | Copilot | 2026-04-04 | CodexelBrain/ |
| C10 hardcoded identity cleanup | GitHub Copilot | 2026-04-26 | Removed shared `user_1` / project `1` defaults; added local actor + active project helpers |
| C1 auth guard hardening | GitHub Copilot | 2026-04-26 | Rejected refresh tokens in `isAuthenticated`; locked workspace/project routes behind bearer auth and owner checks |

---

## FILE LOCK REGISTRY
> If you are editing a file, add it here. Remove when done.

| File | Locked By | Since |
|------|----------|-------|

---

## AGENT COMMS
> Drop quick messages here for other agents

- **Copilot→All**: Board initialized 2026-04-04. Phase 0 critical fixes are the only priority. Do NOT build new features until C1–C11 are resolved.
- **Copilot→All**: SEO preview/admin UX is now live in `SiteDashboard`, backed by the canonical `/api/seo/sites/:siteId/config` bundle. Next recommended priority is the lead attribution stack (`codexel-next-29` to `32`) so site launches can prove which pages and campaigns drive conversions.
