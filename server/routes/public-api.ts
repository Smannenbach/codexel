/**
 * Public API Routes — White-Label SaaS
 * All routes under /api/v1/* are authenticated via API key (not JWT)
 *
 * GET  /api/v1/sites              — list tenant sites
 * POST /api/v1/sites              — create site
 * POST /api/v1/sites/:id/deploy   — deploy a site
 * GET  /api/v1/leads              — list leads
 * POST /api/v1/webhooks           — register webhook endpoint
 * GET  /api/v1/webhooks           — list webhook endpoints
 * DELETE /api/v1/webhooks/:id     — delete webhook endpoint
 * GET  /api/v1/usage              — current usage stats
 */

import { Router, Request, Response, NextFunction } from 'express';
import { hashApiKey, checkRateLimit, generateApiKey, generateWebhookSecret } from '../services/public-api';
import { db } from '../db';
import { sites } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export const publicApiRoutes = Router();

// ── In-memory API key store (replace with DB lookup in production) ────────────
// Structure: hash → { tenantId, scopes, planId, keyId }
const API_KEY_STORE = new Map<string, { tenantId: string; keyId: string; scopes: string[]; planId: string }>();
const WEBHOOK_STORE = new Map<string, { id: string; tenantId: string; url: string; events: string[]; secret: string; enabled: boolean }[]>();

// ── API Key middleware ────────────────────────────────────────────────────────
function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer cxl_live_')) {
    return res.status(401).json({ error: 'Invalid or missing API key', code: 'UNAUTHORIZED' });
  }

  const rawKey = authHeader.slice(7);
  const hash = hashApiKey(rawKey);
  const keyData = API_KEY_STORE.get(hash);

  if (!keyData) {
    return res.status(401).json({ error: 'API key not found or revoked', code: 'INVALID_KEY' });
  }

  // Rate limit: 1000 req/day on starter, -1 (unlimited) on enterprise
  const dailyLimit = keyData.planId === 'enterprise' ? -1 : keyData.planId === 'agency' ? 10000 : keyData.planId === 'pro' ? 5000 : 1000;
  const { allowed, remaining } = checkRateLimit(keyData.keyId, dailyLimit);

  if (!allowed) {
    return res.status(429).json({ error: 'Rate limit exceeded', code: 'RATE_LIMITED', retryAfter: '24h' });
  }

  res.setHeader('X-RateLimit-Remaining', remaining === -1 ? 'unlimited' : String(remaining));
  (req as Request & { apiTenant?: typeof keyData }).apiTenant = keyData;
  next();
}

// ── POST /api/v1/keys — generate a new API key (authenticated via JWT in app) ─
publicApiRoutes.post('/keys', async (req, res) => {
  try {
    const tenantId = (req as { userId?: string }).userId;
    if (!tenantId) return res.status(401).json({ error: 'Not authenticated' });

    const { name, scopes, planId = 'starter' } = req.body as { name: string; scopes: string[]; planId?: string };
    const { rawKey, prefix, hash } = generateApiKey();
    const keyId = `key_${Date.now()}`;

    API_KEY_STORE.set(hash, { tenantId, keyId, scopes: scopes || ['sites:read', 'leads:read'], planId });

    res.json({
      success: true,
      key: rawKey,       // shown ONCE — never returned again
      prefix,
      id: keyId,
      name,
      scopes,
      warning: 'Save this key now — it will not be shown again.',
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed' });
  }
});

// ── Apply API key auth to all /api/v1/* routes below ─────────────────────────
publicApiRoutes.use(requireApiKey);

// ── GET /api/v1/sites ─────────────────────────────────────────────────────────
publicApiRoutes.get('/sites', async (req, res) => {
  try {
    const tenant = (req as Request & { apiTenant?: { tenantId: string } }).apiTenant!;
    const allSites = await db.select().from(sites).where(eq(sites.tenantId, tenant.tenantId));
    res.json({ success: true, count: allSites.length, data: allSites });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed' });
  }
});

// ── POST /api/v1/sites ────────────────────────────────────────────────────────
publicApiRoutes.post('/sites', async (req, res) => {
  try {
    const tenant = (req as Request & { apiTenant?: { tenantId: string } }).apiTenant!;
    const { domain, name, templateId } = req.body as { domain: string; name: string; templateId?: string };

    if (!domain || !name) return res.status(400).json({ error: 'domain and name are required' });

    const [site] = await db.insert(sites).values({
      domain,
      name,
      tenantId: tenant.tenantId,
      templateId: templateId || 'dscr-default',
      status: 'draft',
      config: {
        title: name,
        description: '',
        keywords: [],
        primaryColor: '#2563eb',
        secondaryColor: '#7c3aed',
        phone: '',
        email: '',
        address: '',
        licenseNumber: '',
        nmlsNumber: '',
        statesLicensed: [],
        loanTypes: [],
        customContent: {},
      } as typeof sites.$inferInsert['config'],
    }).returning();

    res.status(201).json({ success: true, data: site });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed' });
  }
});

// ── GET /api/v1/usage ─────────────────────────────────────────────────────────
publicApiRoutes.get('/usage', async (req, res) => {
  try {
    const tenant = (req as Request & { apiTenant?: { tenantId: string; planId: string } }).apiTenant!;
    const siteCount = await db.select({ id: sites.id }).from(sites).where(eq(sites.tenantId, tenant.tenantId));

    res.json({
      success: true,
      tenantId: tenant.tenantId,
      planId: tenant.planId,
      usage: {
        sitesDeployed: siteCount.length,
        leadsThisMonth: 0,   // TODO: query from siteLeads table
        aiCreditsUsed: 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed' });
  }
});

// ── POST /api/v1/webhooks ─────────────────────────────────────────────────────
publicApiRoutes.post('/webhooks', (req, res) => {
  const tenant = (req as Request & { apiTenant?: { tenantId: string } }).apiTenant!;
  const { url, events } = req.body as { url: string; events: string[] };

  if (!url || !events?.length) return res.status(400).json({ error: 'url and events required' });

  const secret = generateWebhookSecret();
  const endpoint = { id: `wh_${Date.now()}`, tenantId: tenant.tenantId, url, events, secret, enabled: true };

  const existing = WEBHOOK_STORE.get(tenant.tenantId) || [];
  existing.push(endpoint);
  WEBHOOK_STORE.set(tenant.tenantId, existing);

  res.status(201).json({
    success: true,
    id: endpoint.id,
    url,
    events,
    secret,   // shown once
    warning: 'Save this webhook secret — it will not be shown again.',
  });
});

// ── GET /api/v1/webhooks ──────────────────────────────────────────────────────
publicApiRoutes.get('/webhooks', (req, res) => {
  const tenant = (req as Request & { apiTenant?: { tenantId: string } }).apiTenant!;
  const endpoints = (WEBHOOK_STORE.get(tenant.tenantId) || []).map(e => ({
    id: e.id, url: e.url, events: e.events, enabled: e.enabled,
    secret: `${e.secret.slice(0, 12)}...`,   // never expose full secret
  }));
  res.json({ success: true, count: endpoints.length, data: endpoints });
});

// ── DELETE /api/v1/webhooks/:id ───────────────────────────────────────────────
publicApiRoutes.delete('/webhooks/:id', (req, res) => {
  const tenant = (req as Request & { apiTenant?: { tenantId: string } }).apiTenant!;
  const existing = WEBHOOK_STORE.get(tenant.tenantId) || [];
  const filtered = existing.filter(e => e.id !== req.params.id);
  WEBHOOK_STORE.set(tenant.tenantId, filtered);
  res.json({ success: true, deleted: existing.length - filtered.length });
});
