import { Page, test as base } from '@playwright/test';
import { getEnvironment } from '../config/environments';
import { EnvironmentConfig } from '../config/types';
import { HolidayCalculatorPage } from '../pages/HolidayCalculatorPage';
import { ResultsPage } from '../pages/ResultsPage';
import { WorkPatternPage } from '../pages/WorkPatternPage';

export interface NetworkFixtures {
  env: EnvironmentConfig;
  holidayCalculatorPage: HolidayCalculatorPage;
  workPatternPage: WorkPatternPage;
  resultsPage: ResultsPage;
  /**
   * Hosts that answered during the test. Records `requestfinished`, not
   * `request`: the request event fires before routing decides, so an aborted
   * request still appears there and would make a blocking assertion pass
   * whether or not the block worked.
   */
  contactedHosts: string[];
  network: NetworkControls;
}

export interface NetworkControls {
  /** Drops every request to a host other than the one under test. */
  blockThirdParty(): Promise<void>;
  /** Answers matching requests with a status and an empty body. */
  failWith(pattern: string | RegExp, status: number): Promise<void>;
  /** Drops matching requests as though the host were unreachable. */
  abort(pattern: string | RegExp): Promise<void>;
}

function controls(page: Page, ownHost: string): NetworkControls {
  return {
    async blockThirdParty() {
      await page.route('**/*', (route) => {
        const host = new URL(route.request().url()).host;
        return host === ownHost ? route.continue() : route.abort();
      });
    },
    async failWith(pattern, status) {
      await page.route(pattern, (route) =>
        route.fulfill({ status, contentType: 'text/plain', body: '' }),
      );
    },
    async abort(pattern) {
      await page.route(pattern, (route) => route.abort());
    },
  };
}

/**
 * `test` for network specs. Unlike `pages.fixture` it does not navigate on its
 * own: routes have to be installed before the first request, so these tests
 * open the page themselves.
 */
export const test = base.extend<NetworkFixtures>({
  env: async ({}, use) => {
    await use(getEnvironment());
  },
  holidayCalculatorPage: async ({ page }, use) => {
    await use(new HolidayCalculatorPage(page));
  },
  workPatternPage: async ({ page }, use) => {
    await use(new WorkPatternPage(page));
  },
  resultsPage: async ({ page }, use) => {
    await use(new ResultsPage(page));
  },
  contactedHosts: async ({ page }, use) => {
    const hosts: string[] = [];
    page.on('requestfinished', (r) => hosts.push(new URL(r.url()).host));
    await use(hosts);
  },
  network: async ({ page, env }, use) => {
    await use(controls(page, new URL(env.baseURL).host));
  },
});

export { expect } from '@playwright/test';
