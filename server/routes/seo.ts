import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { seoService } from '../services/seo-service';
import { z } from 'zod';

export const seoRoutes = Router();

// GET /api/seo/keywords?niche=dscr&state=TX&city=Austin
seoRoutes.get('/keywords', (req, res) => {
  const niche = (req.query.niche as string) || 'dscr';
  const state = req.query.state as string | undefined;
  const city = req.query.city as string | undefined;
  res.json(seoService.clusterKeywords(niche, state, city));
});

// POST /api/seo/meta-tags
seoRoutes.post('/meta-tags', (req, res) => {
  try {
    const schema = z.object({
      name: z.string(),
      description: z.string().optional(),
      domain: z.string().optional(),
    });
    const site = schema.parse(req.body);
    res.json(seoService.generateMetaTags(site));
  } catch (err: any) {
    res.status(400).json({ error: 'Invalid input', details: err.errors });
  }
});

// POST /api/seo/structured-data
seoRoutes.post('/structured-data', (req, res) => {
  try {
    const schema = z.object({
      type: z.enum(['MortgageLender', 'LocalBusiness', 'FAQPage', 'Service']),
      data: z.record(z.any()),
    });
    const { type, data } = schema.parse(req.body);
    res.json({ structuredData: seoService.generateStructuredData(type, data) });
  } catch (err: any) {
    res.status(400).json({ error: 'Invalid input' });
  }
});

// GET /api/seo/sitemap/:domain
seoRoutes.get('/sitemap/:domain', (req, res) => {
  const domain = req.params.domain;
  const sitemap = seoService.generateSitemap(domain, [
    { path: '/', priority: 1.0, changefreq: 'daily' },
    { path: '/apply', priority: 0.9, changefreq: 'weekly' },
    { path: '/dscr-calculator', priority: 0.8, changefreq: 'weekly' },
    { path: '/rates', priority: 0.8, changefreq: 'daily' },
    { path: '/about', priority: 0.5, changefreq: 'monthly' },
    { path: '/contact', priority: 0.7, changefreq: 'monthly' },
  ]);
  res.set('Content-Type', 'application/xml');
  res.send(sitemap);
});

// GET /api/seo/robots/:domain
seoRoutes.get('/robots/:domain', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(seoService.generateRobots(req.params.domain));
});

// POST /api/seo/score
seoRoutes.post('/score', (req, res) => {
  try {
    const schema = z.object({
      title: z.string().optional(),
      metaDescription: z.string().optional(),
      h1: z.string().optional(),
      contentLength: z.number().optional(),
      hasSchema: z.boolean().optional(),
      hasImage: z.boolean().optional(),
      loadTime: z.number().optional(),
    });
    const data = schema.parse(req.body);
    res.json(seoService.scorePage(data));
  } catch {
    res.status(400).json({ error: 'Invalid input' });
  }
});

// POST /api/seo/geo-hints
seoRoutes.post('/geo-hints', (req, res) => {
  try {
    const { topic = 'dscr loan', context = '' } = req.body;
    res.json(seoService.generateGEOHints(String(topic), String(context)));
  } catch {
    res.status(400).json({ error: 'Invalid input' });
  }
});

// POST /api/seo/build-config — auth required
seoRoutes.post('/build-config', isAuthenticated, (req, res) => {
  try {
    const schema = z.object({
      site: z.object({
        name: z.string(),
        description: z.string().optional(),
        domain: z.string().optional(),
      }),
      template: z.string(),
    });
    const { site, template } = schema.parse(req.body);
    res.json(seoService.buildSitesSEOConfig(site, template));
  } catch (err: any) {
    res.status(400).json({ error: 'Invalid input' });
  }
});
