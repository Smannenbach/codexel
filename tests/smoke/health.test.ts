import { test, expect } from '@playwright/test';

/**
 * SMOKE TESTS — Run after every deployment.
 * Verifies all critical endpoints return expected responses.
 * Fast: should complete in < 30 seconds.
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000';

test.describe('API Health — Smoke Tests', () => {
  test('GET /api/health returns 200', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/health`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('status', 'ok');
  });

  test('Unauthenticated route returns 401 not 200', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/deployments`);
    expect(res.status()).toBe(401);
  });

  test('POST /api/auth/login returns token with valid credentials', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: process.env.TEST_EMAIL, password: process.env.TEST_PASSWORD }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('token');
    expect(body).toHaveProperty('user');
  });

  test('Stripe endpoints require authentication', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/subscriptions/create`, {
      data: { plan: 'pro' }
    });
    expect(res.status()).toBe(401);
  });

  test('GET /api/sites requires auth', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/sites`);
    expect(res.status()).toBe(401);
  });

  test('CORS headers present on API responses', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/health`);
    const headers = res.headers();
    expect(headers['access-control-allow-origin']).toBeDefined();
  });
});

test.describe('Deployed Site Health', () => {
  const testDomains = (process.env.TEST_DOMAINS || '').split(',').filter(Boolean);

  for (const domain of testDomains) {
    test(`${domain} — homepage returns 200`, async ({ request }) => {
      const res = await request.get(`https://${domain}`);
      expect(res.status()).toBe(200);
    });

    test(`${domain} — TLS valid`, async ({ page }) => {
      await page.goto(`https://${domain}`);
      // If TLS was invalid, Playwright would throw
      expect(page.url()).toContain(domain);
    });

    test(`${domain} — NMLS disclosure present`, async ({ page }) => {
      await page.goto(`https://${domain}`);
      const bodyText = await page.textContent('body');
      expect(bodyText).toContain('1831233');
    });
  }
});
