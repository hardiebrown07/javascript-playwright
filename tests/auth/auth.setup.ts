import { test as setup } from '@playwright/test';
import { credentialsFor, getEnvironment, storageStatePath } from '../../config/environments';
import { ROLES } from '../../config/roles';
import { getAuthStrategy } from '../../auth/strategies';
import { hasValidSession } from '../../auth/sessionStore';

/**
 * Signs each role in once, before the suite runs, and saves the resulting
 * cookies and localStorage to disk.
 *
 * A saved session that is still in date is reused rather than re-created, so
 * authentication persists across runs and not merely across the tests within
 * one run. On an SSO flow, where sign-in is a redirect chain rather than a
 * single form post, that is usually the slowest thing in the pipeline.
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
