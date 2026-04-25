/**
 * Public API + Webhook System — White-Label SaaS
 *
 * Allows white-label customers to integrate Codexel with:
 *   - GoHighLevel, Zapier, Make, n8n, Pabbly
 *   - Custom CRMs and automation platforms
 *
 * Features:
 *   - API key generation (hashed, per-tenant)
 *   - Rate limiting per key (1000 req/day on Starter, unlimited on Enterprise)
 *   - Webhook registration + delivery (HMAC-SHA256 signed)
 *   - Webhook retry logic (3 retries, exponential backoff)
 *   - Webhook event log
 */

import crypto from 'crypto';

export interface ApiKey {
  id: string;
  tenantId: string;
  name: string;
  keyHash: string;         // bcrypt hash stored in DB
  keyPrefix: string;       // first 8 chars shown to user (e.g. "cxl_live_")
  scopes: ApiScope[];
  createdAt: Date;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
}

export type ApiScope =
  | 'sites:read'
  | 'sites:write'
  | 'leads:read'
  | 'leads:write'
  | 'deploy:write'
  | 'seo:write'
  | 'webhooks:manage'
  | 'billing:read';

export interface WebhookEndpoint {
  id: string;
  tenantId: string;
  url: string;
  events: WebhookEvent[];
  secret: string;          // HMAC secret (shown once on creation)
  enabled: boolean;
  createdAt: Date;
  failureCount: number;
  lastDeliveredAt: Date | null;
}

export type WebhookEvent =
  | 'site.created'
  | 'site.deployed'
  | 'site.updated'
  | 'lead.captured'
  | 'seo.blitz_complete'
  | 'billing.subscription_updated'
  | 'billing.payment_failed';

export interface WebhookDelivery {
  id: string;
  endpointId: string;
  event: WebhookEvent;
  payload: Record<string, unknown>;
  statusCode: number | null;
  attempt: number;
  success: boolean;
  responseBody: string | null;
  sentAt: Date;
}

// ── API Key Management ────────────────────────────────────────────────────────

export function generateApiKey(): { rawKey: string; prefix: string; hash: string } {
  // Format: cxl_live_<32 random hex chars>
  const random = crypto.randomBytes(32).toString('hex');
  const rawKey = `cxl_live_${random}`;
  const prefix = rawKey.slice(0, 12); // "cxl_live_xxxx"
  const hash = crypto.createHash('sha256').update(rawKey).digest('hex');
  return { rawKey, prefix, hash };
}

export function hashApiKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

export function validateApiKeyFormat(key: string): boolean {
  return /^cxl_live_[0-9a-f]{64}$/.test(key);
}

// ── Webhook Secret ────────────────────────────────────────────────────────────

export function generateWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(32).toString('hex')}`;
}

export function signWebhookPayload(secret: string, payload: string, timestamp: number): string {
  const signedContent = `${timestamp}.${payload}`;
  return crypto.createHmac('sha256', secret).update(signedContent).digest('hex');
}

export function buildWebhookHeaders(secret: string, payload: string): Record<string, string> {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signWebhookPayload(secret, payload, timestamp);
  return {
    'Content-Type': 'application/json',
    'X-Codexel-Signature': `t=${timestamp},v1=${signature}`,
    'X-Codexel-Event': '',  // set per call
    'User-Agent': 'Codexel-Webhooks/1.0',
  };
}

// ── Webhook Delivery ──────────────────────────────────────────────────────────

export async function deliverWebhook(
  endpoint: WebhookEndpoint,
  event: WebhookEvent,
  payload: Record<string, unknown>,
  attempt = 1,
): Promise<WebhookDelivery> {
  const payloadStr = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() });
  const headers = buildWebhookHeaders(endpoint.secret, payloadStr);
  headers['X-Codexel-Event'] = event;

  const delivery: WebhookDelivery = {
    id: crypto.randomUUID(),
    endpointId: endpoint.id,
    event,
    payload,
    statusCode: null,
    attempt,
    success: false,
    responseBody: null,
    sentAt: new Date(),
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const res = await fetch(endpoint.url, {
      method: 'POST',
      headers,
      body: payloadStr,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    delivery.statusCode = res.status;
    delivery.responseBody = await res.text().catch(() => null);
    delivery.success = res.status >= 200 && res.status < 300;
  } catch (err) {
    delivery.statusCode = 0;
    delivery.responseBody = err instanceof Error ? err.message : 'Network error';
    delivery.success = false;
  }

  // Retry logic: up to 3 attempts with exponential backoff
  if (!delivery.success && attempt < 3) {
    const delay = Math.pow(2, attempt) * 1000; // 2s, 4s
    await new Promise(r => setTimeout(r, delay));
    return deliverWebhook(endpoint, event, payload, attempt + 1);
  }

  return delivery;
}

// ── Broadcast to all matching endpoints ──────────────────────────────────────

export async function broadcastWebhookEvent(
  endpoints: WebhookEndpoint[],
  event: WebhookEvent,
  payload: Record<string, unknown>,
): Promise<WebhookDelivery[]> {
  const targets = endpoints.filter(e => e.enabled && e.events.includes(event));
  return Promise.all(targets.map(ep => deliverWebhook(ep, event, payload)));
}

// ── API Rate Limit Buckets (in-memory, replace with Redis in prod) ────────────

const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(apiKeyId: string, limitPerDay: number): { allowed: boolean; remaining: number } {
  if (limitPerDay === -1) return { allowed: true, remaining: -1 }; // unlimited

  const now = Date.now();
  const dayMs = 86400000;
  const bucket = rateLimitBuckets.get(apiKeyId);

  if (!bucket || now > bucket.resetAt) {
    rateLimitBuckets.set(apiKeyId, { count: 1, resetAt: now + dayMs });
    return { allowed: true, remaining: limitPerDay - 1 };
  }

  if (bucket.count >= limitPerDay) {
    return { allowed: false, remaining: 0 };
  }

  bucket.count++;
  return { allowed: true, remaining: limitPerDay - bucket.count };
}
