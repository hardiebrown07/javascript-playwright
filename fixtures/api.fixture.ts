import { test as base } from '@playwright/test';
import { GovUkApiClient } from '../api/client';
import { getEnvironment } from '../config/environments';
import { EnvironmentConfig } from '../config/types';

export interface ApiFixtures {
  env: EnvironmentConfig;
  api: GovUkApiClient;
}

/**
 * `test` for API specs.
 *
 * The third `test` object in the framework, and the reason the auto-navigate
 * fixture in `pages.fixture` had to stay opt-in: these tests never open a
 * browser page. They run in milliseconds and are the right place to catch a
 * contract break before the slower UI projects start.
 */
export const test = base.extend<ApiFixtures>({
  env: async ({}, use) => {
    await use(getEnvironment());
  },

  api: async ({ playwright, env }, use) => {
    // A request context of its own, rather than the browser's: no cookies, no
    // session, nothing inherited from a page.
    const context = await playwright.request.newContext();
    await use(new GovUkApiClient(context, env.baseURL));
    await context.dispose();
  },
});

export { expect } from '@playwright/test';
