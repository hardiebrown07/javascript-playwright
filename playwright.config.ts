import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI, // fail the build if a test.only was committed
  retries: process.env.CI ? 2 : 0,
  // 4 workers in CI and Docker; locally Playwright defaults to half the CPU cores.
  // Use --workers=1 for headed runs, or you get one browser window per worker.
  workers: process.env.CI || process.env.DOCKER ? 4 : undefined,

  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/test-results.json' }],
  ],

  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    testIdAttribute: 'id', // GOV.UK markup uses id rather than data-testid
    baseURL: process.env.BASE_URL || 'https://www.gov.uk',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
