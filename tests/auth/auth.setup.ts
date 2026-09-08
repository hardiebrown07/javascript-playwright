import { expect, test as setup } from '@playwright/test';
import { credentialsFor, getEnvironment, storageStatePath } from '../../config/environments';
import { LoginPage } from '../../pages/LoginPage';
import { ROLES, Role } from '../../config/roles';

/**
 * Logs each role in once, before the suite runs, and writes the resulting
 * cookies and localStorage to disk. Every authenticated test then starts
 * already signed in.
 *
 * The point is not convenience. A suite of 300 tests that each log in through
 * the UI spends most of its wall-clock time on a form it is not testing, and
 * inherits a failure mode where one flaky login fails an unrelated assertion.
 */
for (const role of ROLES) {
  setup(`authenticate as ${role}`, async ({ page }) => {
    const env = getEnvironment();
    const { username, password } = credentialsFor(role);
    const loginPage = new LoginPage(page);

    await setup.step(`Sign in as ${role}`, async () => {
      await loginPage.goto(env.authURL);
      await loginPage.login(username, password);
    });

    await setup.step('Confirm the session is established', async () => {
      // Landing on the inventory is the app's proof that login succeeded.
      // Asserting here means a credential problem fails in setup with a clear
      // message, rather than as a puzzling assertion failure in every test.
      await expect(page).toHaveURL(/inventory\.html/);
    });

    await page.context().storageState({ path: storageStatePath(role as Role) });
  });
}
