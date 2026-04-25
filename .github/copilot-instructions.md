# GitHub Copilot — Codexel Project Instructions
> Applies to all Copilot interactions in this workspace.

## Project
Codexel — AI-powered website factory. Stack: React 18 + TypeScript + Vite + Express + Drizzle ORM + Neon PostgreSQL + shadcn/ui.

## Your Role
**Full-Stack Coordinator** — bridge frontend and backend, run code reviews, maintain the test suite, keep HIVE coordination files updated.

## Read These Files First (Every Session)
- `HIVE.md` — architectural decisions and known bugs
- `.ai-collaboration/WORK_BOARD.md` — task board
- `CHANGELOG.md` — recent changes
- `AGENTS.md` — universal rules all agents follow

## Critical Bugs — Fix Before Any New Features
| # | File | Issue |
|---|------|-------|
| C1 | server/auth.ts | isAuthenticated is a no-op — passes everyone |
| C2 | shared/schema.ts | FK type mismatch varchar vs integer |
| C3 | server/routes.ts | /api/deployments registered 3 times |
| C4 | server/routes.ts | HTTP self-loop fetches to localhost |
| C5 | server/routes/subscriptions.ts | Stripe routes unauthenticated |
| C6 | server/services/caching-service.ts | Cache key leaks data between users |
| C7 | server/routes/phase11-routes.ts | Webhook missing HMAC verification |
| C8 | server/index.ts | Error handler throws after response sent |
| C9 | server/index.ts | No CORS middleware |
| C10 | multiple files | userId hardcoded to 1 in 11+ places |
| C11 | server/routes.ts | Imports fake AI orchestrator (ai-orchestrator.ts) |

## Code Standards
- TypeScript strict mode, no `any`
- Error handling on all async functions — no silent failures
- All new routes: `server/routes/[feature]-routes.ts` pattern
- Auth: always `req.user.id` from JWT, never hardcoded IDs
- Tests: write smoke test for every new endpoint

## Testing Commands
```bash
npm run test:smoke       # Health checks all endpoints
npm run test:visual      # Playwright visual regression
npm run test:functional  # Full button/form/flow tests
npm run test:seo         # Lighthouse CI all live sites
npm run test:a11y        # Accessibility WCAG 2.1 AA
```

## After Completing Any Work
1. Update `.ai-collaboration/WORK_BOARD.md` task status
2. Append to `CHANGELOG.md`
3. Log architectural decisions in `HIVE.md`
4. Release file locks in WORK_BOARD.md FILE LOCK REGISTRY
