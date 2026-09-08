import { test as base } from '@playwright/test';
import { HolidayCalculatorPage } from '../pages/HolidayCalculatorPage';
import { LeaveDatePage } from '../pages/LeaveDatePage';
import { ResultsPage } from '../pages/ResultsPage';
import { WorkPatternPage } from '../pages/WorkPatternPage';

/**
 * Page objects available to every test.
 *
 * Fixtures are constructed lazily, so a test that only destructures
 * `resultsPage` never builds the other three.
 */
export interface Pages {
  holidayCalculatorPage: HolidayCalculatorPage;
  workPatternPage: WorkPatternPage;
  leaveDatePage: LeaveDatePage;
  resultsPage: ResultsPage;
}

/**
 * Opens the calculator, clears the cookie banner and lands on the first
 * question. Every journey starts here, so it runs automatically rather than
 * being repeated as three steps at the top of each spec.
 *
 * It is `auto`, so tests do not name it. API tests, which should not launch a
 * browser at all, will import their own `test` from a separate fixture module
 * rather than this one.
 */
interface Journey {
  startedCalculator: void;
}

export const test = base.extend<Pages & Journey>({
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
    async ({ holidayCalculatorPage }, use) => {
      await test.step('Open the Holiday Entitlement Calculator', async () => {
        await holidayCalculatorPage.navigate();
      });
      await test.step('Accept cookies if the banner is shown', async () => {
        await holidayCalculatorPage.acceptCookies();
      });
      await test.step('Select the Start now button', async () => {
        await holidayCalculatorPage.selectStartNow();
      });
      await use();
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
