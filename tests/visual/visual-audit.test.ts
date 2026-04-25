import { test, expect } from '@playwright/test';

/**
 * VISUAL AUDIT TESTS — Screenshot comparison + layout regression detection.
 * Run after deployments and on a nightly schedule.
 */

const SITES = (process.env.TEST_DOMAINS || 'localhost:5173').split(',').filter(Boolean);

test.describe('Visual Regression — Layout', () => {
  for (const site of SITES) {
    const url = site.startsWith('http') ? site : `http://${site}`;

    test(`${site} — homepage visual snapshot`, async ({ page }) => {
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000); // let fonts/images settle
      await expect(page).toHaveScreenshot(`${site.replace(/[:/]/g, '-')}-home.png`, {
        fullPage: true,
        threshold: 0.02, // 2% pixel diff tolerance
      });
    });

    test(`${site} — mobile viewport`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14
      await page.goto(url, { waitUntil: 'networkidle' });
      await expect(page).toHaveScreenshot(`${site.replace(/[:/]/g, '-')}-mobile.png`, {
        fullPage: true,
        threshold: 0.02,
      });
    });

    test(`${site} — no broken images`, async ({ page }) => {
      await page.goto(url);
      const brokenImages = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs.filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src);
      });
      expect(brokenImages, `Broken images: ${brokenImages.join(', ')}`).toHaveLength(0);
    });

    test(`${site} — no console errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      await page.goto(url, { waitUntil: 'networkidle' });
      expect(errors, `Console errors: ${errors.join('; ')}`).toHaveLength(0);
    });
  }
});

test.describe('Visual Audit — Critical Elements', () => {
  for (const site of SITES) {
    const url = site.startsWith('http') ? site : `http://${site}`;

    test(`${site} — CTA button visible above fold`, async ({ page }) => {
      await page.goto(url);
      const cta = page.locator('a[href*="apply"], button:has-text("Apply"), button:has-text("Get Started"), a:has-text("Apply Now")').first();
      await expect(cta).toBeVisible();
    });

    test(`${site} — NMLS disclosure in footer`, async ({ page }) => {
      await page.goto(url);
      const footer = page.locator('footer');
      await expect(footer).toContainText('NMLS');
    });

    test(`${site} — phone number clickable`, async ({ page }) => {
      await page.goto(url);
      const phoneLink = page.locator('a[href^="tel:"]').first();
      await expect(phoneLink).toBeVisible();
    });
  }
});
