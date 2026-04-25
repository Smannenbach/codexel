import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'tests/results/html-report' }],
    ['json', { outputFile: 'tests/results/results.json' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  snapshotDir: './tests/visual/snapshots',
  projects: [
    {
      name: 'smoke',
      testMatch: '**/smoke/*.test.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'functional',
      testMatch: '**/functional/*.test.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'visual-desktop',
      testMatch: '**/visual/*.test.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'visual-mobile',
      testMatch: '**/visual/*.test.ts',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'seo',
      testMatch: '**/seo/*.test.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'accessibility',
      testMatch: '**/accessibility/*.test.ts',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
