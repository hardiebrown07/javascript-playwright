import { test as setup } from '@playwright/test';
import { credentialsFor, getEnvironment, storageStatePath } from '../../config/environments';
import { ROLES } from '../../config/roles';
import { getAuthStrategy } from '../../auth/strategies';
import { hasValidSession } from '../../auth/sessionStore';

/**
 * Signs each role in once and saves the session. A session still in date is
 * reused, so authentication persists across runs, not just across tests.
 */
for (const role of ROLES) {
  setup(`authenticate as ${role}`, async ({ page }) => {
    if (hasValidSession(role)) {
      setup.skip(true, `Reusing the saved session for "${role}"`);
      return;
    }

    const env = getEnvironment();
    const strategy = getAuthStrategy(env.authStrategy);

    await setup.step(`Sign in as ${role} using the ${strategy.name} strategy`, async () => {
      await strategy.authenticate(page, credentialsFor(role), env);
    });

    await page.context().storageState({ path: storageStatePath(role) });
  });
}
