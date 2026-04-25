import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { sites, siteLeads, siteSeoMetrics, tenants } from '@shared/schema';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import { isAuthenticated } from '../auth';

const router = Router();

// Stats route must be registered BEFORE /:id to avoid conflicts
// GET /api/sites/stats/overview — dashboard stats
router.get('/stats/overview', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const [stats] = await db.select({
      total: count(),
      live: count(sql`CASE WHEN status = 'live' THEN 1 END`),
      totalLeads: sql<number>`COALESCE(SUM(lead_count), 0)::int`,
      totalVisitors: sql<number>`COALESCE(SUM(monthly_visitors), 0)::int`,
    }).from(sites).where(eq(sites.userId, userId));

    res.json(stats || { total: 0, live: 0, totalLeads: 0, totalVisitors: 0 });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

router.use(isAuthenticated);

// GET /api/sites — list all sites for authenticated user
router.get('/', async (req, res) => {
  try {
    const userSites = await db.select().from(sites)
      .where(eq(sites.userId, req.user!.id))
      .orderBy(desc(sites.createdAt));
    res.json(userSites);
  } catch (error) {
    console.error('List sites error:', error);
    res.status(500).json({ error: 'Failed to list sites' });
  }
});

// POST /api/sites — create new site
router.post('/', async (req, res) => {
  try {
    const schema = z.object({
      domain: z.string().min(3),
      name: z.string().min(1),
      templateId: z.string().optional(),
      category: z.string().default('mortgage'),
      config: z.record(z.any()).optional(),
    });
    const data = schema.parse(req.body);

    const [site] = await db.insert(sites).values({
      ...data,
      config: data.config as any,
      userId: req.user!.id,
      status: 'draft',
    }).returning();

    res.status(201).json(site);
  } catch (error: any) {
    if (error.name === 'ZodError') return res.status(400).json({ error: error.errors });
    if (error.code === '23505') return res.status(409).json({ error: 'Domain already registered' });
    console.error('Create site error:', error);
    res.status(500).json({ error: 'Failed to create site' });
  }
});

// GET /api/sites/:id — get single site
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [site] = await db.select().from(sites)
      .where(and(eq(sites.id, id), eq(sites.userId, req.user!.id)));
    if (!site) return res.status(404).json({ error: 'Site not found' });
    res.json(site);
  } catch {
    res.status(500).json({ error: 'Failed to get site' });
  }
});

// PATCH /api/sites/:id — update site config
router.patch('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const allowed = z.object({
      name: z.string().optional(),
      templateId: z.string().optional(),
      category: z.string().optional(),
      config: z.record(z.any()).optional(),
      status: z.enum(['draft', 'building', 'live', 'paused', 'error']).optional(),
    });
    const data = allowed.parse(req.body);

    const [updated] = await db.update(sites)
      .set({ ...data, config: data.config as any, updatedAt: new Date() })
      .where(and(eq(sites.id, id), eq(sites.userId, req.user!.id)))
      .returning();

    if (!updated) return res.status(404).json({ error: 'Site not found' });
    res.json(updated);
  } catch (error: any) {
    if (error.name === 'ZodError') return res.status(400).json({ error: error.errors });
    res.status(500).json({ error: 'Failed to update site' });
  }
});

// DELETE /api/sites/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [deleted] = await db.delete(sites)
      .where(and(eq(sites.id, id), eq(sites.userId, req.user!.id)))
      .returning();
    if (!deleted) return res.status(404).json({ error: 'Site not found' });
    res.json({ message: 'Site deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete site' });
  }
});

// GET /api/sites/:id/leads/stats — lead statistics
router.get('/:id/leads/stats', async (req, res) => {
  try {
    const siteId = parseInt(req.params.id);
    const { leadService } = await import('../services/lead-service');
    const stats = await leadService.getLeadStats(siteId);
    res.json(stats);
  } catch {
    res.status(500).json({ error: 'Failed to get lead stats' });
  }
});

// GET /api/sites/:id/leads — get leads for a site
router.get('/:id/leads', async (req, res) => {
  try {
    const siteId = parseInt(req.params.id);
    const leads = await db.select().from(siteLeads)
      .where(eq(siteLeads.siteId, siteId))
      .orderBy(desc(siteLeads.createdAt));
    res.json(leads);
  } catch {
    res.status(500).json({ error: 'Failed to get leads' });
  }
});

// POST /api/sites/:id/leads — submit a lead (public endpoint, no auth required)
router.post('/:id/leads', async (req, res) => {
  try {
    const siteId = parseInt(req.params.id);
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      loanAmount: z.number().int().positive().optional(),
      propertyValue: z.number().int().positive().optional(),
      state: z.string().length(2).optional(),
      loanType: z.string().optional(),
      message: z.string().optional(),
      utmSource: z.string().optional(),
      utmMedium: z.string().optional(),
      utmCampaign: z.string().optional(),
    });
    const data = schema.parse(req.body);

    const [lead] = await db.insert(siteLeads).values({ ...data, siteId }).returning();

    await db.update(sites).set({
      leadCount: sql`${sites.leadCount} + 1`,
      updatedAt: new Date(),
    }).where(eq(sites.id, siteId));

    res.status(201).json({ success: true, leadId: lead.id });
  } catch (error: any) {
    if (error.name === 'ZodError') return res.status(400).json({ error: 'Invalid lead data', details: error.errors });
    res.status(500).json({ error: 'Failed to submit lead' });
  }
});

export default router;
