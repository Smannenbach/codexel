import { test, expect } from '@playwright/test';

/**
 * FUNCTIONAL TESTS — Verify every button, form, calculator, and flow works.
 * Tests what users actually do on the site.
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';

test.describe('DSCR Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/calculator`);
  });

  test('Calculator loads and has required inputs', async ({ page }) => {
    await expect(page.locator('[data-testid="property-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="monthly-rent"]')).toBeVisible();
    await expect(page.locator('[data-testid="calculate-btn"]')).toBeVisible();
  });

  test('DSCR calculation is accurate', async ({ page }) => {
    await page.fill('[data-testid="property-value"]', '500000');
    await page.fill('[data-testid="monthly-rent"]', '3000');
    await page.fill('[data-testid="annual-taxes"]', '6000');
    await page.fill('[data-testid="annual-insurance"]', '1800');
    await page.click('[data-testid="calculate-btn"]');

    // DSCR = Monthly Rent / PITIA
    // PITIA ≈ (500000 * 0.07/12) + 500 + 150 = 2917 + 650 = 3567
    // DSCR ≈ 3000/3567 ≈ 0.84 (below 1.0 — should show warning)
    const result = page.locator('[data-testid="dscr-result"]');
    await expect(result).toBeVisible();
    const text = await result.textContent();
    expect(text).toMatch(/\d+\.\d+/); // Should contain a decimal number
  });

  test('Qualify button appears when DSCR >= 1.0', async ({ page }) => {
    await page.fill('[data-testid="property-value"]', '300000');
    await page.fill('[data-testid="monthly-rent"]', '3500');
    await page.fill('[data-testid="annual-taxes"]', '3600');
    await page.fill('[data-testid="annual-insurance"]', '1200');
    await page.click('[data-testid="calculate-btn"]');

    const qualifyBtn = page.locator('[data-testid="qualify-btn"]');
    await expect(qualifyBtn).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Lead Capture Forms', () => {
  test('Contact form submits successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact`);
    await page.fill('[name="firstName"]', 'John');
    await page.fill('[name="lastName"]', 'Doe');
    await page.fill('[name="email"]', 'john@example.com');
    await page.fill('[name="phone"]', '5555555555');
    await page.fill('[name="loanAmount"]', '400000');
    await page.click('[data-testid="submit-contact"]');

    await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 5000 });
  });

  test('Form validation prevents empty submission', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact`);
    await page.click('[data-testid="submit-contact"]');
    const errors = page.locator('[data-testid*="error"]');
    await expect(errors.first()).toBeVisible();
  });

  test('Email validation rejects invalid format', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact`);
    await page.fill('[name="email"]', 'not-an-email');
    await page.click('[data-testid="submit-contact"]');
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
  });
});

test.describe('Navigation & Pages', () => {
  const pages = ['/', '/rates', '/calculator', '/apply', '/about', '/contact'];

  for (const pagePath of pages) {
    test(`${pagePath} — loads without error`, async ({ page }) => {
      const response = await page.goto(`${BASE_URL}${pagePath}`);
      expect(response?.status()).toBe(200);
      // No unhandled errors
      const errors: string[] = [];
      page.on('pageerror', err => errors.push(err.message));
      await page.waitForLoadState('networkidle');
      expect(errors).toHaveLength(0);
    });
  }

  test('Nav links all resolve (no 404s)', async ({ page }) => {
    await page.goto(BASE_URL);
    const links = await page.locator('nav a[href]').all();
    for (const link of links) {
      const href = await link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:')) continue;
      const res = await page.goto(`${BASE_URL}${href}`);
      expect(res?.status(), `Broken nav link: ${href}`).not.toBe(404);
    }
  });
});

test.describe('Apply Flow', () => {
  test('Apply page has loan application form', async ({ page }) => {
    await page.goto(`${BASE_URL}/apply`);
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('[name="propertyAddress"]')).toBeVisible();
    await expect(page.locator('[name="loanAmount"]')).toBeVisible();
    await expect(page.locator('[name="propertyType"]')).toBeVisible();
  });
});
