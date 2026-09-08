import type { Page } from '@playwright/test';
import { test as base } from '@playwright/test';
import { getEnvironment, storageStatePath } from '../config/environments';
import type { Role } from '../config/roles';
import type { EnvironmentConfig } from '../config/types';

export interface AuthFixtures {
  env: EnvironmentConfig;
  /** A page signed in as another role, for tests needing two identities. */
  pageAs: (role: Role) => Promise<Page>;
}

/**
 * `test` for authenticated specs. Separate from `pages.fixture`, which
 * auto-navigates to the calculator. `page` arrives signed in via the
 * project's `storageState`.
 */
export const test = base.extend<AuthFixtures>({
  env: async ({}, use) => {
    await use(getEnvironment());
  },

  pageAs: async ({ browser }, use) => {
    const contexts = await Promise.resolve(
      [] as Awaited<ReturnType<typeof browser.newContext>>[],
    );

    const open = async (role: Role): Promise<Page> => {
      const context = await browser.newContext({
        storageState: storageStatePath(role),
      });
      contexts.push(context);
      return context.newPage();
    };

    await use(open);

    await Promise.all(contexts.map((c) => c.close()));
  },
});

export { expect } from '@playwright/test';
