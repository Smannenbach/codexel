# CODEXEL CHANGELOG
> Format: ## [YYYY-MM-DD] [Agent] — [Summary]
> All agents append here after completing work. Never delete entries.

---

## [2026-04-04] Copilot — HIVE Mind System & Obsidian Vault

### Added
- `CodexelBrain/` Obsidian vault with full 9-folder structure
- `HIVE.md` — shared agent memory, architectural decisions, known bugs
- `.ai-collaboration/WORK_BOARD.md` — atomic task claiming board for all AI agents
- `CHANGELOG.md` — this file
- `CLAUDE.md` — Claude Code specific instructions
- `GEMINI.md` — Gemini CLI specific instructions
- `.github/copilot-instructions.md` — GitHub Copilot specific instructions
- Obsidian vault nodes: QUEEN.md, AGENT_REGISTRY.md, Domain_Registry.md, System_Overview.md
- MCP configuration for obsidian-mcp (all AI tools)
- HIVE mind engine TypeScript skeleton: `server/services/hive/`
- Test infrastructure: `tests/smoke/`, `tests/visual/`, `tests/functional/`, `tests/seo/`

### Architecture Decisions Logged
- AD-001 through AD-007 written to HIVE.md
- Queen-Worker topology defined
- 4-tier memory OS architecture defined (Ephemeral/Session/Project/Global)

---

## [2026-04-03] Copilot — Initial Planning & Code Review

### Added
- `MASTER_PLAN.md` (25KB) — full project plan Phases 0–5
- `PRD.md` (13KB) — Product Requirements Document, 18 features
- `CodexelStudio/AGENTS.md` — universal AI instructions

### Discovered (Code Review)
- 8 critical security/correctness bugs (BUG-001 through BUG-008)
- Fake vs real orchestrator files (routes.ts imports fake)
- routes.ts is 1,500+ line god object
- All deployment services use in-memory storage (not persisted)
- userId hardcoded to 1 throughout (11+ files)

### Database
- 19 todos created covering Phases 1–5 + White-Label track
