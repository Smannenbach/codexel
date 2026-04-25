/**
 * SEO Blitz Routes — Phase 4
 * POST /api/seo-blitz/run/:domain     — run full blitz on one domain
 * POST /api/seo-blitz/batch           — run blitz on all sites in DB (SSE)
 * GET  /api/seo-blitz/report/:domain  — get cached blitz report
 * GET  /api/seo-blitz/sitemap/:domain — serve sitemap XML
 * GET  /api/seo-blitz/robots/:domain  — serve robots.txt
 * GET  /api/seo-blitz/geo-pages/:domain — list generated geo pages
 */

import { Router } from 'express';
import { db } from '../db';
import { sites } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { analyzeDomain } from '../services/mortgage-content-engine';
import { runSeoBlitz } from '../services/seo-blitz';
import { optimizeForAISearch } from '../services/ai-search-optimizer';
import { getDomainsByWave } from '../services/domain-importer';

export const seoBlitzRoutes = Router();

// In-memory cache: domain → blitz result (replace with DB in production)
const blitzCache = new Map<string, { result: ReturnType<typeof runSeoBlitz>; aiContent: ReturnType<typeof optimizeForAISearch>; createdAt: Date }>();

// ── Run blitz on a single domain ──────────────────────────────────────────────
seoBlitzRoutes.post('/run/:domain', async (req, res) => {
  try {
    const domain = decodeURIComponent(req.params.domain);
    const analysis = analyzeDomain(domain);

    // Get related domains for internal linking (same wave)
    const wave1 = getDomainsByWave(1).map((d: { domain: string }) => d.domain);
    const related = wave1.filter((d: string) => d !== domain).slice(0, 5);

    const result = runSeoBlitz(analysis, related);
    const aiContent = optimizeForAISearch(analysis.niche, domain, analysis.brandName);

    blitzCache.set(domain, { result, aiContent, createdAt: new Date() });

    // Update site record SEO score in DB if exists
    try {
      await db.update(sites)
        .set({ config: { seoScore: result.score } as unknown as typeof sites.$inferInsert['config'] })
        .where(eq(sites.domain, domain));
    } catch { /* site may not exist yet */ }

    res.json({
      success: true,
      domain,
      score: result.score,
      keywordCount: result.keywords.primary.length + result.keywords.secondary.length + result.keywords.longTail.length,
      geoPagesCount: result.geoPages.length,
      aiSnippetsCount: aiContent.featuredSnippets.length,
      schemaCount: aiContent.schemas.length,
      summary: {
        primaryKeywords: result.keywords.primary,
        topGeoPages: result.geoPages.slice(0, 3).map((g: { slug: string }) => g.slug),
        eeat: { author: result.eeatSignals.authorName, license: result.eeatSignals.licenseInfo },
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ success: false, error: msg });
  }
});

// ── Batch blitz all sites via SSE ─────────────────────────────────────────────
seoBlitzRoutes.post('/batch', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const send = (data: Record<string, unknown>) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    if ((res as unknown as { flush?: () => void }).flush) (res as unknown as { flush: () => void }).flush();
  };

  try {
    // Get all deployed sites from DB
    const allSites = await db.select({ id: sites.id, domain: sites.domain }).from(sites);
    const total = allSites.length;

    send({ type: 'start', total, message: `Running SEO blitz on ${total} sites` });

    let done = 0;
    let scored = 0;
    const scoreSum = { total: 0 };

    for (const site of allSites) {
      try {
        const analysis = analyzeDomain(site.domain);
        const result = runSeoBlitz(analysis);
        const aiContent = optimizeForAISearch(analysis.niche, site.domain, analysis.brandName);
        blitzCache.set(site.domain, { result, aiContent, createdAt: new Date() });
        scoreSum.total += result.score;
        scored++;
        done++;

        send({
          type: 'progress',
          domain: site.domain,
          score: result.score,
          geoPages: result.geoPages.length,
          done,
          total,
        });
      } catch (err) {
        done++;
        send({ type: 'error', domain: site.domain, error: err instanceof Error ? err.message : 'Failed' });
      }

      // Yield to event loop
      await new Promise(r => setTimeout(r, 10));
    }

    send({
      type: 'complete',
      done,
      total,
      avgScore: scored > 0 ? Math.round(scoreSum.total / scored) : 0,
    });
  } catch (err) {
    send({ type: 'fatal', error: err instanceof Error ? err.message : 'Batch blitz failed' });
  } finally {
    res.end();
  }
});

// ── Get cached report ─────────────────────────────────────────────────────────
seoBlitzRoutes.get('/report/:domain', (req, res) => {
  const domain = decodeURIComponent(req.params.domain);
  const cached = blitzCache.get(domain);
  if (!cached) {
    return res.status(404).json({ success: false, error: 'No blitz report found. Run POST /run/:domain first.' });
  }
  res.json({ success: true, domain, blitz: cached.result, aiContent: cached.aiContent, cachedAt: cached.createdAt });
});

// ── Serve sitemap.xml ─────────────────────────────────────────────────────────
seoBlitzRoutes.get('/sitemap/:domain', (req, res) => {
  const domain = decodeURIComponent(req.params.domain);
  const cached = blitzCache.get(domain);
  if (!cached) {
    return res.status(404).send('Sitemap not generated. Run blitz first.');
  }
  res.setHeader('Content-Type', 'application/xml');
  res.send(cached.result.sitemapXml);
});

// ── Serve robots.txt ──────────────────────────────────────────────────────────
seoBlitzRoutes.get('/robots/:domain', (req, res) => {
  const domain = decodeURIComponent(req.params.domain);
  const cached = blitzCache.get(domain);
  if (!cached) {
    return res.status(404).send('Robots.txt not generated. Run blitz first.');
  }
  res.setHeader('Content-Type', 'text/plain');
  res.send(cached.result.robotsTxt);
});

// ── Get geo pages for a domain ────────────────────────────────────────────────
seoBlitzRoutes.get('/geo-pages/:domain', (req, res) => {
  const domain = decodeURIComponent(req.params.domain);
  const cached = blitzCache.get(domain);
  if (!cached) {
    return res.status(404).json({ success: false, error: 'No blitz data. Run POST /run/:domain first.' });
  }
  res.json({ success: true, domain, geoPages: cached.result.geoPages, count: cached.result.geoPages.length });
});
