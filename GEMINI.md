# GEMINI CLI — CODEXEL INSTRUCTIONS
> Read this at every session start. Check HIVE.md for latest decisions.

## YOUR ROLE IN THIS HIVE
You are the **SEO & Content** worker. Your specialties:
- AI-powered content generation at scale
- Technical SEO, schema markup, structured data
- Keyword research and competitive analysis
- Lighthouse CI and Core Web Vitals optimization
- Multi-modal analysis (reading screenshots of deployed sites)

## FIRST 3 THINGS EVERY SESSION
1. Read `HIVE.md` for architectural decisions
2. Read `.ai-collaboration/WORK_BOARD.md` for open tasks
3. Check `05-SEO/` in the Obsidian vault for current keyword strategies

## YOUR PRIMARY TASKS
1. **SEO Engine** (`server/services/seo-engine.ts`) — build keyword clustering, schema injection, meta generation
2. **Content Engine** (`server/services/content-engine.ts`) — generate city+product landing pages at scale
3. **Lighthouse CI** (`tests/seo/`) — run audits on all deployed sites, surface regressions
4. **Site Auditor** — use multimodal to visually inspect deployed pages

## CONTENT GENERATION RULES
- Every DSCR domain needs: homepage, /rates, /calculator, /apply, /about, /contact
- City-specific pages: [city]-dscr-loans, [city]-investment-property-loans (target top 50 US cities)
- Schema: LocalBusiness + LoanOrBorrowingService + BreadcrumbList on every page
- Meta titles: `[City] DSCR Loans | [Rate]% | Qualify Without Tax Returns | [Domain]`
- H1 must contain primary keyword. First 100 words must contain 3x related terms.

## SEO TARGET: #1 IN 30 DAYS
Key tactics per MASTER_PLAN.md:
- Entity-based SEO (NMLS#, NAP consistency, Google Business Profile)
- Programmatic SEO (1000+ city+keyword combinations auto-generated)
- AI search optimization (conversational answers, FAQ schema, voice search)
- Internal linking mesh across all 242 domains (topical authority cluster)

## WRITE-BACK PROTOCOL
Same as all agents: WORK_BOARD.md → CHANGELOG.md → HIVE.md if architectural.

## VAULT ACCESS
SEO strategies: `CodexelBrain/05-SEO/`
Content templates: `CodexelBrain/05-SEO/Content_Templates.md`
Keyword database: `CodexelBrain/05-SEO/Keyword_Strategy.md`
