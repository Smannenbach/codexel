/**
 * Tenant Isolation Service — White-Label SaaS
 *
 * Each agency/reseller gets their own fully isolated Codexel instance:
 *   - Custom branding (logo, colors, domain)
 *   - Isolated data (all DB queries scoped by tenantId)
 *   - Custom SMTP (transactional emails from their domain)
 *   - Custom AI API keys (use their own OpenAI key)
 *   - Custom dashboard domain (app.theiragency.com)
 */

export interface TenantBranding {
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  companyName: string;
  tagline: string;
  dashboardDomain: string | null;   // custom CNAME, e.g. app.agency.com
  footerText: string;
  supportEmail: string;
  supportUrl: string;
}

export interface TenantSmtp {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;          // encrypted at rest
  fromName: string;
  fromEmail: string;
}

export interface TenantConfig {
  tenantId: string;
  planId: string;
  branding: TenantBranding;
  smtp: TenantSmtp | null;
  openaiApiKey: string | null;   // encrypted at rest
  cloudflareApiToken: string | null;
  features: {
    aiContent: boolean;
    seoBlitz: boolean;
    bulkDeploy: boolean;
    whiteLabel: boolean;
    apiAccess: boolean;
    resellerPanel: boolean;
    marketplace: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_BRANDING: TenantBranding = {
  logoUrl: '/logo.svg',
  faviconUrl: '/favicon.ico',
  primaryColor: '#2563eb',
  secondaryColor: '#7c3aed',
  fontFamily: 'Inter, system-ui, sans-serif',
  companyName: 'Codexel',
  tagline: 'AI-Powered Website Factory',
  dashboardDomain: null,
  footerText: 'Powered by Codexel',
  supportEmail: 'support@codexel.app',
  supportUrl: 'https://codexel.app/support',
};

export const PLAN_FEATURES: Record<string, TenantConfig['features']> = {
  starter: {
    aiContent: true, seoBlitz: true, bulkDeploy: false, whiteLabel: false,
    apiAccess: false, resellerPanel: false, marketplace: false,
  },
  pro: {
    aiContent: true, seoBlitz: true, bulkDeploy: true, whiteLabel: false,
    apiAccess: true, resellerPanel: false, marketplace: false,
  },
  agency: {
    aiContent: true, seoBlitz: true, bulkDeploy: true, whiteLabel: true,
    apiAccess: true, resellerPanel: true, marketplace: false,
  },
  enterprise: {
    aiContent: true, seoBlitz: true, bulkDeploy: true, whiteLabel: true,
    apiAccess: true, resellerPanel: true, marketplace: true,
  },
};

// ── Simple AES-256-GCM encryption for sensitive fields ───────────────────────

import crypto from 'crypto';

const ENC_KEY = Buffer.from(
  process.env.TENANT_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'),
  'hex'
).slice(0, 32);

export function encryptSecret(plaintext: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENC_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}.${tag.toString('hex')}.${encrypted.toString('hex')}`;
}

export function decryptSecret(ciphertext: string): string {
  const [ivHex, tagHex, encHex] = ciphertext.split('.');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const enc = Buffer.from(encHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', ENC_KEY, iv);
  decipher.setAuthTag(tag);
  return decipher.update(enc).toString('utf8') + decipher.final('utf8');
}

// ── Tenant config builder ─────────────────────────────────────────────────────

export function buildTenantConfig(
  tenantId: string,
  planId: string,
  overrides: Partial<TenantBranding> = {},
): TenantConfig {
  return {
    tenantId,
    planId,
    branding: { ...DEFAULT_BRANDING, ...overrides },
    smtp: null,
    openaiApiKey: null,
    cloudflareApiToken: null,
    features: PLAN_FEATURES[planId] || PLAN_FEATURES.starter,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ── CSS variable injection for white-label theming ───────────────────────────

export function buildThemeCss(branding: TenantBranding): string {
  return `:root {
  --brand-primary: ${branding.primaryColor};
  --brand-secondary: ${branding.secondaryColor};
  --brand-font: ${branding.fontFamily};
}`;
}

// ── Tenant resolution from request (hostname or JWT claim) ───────────────────

export function resolveTenantFromHost(hostname: string): string | null {
  // Custom dashboard domains resolve to tenant ID via DB lookup (stub)
  // In production: query DB WHERE branding->>'dashboardDomain' = hostname
  if (hostname.endsWith('.codexel.app')) {
    return hostname.replace('.codexel.app', '');
  }
  return null; // falls back to JWT tenantId claim
}
