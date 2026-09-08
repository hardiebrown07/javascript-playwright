import { test as base } from '@playwright/test';
import { GovUkApiClient } from '../api/client';
import { getEnvironment } from '../config/environments';
import type { EnvironmentConfig } from '../config/types';

export interface ApiFixtures {
  env: EnvironmentConfig;
  api: GovUkApiClient;
}

/** `test` for API specs. No browser is launched unless a spec asks for `page`. */
export const test = base.extend<ApiFixtures>({
  env: async ({}, use) => {
    await use(getEnvironment());
  },

  api: async ({ playwright, env }, use) => {
    const context = await playwright.request.newContext();
    await use(new GovUkApiClient(context, env.baseURL));
    await context.dispose();
  },
});

export { expect } from '@playwright/test';
