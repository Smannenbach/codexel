# CODEXEL HIVE MIND — Shared Memory & Decisions
> All agents read this at session start. All agents write here after architectural decisions.
> Format: ## [CATEGORY] > ### [Decision/Learning] > **Date** | **Agent** | **Confidence**

---

## ARCHITECTURE DECISIONS

### AD-001: Use agent-orchestrator.ts (NOT ai-orchestrator.ts)
**Date**: 2026-04-03 | **Agent**: Copilot | **Confidence**: HIGH
- `server/services/agent-orchestrator.ts` = REAL — calls actual AI APIs
- `server/services/ai-orchestrator.ts` = FAKE — returns hardcoded strings
- `server/routes.ts` currently imports the FAKE one — fix is in C11
- **Decision**: Delete ai-orchestrator.ts after fixing the import

### AD-002: users.id must be VARCHAR, not INTEGER
**Date**: 2026-04-03 | **Agent**: Copilot | **Confidence**: HIGH
- Drizzle schema has `users.id` as varchar but 8+ FK tables declare it as integer
- This causes silent DB rejections on all relational queries
- **Fix**: Change all `integer("user_id")` FK refs in shared/schema.ts to `varchar("user_id")`

### AD-003: Never add inline handlers to server/routes.ts
**Date**: 2026-04-03 | **Agent**: Copilot | **Confidence**: HIGH
- routes.ts is already 1,500+ lines — it's a god object
- All new routes go in `server/routes/[feature]-routes.ts` then imported
- **Pattern**: `import { featureRouter } from './routes/feature-routes'; app.use('/api/feature', featureRouter);`

### AD-004: HIVE Memory Architecture (4 tiers)
**Date**: 2026-04-04 | **Agent**: Copilot | **Confidence**: HIGH
- Tier 1 EPHEMERAL: Current turn only (never persisted)
- Tier 2 SESSION: Current agent session (written to /03-Memory/Short_Term/)
- Tier 3 PROJECT: Persists across sessions (written to /03-Memory/Mid_Term/ + Long_Term/)
- Tier 4 GLOBAL: Cross-project learnings (written to /09-Learnings/)
- Compression: MicroCompact (per-turn) → AutoCompact (per-session) → FullCompact (archival)
- **Implementation**: server/services/hive/memory-os.ts

### AD-005: Queen-Worker Agent Topology
**Date**: 2026-04-04 | **Agent**: Copilot | **Confidence**: HIGH
- Queen: Orchestrates, delegates, enforces quality ("Do not rubber-stamp weak work")
- Workers: Security, Content, SEO, Frontend, Backend, Testing, Deployment (7 specialists)
- Communication: Atomic task claims via WORK_BOARD.md, results via HIVE.md
- KV cache sharing between workers for efficiency (inspired by Claude Code leak)

### AD-006: Obsidian Vault = HIVE External Memory
**Date**: 2026-04-04 | **Agent**: Copilot | **Confidence**: HIGH
- Vault path: C:\Users\steve\OneDrive\Desktop\Codexel\CodexelBrain
- MCP server: obsidian-mcp (filesystem-based, vault can be closed)
- All 5 AI CLIs (Claude, Copilot, Gemini, Kimi, Codex) connect to same vault via MCP
- Vault is the source of truth for decisions, domain registry, SEO strategies, client configs

### AD-007: Testing Strategy (4 layers)
**Date**: 2026-04-04 | **Agent**: Copilot | **Confidence**: HIGH
- Layer 1 SMOKE: Health checks on every deployed site (uptime, 200 OK, TLS valid)
- Layer 2 FUNCTIONAL: Playwright tests — all buttons, forms, calculators, CTAs
- Layer 3 VISUAL: Screenshot comparison, no layout regressions
- Layer 4 SEO/PERF: Lighthouse CI, Core Web Vitals, schema.org validation
- **Auto-run**: After every deployment, nightly for all live sites

---

## KNOWN ISSUES (unresolved)

| ID | Description | Severity | Files | Discovered |
|----|-------------|----------|-------|-----------|
| BUG-001 | isAuthenticated passes all users — no real auth | CRITICAL | server/auth.ts | 2026-04-03 |
| BUG-002 | FK type mismatch varchar/integer | CRITICAL | shared/schema.ts | 2026-04-03 |
| BUG-003 | /api/deployments registered 3x, only mock runs | CRITICAL | server/routes.ts | 2026-04-03 |
| BUG-004 | HTTP self-loops on localhost:5000 | CRITICAL | server/routes.ts | 2026-04-03 |
| BUG-005 | All Stripe routes unauthenticated | CRITICAL | server/routes/subscriptions.ts | 2026-04-03 |
| BUG-006 | Cache key 'auth-present' leaks data between users | CRITICAL | server/services/caching-service.ts | 2026-04-03 |
| BUG-007 | GitHub webhook no HMAC verification | HIGH | server/routes/phase11-routes.ts | 2026-04-03 |
| BUG-008 | Error handler throws after res.json() | HIGH | server/index.ts | 2026-04-03 |
| BUG-009 | userId hardcoded to 1 in 11+ route files | HIGH | multiple | 2026-04-03 |

---

## PERFORMANCE NOTES

- All 5 deployment services use in-memory Maps — data lost on restart
- Performance metrics endpoint returns hardcoded fake values (125ms, 342MB)
- AgentOrchestrator.ts (real) not yet wired to any live route

---

## DOMAIN INTEL

- 242 domains total owned by Steve Mannenbach
- Priority Wave 1 (20 domains): DSCR/lending — highest ROI
- Priority Wave 2 (14 domains): Personal brand (steve-mannenbach.*, stevemib.*)
- Priority Wave 3 (208 domains): Everything else including Codexel platform itself
- Key domains: codexel.ai, codexel.app, loandaddy.ai, dscrwithsteve.com, getmib.com
- NMLS: #1831233 | AZ DRE: #SA713873000 | 18 active state licenses

---

## CONTEXT COMPRESSION LOG
> AutoCompact entries — summaries of compressed sessions

| Date | Agent | Summary |
|------|-------|---------|
| 2026-04-03 | Copilot | Full code review completed. 8 critical bugs, 2 orchestrator files (use real one), 1500-line god routes file. Plan + PRD created. |
| 2026-04-04 | Copilot | Obsidian vault created. HIVE mind architecture defined. All coordination files being saved. Obsidian MCP to be configured. |
