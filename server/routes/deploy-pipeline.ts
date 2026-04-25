/**
 * Deployment Pipeline Routes — Phase 3
 * Endpoints for wave-based mass deployment of Steve's 242 domains.
 *
 *  GET  /api/deploy/catalog           — full domain catalog with wave/priority
 *  GET  /api/deploy/stats             — wave stats summary
 *  POST /api/deploy/wave/:wave        — deploy all domains in a wave (SSE)
 *  POST /api/deploy/domain            — deploy a single domain
 *  GET  /api/deploy/status            — status of all deployed sites
 */

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { isAuthenticated } from '../auth';
import {
  ALL_DOMAINS,
  getDomainsByWave,
  getWaveStats,
  getHighPriorityDomains,
  type DomainEntry,
} from '../services/domain-importer';
import { batchDeployDomains, createSiteFromDomain } from '../services/site-factory';
import { batchDeploy, deploySite } from '../services/cloudflare-deployer';

const router = Router();

// ── Domain catalog ────────────────────────────────────────────────────────────
router.get('/catalog', (_req: Request, res: Response) => {
  res.json({
    success: true,
    catalog: ALL_DOMAINS,
    stats: getWaveStats(),
  });
});

router.get('/stats', (_req: Request, res: Response) => {
  const stats = getWaveStats();
  const highPriority = getHighPriorityDomains();
  res.json({
    success: true,
    stats,
    highPriorityCount: highPriority.length,
    categoryBreakdown: ALL_DOMAINS.reduce((acc, d) => {
      acc[d.category] = (acc[d.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  });
});

// ── Deploy a full wave (SSE stream) ──────────────────────────────────────────
router.post('/wave/:wave', isAuthenticated, async (req: Request, res: Response) => {
  const wave = parseInt(req.params.wave) as 1 | 2 | 3;
  if (![1, 2, 3].includes(wave)) {
    return res.status(400).json({ error: 'Wave must be 1, 2, or 3' });
  }

  const userId = (req as any).user?.id || (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { priorityOnly } = req.query;
  let waveDomains: DomainEntry[] = getDomainsByWave(wave);
  if (priorityOnly === 'true') {
    waveDomains = waveDomains.filter(d => d.priority === 'high');
  }

  // SSE setup
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    if ((res as any).flush) (res as any).flush();
  };

  send({ type: 'start', wave, total: waveDomains.length });

  // Step 1: Create site records
  send({ type: 'phase', phase: 'creating', message: 'Creating site records...' });
  const factoryProgress = await batchDeployDomains(
    waveDomains.map(d => d.domain),
    { userId, skipIfExists: true, generateAIContent: false },
    (prog) => {
      send({ type: 'factory_progress', ...prog });
    }
  );

  // Step 2: Deploy (DNS/staging)
  send({ type: 'phase', phase: 'deploying', message: 'Configuring deployment...' });
  const deployItems = factoryProgress.results
    .filter(r => r.success && r.siteId && r.error !== 'already_exists')
    .map(r => ({ domain: r.domain, siteId: r.siteId! }));

  // Also include already-existing sites that need to be (re)deployed
  const alreadyExistItems = factoryProgress.results
    .filter(r => r.error === 'already_exists' && r.siteId)
    .map(r => ({ domain: r.domain, siteId: r.siteId! }));

  const allDeployItems = [...deployItems, ...alreadyExistItems];

  if (allDeployItems.length > 0) {
    await batchDeploy(allDeployItems, (done, total, latest) => {
      send({ type: 'deploy_progress', done, total, latest });
    });
  }

  send({
    type: 'complete',
    wave,
    created: factoryProgress.completed,
    failed: factoryProgress.failed,
    deployed: allDeployItems.length,
  });
  res.end();
});

// ── Deploy a single domain ────────────────────────────────────────────────────
router.post('/domain', isAuthenticated, async (req: Request, res: Response) => {
  const schema = z.object({
    domain: z.string().min(3),
    deploy: z.boolean().default(true),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const userId = (req as any).user?.id || (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  // Create site record
  const factoryResult = await createSiteFromDomain(parsed.data.domain, {
    userId,
    skipIfExists: true,
    generateAIContent: true,
  });

  if (!factoryResult.success && factoryResult.error !== 'already_exists') {
    return res.status(500).json({ error: factoryResult.error });
  }

  let deployResult = null;
  if (parsed.data.deploy && factoryResult.siteId) {
    deployResult = await deploySite(parsed.data.domain, factoryResult.siteId);
  }

  res.json({
    success: true,
    site: factoryResult,
    deployment: deployResult,
  });
});

// ── Status of all deployed sites ──────────────────────────────────────────────
router.get('/status', isAuthenticated, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id || (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { db } = await import('../db');
  const { sites } = await import('@shared/schema');
  const { eq } = await import('drizzle-orm');

  const siteList = await db.select({
    id: sites.id,
    domain: sites.domain,
    name: sites.name,
    status: sites.status,
    deployedUrl: sites.deployedUrl,
    lastDeployedAt: sites.lastDeployedAt,
    templateId: sites.templateId,
    category: sites.category,
    leadCount: sites.leadCount,
    seoScore: sites.seoScore,
  })
  .from(sites)
  .where(eq(sites.userId, userId));

  const summary = {
    total: siteList.length,
    live: siteList.filter(s => s.status === 'live').length,
    deployed: siteList.filter(s => s.status === 'deployed').length,
    draft: siteList.filter(s => s.status === 'draft').length,
  };

  res.json({ success: true, sites: siteList, summary });
});

export { router as deployPipelineRoutes };
