import { Page, test as base } from '@playwright/test';
import { getEnvironment, storageStatePath } from '../config/environments';
import { Role } from '../config/roles';
import { EnvironmentConfig } from '../config/types';

export interface AuthFixtures {
  env: EnvironmentConfig;
  /**
   * A page already signed in as the given role, without going through the
   * login form. Use for the cases where one test needs a second identity.
   */
  pageAs: (role: Role) => Promise<Page>;
}

/**
 * `test` for authenticated specs.
 *
 * Deliberately separate from `pages.fixture`: that one auto-navigates to the
 * calculator, which authenticated tests neither need nor want. Importing the
 * right `test` is how a spec declares what kind of test it is.
 *
 * The default `page` is already authenticated, because the project supplies
 * `storageState` in `playwright.config.ts`.
 */
export const test = base.extend<AuthFixtures>({
  env: async ({}, use) => {
    await use(getEnvironment());
  },

  pageAs: async ({ browser }, use) => {
    const contexts = await Promise.resolve([] as Awaited<ReturnType<typeof browser.newContext>>[]);

    const open = async (role: Role): Promise<Page> => {
      const context = await browser.newContext({
        storageState: storageStatePath(role),
      });
      contexts.push(context);
      return context.newPage();
    };

    await use(open);

    // Tear down every context this test opened, whatever it did with them.
    await Promise.all(contexts.map((c) => c.close()));
  },
});

export { expect } from '@playwright/test';
