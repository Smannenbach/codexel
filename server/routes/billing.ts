/**
 * Billing Routes — White-Label SaaS
 * POST /api/billing/checkout          — create Stripe checkout session
 * POST /api/billing/portal            — create customer portal session
 * POST /api/billing/webhook           — Stripe webhook endpoint (raw body)
 * GET  /api/billing/plans             — public plan listing
 * GET  /api/billing/subscription      — current tenant subscription
 * POST /api/billing/cancel            — cancel at period end
 */

import { Router, raw } from 'express';
import { PLANS, createCheckoutSession, createPortalSession, handleWebhookEvent, getPlanLimits } from '../services/billing';
import type { PlanId } from '../services/billing';

export const billingRoutes = Router();

// ── Public: list plans ────────────────────────────────────────────────────────
billingRoutes.get('/plans', (_req, res) => {
  const plans = Object.values(PLANS).map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    interval: p.interval,
    features: p.features,
    limits: p.limits,
  }));
  res.json({ success: true, plans });
});

// ── Create checkout session ───────────────────────────────────────────────────
billingRoutes.post('/checkout', async (req, res) => {
  try {
    const { planId, email } = req.body as { planId: PlanId; email: string };
    if (!planId || !PLANS[planId]) {
      return res.status(400).json({ success: false, error: 'Invalid planId' });
    }
    const tenantId = (req as { userId?: string }).userId || 'unknown';
    const origin = req.headers.origin || 'http://localhost:5000';

    const session = await createCheckoutSession({
      tenantId,
      email,
      planId,
      successUrl: `${origin}/onboarding?session={CHECKOUT_SESSION_ID}&plan=${planId}`,
      cancelUrl: `${origin}/pricing`,
    });

    res.json({ success: true, url: session.url, sessionId: session.sessionId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Checkout failed';
    if (msg.includes('STRIPE_SECRET_KEY')) {
      return res.status(503).json({ success: false, error: 'Billing not yet configured — add STRIPE_SECRET_KEY to .env' });
    }
    res.status(500).json({ success: false, error: msg });
  }
});

// ── Customer portal ───────────────────────────────────────────────────────────
billingRoutes.post('/portal', async (req, res) => {
  try {
    const { stripeCustomerId } = req.body as { stripeCustomerId: string };
    if (!stripeCustomerId) return res.status(400).json({ success: false, error: 'stripeCustomerId required' });
    const origin = req.headers.origin || 'http://localhost:5000';
    const url = await createPortalSession(stripeCustomerId, `${origin}/settings/billing`);
    res.json({ success: true, url });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Portal failed' });
  }
});

// ── Stripe webhook (needs raw body) ──────────────────────────────────────────
billingRoutes.post('/webhook',
  raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    if (!sig) return res.status(400).json({ error: 'Missing stripe-signature' });

    try {
      const result = await handleWebhookEvent(req.body as Buffer, sig);
      res.json({ received: true, event: result.event });
    } catch (err) {
      console.error('[Billing Webhook]', err);
      res.status(400).json({ error: err instanceof Error ? err.message : 'Webhook failed' });
    }
  }
);

// ── Get plan limits for current plan ─────────────────────────────────────────
billingRoutes.get('/limits/:planId', (req, res) => {
  const planId = req.params.planId as PlanId;
  if (!PLANS[planId]) return res.status(404).json({ success: false, error: 'Unknown plan' });
  res.json({ success: true, planId, limits: getPlanLimits(planId) });
});
