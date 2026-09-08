import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { getEnvironment, storageStatePath } from './config/environments';

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
    // Logs each role in once and saves its session to .auth/.
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'], testIdAttribute: 'data-test' },
    },

    // Contract tests. No browser is launched unless a spec asks for `page`,
    // so these run in milliseconds and gate the slower UI projects.
    {
      name: 'api',
      testDir: './tests/api',
      use: { ...devices['Desktop Chrome'] },
    },

    // Unauthenticated journeys against the calculator.
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: ['**/authenticated/**', '**/api/**', '**/*.setup.ts'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: ['**/authenticated/**', '**/api/**', '**/*.setup.ts'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: ['**/authenticated/**', '**/api/**', '**/*.setup.ts'],
    },

    // Starts signed in: no login step, no login flakiness.
    {
      name: 'authenticated',
      testMatch: '**/authenticated/**',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        testIdAttribute: 'data-test',
        storageState: storageStatePath('standard'),
      },
    },
  ],
});
