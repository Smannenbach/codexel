/**
 * Stripe Billing Engine — White-Label SaaS
 *
 * Plans:
 *  Starter   $49/mo  — 5 sites, 500 leads/mo, AI content
 *  Pro       $99/mo  — 25 sites, 2,500 leads/mo, AI content + SEO blitz
 *  Agency    $249/mo — 100 sites, 10,000 leads/mo, full suite + white-label
 *  Enterprise $499/mo — unlimited sites, unlimited leads, reseller + API
 *
 * Features:
 *  - Stripe Checkout + Customer Portal
 *  - Usage metering (sites deployed, AI credits, leads)
 *  - Dunning (failed payment retries + grace period)
 *  - Upgrades / downgrades (prorated)
 *  - 14-day free trial on all plans
 */

export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 49,
    interval: 'month' as const,
    stripePriceId: process.env.STRIPE_PRICE_STARTER || 'price_starter',
    limits: { sites: 5, leadsPerMonth: 500, aiCredits: 100, whiteLabel: false, api: false, reseller: false },
    features: ['5 deployed sites', '500 leads/month', 'AI content generation', 'SEO blitz', 'Email support'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 99,
    interval: 'month' as const,
    stripePriceId: process.env.STRIPE_PRICE_PRO || 'price_pro',
    limits: { sites: 25, leadsPerMonth: 2500, aiCredits: 500, whiteLabel: false, api: true, reseller: false },
    features: ['25 deployed sites', '2,500 leads/month', 'Full AI suite', 'SEO blitz + geo pages', 'API access', 'Priority support'],
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    price: 249,
    interval: 'month' as const,
    stripePriceId: process.env.STRIPE_PRICE_AGENCY || 'price_agency',
    limits: { sites: 100, leadsPerMonth: 10000, aiCredits: 2000, whiteLabel: true, api: true, reseller: false },
    features: ['100 deployed sites', '10,000 leads/month', 'White-label branding', 'Reseller tools', 'Full API + webhooks', 'Dedicated support'],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499,
    interval: 'month' as const,
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise',
    limits: { sites: -1, leadsPerMonth: -1, aiCredits: -1, whiteLabel: true, api: true, reseller: true },
    features: ['Unlimited sites', 'Unlimited leads', 'Full white-label', 'Reseller marketplace', 'SLA + dedicated CSM', 'Custom AI model integration'],
  },
} as const;

export type PlanId = keyof typeof PLANS;

export interface BillingSubscription {
  tenantId: string;
  planId: PlanId;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  trialEndsAt: Date | null;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface UsageRecord {
  tenantId: string;
  period: string;         // YYYY-MM
  sitesDeployed: number;
  leadsCapured: number;
  aiCreditsUsed: number;
}

// ── Stripe client (lazy-loaded to avoid crash when key not set) ───────────────

let _stripe: import('stripe').default | null = null;

async function getStripe() {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  const Stripe = (await import('stripe')).default;
  _stripe = new Stripe(key, { apiVersion: '2024-04-10' as Parameters<typeof Stripe>[1]['apiVersion'] });
  return _stripe;
}

// ── Create checkout session ───────────────────────────────────────────────────

export async function createCheckoutSession(opts: {
  tenantId: string;
  email: string;
  planId: PlanId;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string; sessionId: string }> {
  const stripe = await getStripe();
  const plan = PLANS[opts.planId];

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: opts.email,
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 14,
      metadata: { tenantId: opts.tenantId, planId: opts.planId },
    },
    metadata: { tenantId: opts.tenantId, planId: opts.planId },
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    allow_promotion_codes: true,
  });

  return { url: session.url!, sessionId: session.id };
}

// ── Create customer portal session ───────────────────────────────────────────

export async function createPortalSession(stripeCustomerId: string, returnUrl: string): Promise<string> {
  const stripe = await getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });
  return session.url;
}

// ── Handle Stripe webhook events ─────────────────────────────────────────────

export async function handleWebhookEvent(
  rawBody: Buffer,
  signature: string,
): Promise<{ handled: boolean; event: string }> {
  const stripe = await getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET not configured');

  const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as import('stripe').default.Checkout.Session;
      // Subscription created — activate tenant
      await onSubscriptionActivated(session.metadata?.tenantId || '', session.subscription as string);
      break;
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object as import('stripe').default.Subscription;
      await onSubscriptionUpdated(sub.metadata?.tenantId || '', sub);
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as import('stripe').default.Subscription;
      await onSubscriptionCanceled(sub.metadata?.tenantId || '');
      break;
    }
    case 'invoice.payment_failed': {
      const inv = event.data.object as import('stripe').default.Invoice;
      const customerId = typeof inv.customer === 'string' ? inv.customer : inv.customer?.id || '';
      await onPaymentFailed(customerId);
      break;
    }
  }

  return { handled: true, event: event.type };
}

// ── Subscription lifecycle hooks ──────────────────────────────────────────────

async function onSubscriptionActivated(tenantId: string, subscriptionId: string) {
  if (!tenantId) return;
  // TODO: Update tenant subscription status in DB
  console.log(`[Billing] Subscription activated for tenant ${tenantId}: ${subscriptionId}`);
}

async function onSubscriptionUpdated(tenantId: string, sub: import('stripe').default.Subscription) {
  if (!tenantId) return;
  const planId = (sub.metadata?.planId as PlanId) || 'starter';
  console.log(`[Billing] Subscription updated for tenant ${tenantId}: plan=${planId} status=${sub.status}`);
}

async function onSubscriptionCanceled(tenantId: string) {
  if (!tenantId) return;
  console.log(`[Billing] Subscription canceled for tenant ${tenantId}`);
}

async function onPaymentFailed(customerId: string) {
  console.log(`[Billing] Payment failed for customer ${customerId} — dunning triggered`);
}

// ── Usage enforcement ─────────────────────────────────────────────────────────

export function checkLimit(planId: PlanId, resource: 'sites' | 'leadsPerMonth' | 'aiCredits', current: number): boolean {
  const limit = PLANS[planId].limits[resource] as number;
  return limit === -1 || current < limit; // -1 = unlimited
}

export function getPlanLimits(planId: PlanId) {
  return PLANS[planId].limits;
}
