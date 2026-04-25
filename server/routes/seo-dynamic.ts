import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { seoService } from '../services/seo-service';
import { db } from '../db';
import { sites, siteSeoMetrics } from '@shared/schema';
import { eq } from 'drizzle-orm';

export const seoDynamicRoutes = Router();

// GET /sitemap.xml — served for deployed sites
seoDynamicRoutes.get('/sitemap.xml', async (req, res) => {
  try {
    const hostname = req.hostname;
    const [site] = await db.select().from(sites).where(eq(sites.domain, hostname)).limit(1);
    if (!site) return res.status(404).send('Not found');

    const sitemap = seoService.generateSitemap(hostname, [
      { path: '/', priority: 1.0, changefreq: 'daily' },
      { path: '/apply', priority: 0.9, changefreq: 'weekly' },
      { path: '/dscr-calculator', priority: 0.8, changefreq: 'weekly' },
      { path: '/rates', priority: 0.8, changefreq: 'daily' },
      { path: '/contact', priority: 0.7, changefreq: 'monthly' },
    ]);
    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch {
    res.status(500).send('Error generating sitemap');
  }
});

// GET /robots.txt — served for deployed sites
seoDynamicRoutes.get('/robots.txt', async (req, res) => {
  try {
    const hostname = req.hostname;
    const [site] = await db.select().from(sites).where(eq(sites.domain, hostname)).limit(1);
    if (!site) return res.status(404).send('Not found');

    res.set('Content-Type', 'text/plain');
    res.send(seoService.generateRobots(hostname));
  } catch {
    res.status(500).send('Error generating robots.txt');
  }
});

// GET /api/seo/sites/:siteId/config — auth required
seoDynamicRoutes.get('/api/seo/sites/:siteId/config', isAuthenticated, async (req, res) => {
  try {
    const siteId = parseInt(req.params.siteId);
    const [site] = await db.select().from(sites).where(eq(sites.id, siteId)).limit(1);
    if (!site) return res.status(404).json({ error: 'Site not found' });

    const config = seoService.buildSitesSEOConfig(
      { name: site.name, description: undefined, domain: site.domain ?? undefined },
      (site.config as any)?.templateId ?? 'dscr-landing',
    );
    res.json(config);
  } catch {
    res.status(500).json({ error: 'Failed to get SEO config' });
  }
});

// POST /api/seo/sites/:siteId/config — save SEO config
seoDynamicRoutes.post('/api/seo/sites/:siteId/config', isAuthenticated, async (req, res) => {
  try {
    const siteId = parseInt(req.params.siteId);
    const { keyword, currentRank, searchVolume, difficulty, url } = req.body;

    const [site] = await db.select().from(sites).where(eq(sites.id, siteId)).limit(1);
    if (!site) return res.status(404).json({ error: 'Site not found' });

    const [saved] = await db.insert(siteSeoMetrics).values({
      siteId,
      keyword: keyword ?? 'DSCR loan',
      currentRank: currentRank ?? null,
      searchVolume: searchVolume ?? null,
      difficulty: difficulty ?? null,
      url: url ?? site.domain,
    }).returning();

    res.status(201).json(saved);
  } catch {
    res.status(500).json({ error: 'Failed to save SEO config' });
  }
});
