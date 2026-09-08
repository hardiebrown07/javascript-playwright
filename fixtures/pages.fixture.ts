import { test as base } from '@playwright/test';
import { getEnvironment } from '../config/environments';
import { EnvironmentConfig } from '../config/types';
import { HolidayCalculatorPage } from '../pages/HolidayCalculatorPage';
import { LeaveDatePage } from '../pages/LeaveDatePage';
import { ResultsPage } from '../pages/ResultsPage';
import { WorkPatternPage } from '../pages/WorkPatternPage';

/** Resolved environment config, so tests can branch on capability. */
export interface Environment {
  env: EnvironmentConfig;
}

/** Page objects, constructed lazily: a test only builds what it destructures. */
export interface Pages {
  holidayCalculatorPage: HolidayCalculatorPage;
  workPatternPage: WorkPatternPage;
  leaveDatePage: LeaveDatePage;
  resultsPage: ResultsPage;
}

/**
 * Opens the calculator and lands on the first question. Marked `auto` because
 * TypeScript rejects a destructured fixture the test never reads. API specs
 * import their own `test`, so they never launch a browser for this.
 */
interface Journey {
  startedCalculator: void;
}

export const test = base.extend<Pages & Journey & Environment>({
  env: async ({}, use) => {
    await use(getEnvironment());
  },

  holidayCalculatorPage: async ({ page }, use) => {
    await use(new HolidayCalculatorPage(page));
  },

  workPatternPage: async ({ page }, use) => {
    await use(new WorkPatternPage(page));
  },

  leaveDatePage: async ({ page }, use) => {
    await use(new LeaveDatePage(page));
  },

  resultsPage: async ({ page }, use) => {
    await use(new ResultsPage(page));
  },

  startedCalculator: [
    async ({ holidayCalculatorPage, env }, use) => {
      await test.step('Open the Holiday Entitlement Calculator', async () => {
        await holidayCalculatorPage.navigate();
      });
      if (env.features.cookieBanner) {
        await test.step('Accept cookies if the banner is shown', async () => {
          await holidayCalculatorPage.acceptCookies();
        });
      }
      await test.step('Select the Start now button', async () => {
        await holidayCalculatorPage.selectStartNow();
      });
      await use();
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
