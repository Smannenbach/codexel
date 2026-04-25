# AGENTS.md — Codexel AI Development Instructions
## For: GitHub Copilot, Claude Code, Kimi, Gemini, Codex CLI

This file tells ALL AI agents how to work on the Codexel codebase.

---

## 🗂️ PLANNING DOCS — ALWAYS KEEP UPDATED

When you make changes to this codebase, you MUST update the relevant planning doc in:
`C:\Users\steve\OneDrive\Desktop\Codexel\`

| Doc | When to Update |
|-----|---------------|
| `MASTER_PLAN.md` | When phases complete, new features added, architecture changes |
| `PRD.md` | When feature requirements change, acceptance criteria met, new features scoped |
| `ROADMAP.md` | When a feature ships, status changes, new milestones added |
| `CHANGELOG.md` | After EVERY meaningful code change (auto-append entry) |

**Rule:** Never complete a task without appending to `CHANGELOG.md`.

---

## 🏗️ PROJECT OVERVIEW

**What is Codexel?**
An AI-powered website factory that deploys professional enterprise sites in < 5 minutes.
- Targets 242 Steve Mannenbach domains (DSCR lending, mortgage, lead gen)
- White-label SaaS platform for agencies and MLOs
- WordPress killer with AI agent swarms + Hive Mind cross-site learning

**Codebase:** `C:\Users\steve\OneDrive\Desktop\Codexel\CodexelStudio`
**Planning Docs:** `C:\Users\steve\OneDrive\Desktop\Codexel\`

---

## ⚠️ PHASE 0 — CRITICAL FIXES (Complete These First)

Do NOT build new features until these are fixed:

1. **CRIT-1** `server/auth.ts` — Auth middleware is a no-op (injects mock user, never rejects)
2. **CRIT-2** `shared/schema.ts` — FK type mismatch: `users.id` is varchar, FKs use integer
3. **CRIT-3** `server/routes.ts` — Triple-registered `/api/deployments` route collision
4. **CRIT-4** `server/routes.ts` lines 219, 369 — Server calling itself via HTTP (self-loop)
5. **CRIT-5** `server/routes/subscriptions.ts` — All Stripe routes unauthenticated
6. **CRIT-6** `server/services/caching-service.ts` line 186 — Cache key missing user ID (data leak)
7. **CRIT-7** `server/routes/phase11-routes.ts` line 215 — GitHub webhook no HMAC verification
8. **CRIT-8** `server/index.ts` lines 46-52 — Error handler re-throws after response sent

---

## 🏛️ ARCHITECTURE RULES

### DO NOT create new files in these locations without consolidating first:
- `server/services/` — Already has 40+ files, many duplicates. Reuse existing.
- `server/routes/` — Already has 25+ files. Add to existing route files, don't create new ones.

### Naming Convention
- All files: `kebab-case.ts` (not `camelCase.ts`)
- React components: `PascalCase.tsx`
- Hooks: `use-kebab-case.ts`

### Database
- ORM: Drizzle — always use schema types, never raw SQL strings
- Migrations: `npm run db:push` after schema changes
- Never hardcode `userId = 1` — always use `req.user?.claims?.sub`

### AI Services
- **KEEP:** `intelligent-ai-orchestrator.ts` (smart model selection)
- **KEEP:** `agent-orchestrator.ts` (real AI calls)
- **DELETE:** `ai-orchestrator.ts` (fake hardcoded responses — NOT real AI)
- Import AI services from `agent-orchestrator.ts`, never `ai-orchestrator.ts`

### Deployment Services  
- **KEEP:** `deployment-service.ts` (DB-backed — the real one)
- **DELETE:** `deploymentService.ts` (camelCase, all simulated setTimeout)

---

## 🔒 SECURITY RULES

- Never hardcode secrets, API keys, or tokens
- All routes touching user data MUST use `isAuthenticated` middleware
- All Stripe routes require authentication
- Cache keys must include user ID
- Input validation: use Zod schemas for all request bodies
- Max content length: 10,000 chars for AI chat inputs

---

## 📐 MULTI-TENANT ARCHITECTURE (Phase 1 goal)

All new features should support multi-tenancy:
- Data must be scoped to `tenantId`, not just `userId`
- New DB tables need `tenantId` foreign key
- API endpoints must validate tenant ownership before returning data

---

## 🧪 TESTING

- Run `npm run check` (TypeScript) before committing
- Test AI endpoints with real requests, not hardcoded mocks
- Deployment tests must actually attempt a deploy, not simulate

---

## 📝 CHANGELOG FORMAT

When you make changes, append to `C:\Users\steve\OneDrive\Desktop\Codexel\CHANGELOG.md`:

```
## [YYYY-MM-DD] - Agent: [Your AI Name]
### Fixed
- Description of fix (file: path/to/file.ts)
### Added  
- Description of addition
### Changed
- Description of change
### Deleted
- Files removed and why
```
