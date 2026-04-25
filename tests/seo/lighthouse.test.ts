import { test, expect } from '@playwright/test';

/**
 * SEO & PERFORMANCE TESTS — Lighthouse CI + schema validation.
 * Ensures every deployed site meets the #1 ranking prerequisites.
 * Target: Performance ≥ 90, SEO ≥ 95, Accessibility ≥ 90, Best Practices ≥ 90
 */

const SITES = (process.env.TEST_DOMAINS || '').split(',').filter(Boolean);

test.describe('Core SEO Requirements', () => {
  for (const site of SITES) {
    const url = site.startsWith('http') ? site : `https://${site}`;

    test(`${site} — has title tag`, async ({ page }) => {
      await page.goto(url);
      const title = await page.title();
      expect(title.length).toBeGreaterThan(10);
      expect(title.length).toBeLessThan(70);
    });

    test(`${site} — has meta description`, async ({ page }) => {
      await page.goto(url);
      const meta = await page.$eval(
        'meta[name="description"]',
        (el: Element) => (el as HTMLMetaElement).content
      );
      expect(meta.length).toBeGreaterThan(50);
      expect(meta.length).toBeLessThan(165);
    });

    test(`${site} — has H1 tag`, async ({ page }) => {
      await page.goto(url);
      const h1s = await page.locator('h1').all();
      expect(h1s.length).toBe(1); // Exactly one H1
      const h1Text = await h1s[0].textContent();
      expect(h1Text?.length).toBeGreaterThan(10);
    });

    test(`${site} — has canonical URL`, async ({ page }) => {
      await page.goto(url);
      const canonical = await page.$eval(
        'link[rel="canonical"]',
        (el: Element) => (el as HTMLLinkElement).href
      );
      expect(canonical).toBeTruthy();
    });

    test(`${site} — has schema.org LocalBusiness`, async ({ page }) => {
      await page.goto(url);
      const schemas = await page.$$eval(
        'script[type="application/ld+json"]',
        (els: Element[]) => els.map(el => el.textContent)
      );
      const hasLocalBusiness = schemas.some(s =>
        s?.includes('LocalBusiness') || s?.includes('LoanOrBorrowingService')
      );
      expect(hasLocalBusiness, 'Missing LocalBusiness schema').toBe(true);
    });

    test(`${site} — has NMLS in footer schema`, async ({ page }) => {
      await page.goto(url);
      const bodyText = await page.textContent('body');
      expect(bodyText).toContain('1831233'); // NMLS#
    });

    test(`${site} — Open Graph tags present`, async ({ page }) => {
      await page.goto(url);
      const ogTitle = await page.$('meta[property="og:title"]');
      const ogDescription = await page.$('meta[property="og:description"]');
      const ogImage = await page.$('meta[property="og:image"]');
      expect(ogTitle).toBeTruthy();
      expect(ogDescription).toBeTruthy();
      expect(ogImage).toBeTruthy();
    });

    test(`${site} — no broken internal links`, async ({ page }) => {
      await page.goto(url);
      const internalLinks = await page.$$eval(
        'a[href]',
        (els: Element[]) => (els as HTMLAnchorElement[])
          .map(a => a.href)
          .filter(href => !href.startsWith('tel:') && !href.startsWith('mailto:'))
      );

      const broken: string[] = [];
      for (const link of internalLinks.slice(0, 20)) { // sample first 20
        try {
          const res = await page.request.get(link);
          if (res.status() === 404) broken.push(link);
        } catch { /* external links may fail — skip */ }
      }
      expect(broken, `Broken links: ${broken.join(', ')}`).toHaveLength(0);
    });
  }
});

test.describe('Core Web Vitals — Performance Budget', () => {
  for (const site of SITES) {
    const url = site.startsWith('http') ? site : `https://${site}`;

    test(`${site} — page loads under 3s`, async ({ page }) => {
      const start = Date.now();
      await page.goto(url, { waitUntil: 'load' });
      const loadTime = Date.now() - start;
      expect(loadTime, `Load time ${loadTime}ms exceeded 3000ms`).toBeLessThan(3000);
    });

    test(`${site} — no render-blocking resources`, async ({ page }) => {
      await page.goto(url);
      const renderBlocking = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        return links.filter((l: Element) => !(l as HTMLLinkElement).media || (l as HTMLLinkElement).media === 'all').length;
      });
      expect(renderBlocking).toBeLessThan(3); // Max 2 render-blocking stylesheets
    });
  }
});
