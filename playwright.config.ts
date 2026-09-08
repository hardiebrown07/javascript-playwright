import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { getEnvironment } from './config/environments';

dotenv.config();

const env = getEnvironment();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI, // fail the build if a test.only was committed

  // Retry policy comes from the environment: none locally, more on shared
  // hosts where flakiness is likelier to be infrastructure than a real bug.
  retries: process.env.CI ? env.retries : 0,

  // 4 workers in CI and Docker; locally Playwright defaults to half the CPU cores.
  // Use --workers=1 for headed runs, or you get one browser window per worker.
  workers: process.env.CI || process.env.DOCKER ? 4 : undefined,

  timeout: env.timeouts.navigation * 2,
  expect: { timeout: env.timeouts.expect },

  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/test-results.json' }],
    ['list'],
  ],

  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    baseURL: env.baseURL,
    actionTimeout: env.timeouts.action,
    navigationTimeout: env.timeouts.navigation,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    testIdAttribute: 'id', // GOV.UK markup uses id rather than data-testid
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
