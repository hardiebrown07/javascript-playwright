import { expect, test } from '../../fixtures/auth.fixture';

/**
 * The control for `session.test.ts`.
 *
 * Those tests show an authenticated page loading. On their own that proves
 * very little: if `storageState` were silently doing nothing and the app did
 * not actually gate the page, they would pass anyway. This spec runs the same
 * navigation with the session deliberately discarded and asserts it is
 * refused, so the two together demonstrate that the saved session is what
 * makes the difference.
 */
test.use({ storageState: { cookies: [], origins: [] } });

test('without a saved session the same page is refused', async ({ page, env }) => {
  await page.goto(`${env.authURL}/inventory.html`);

  await expect(page.locator('[data-test="error"]')).toContainText(
    "You can only access '/inventory.html' when you are logged in.",
  );
  await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  await expect(page.locator('.inventory_list')).toHaveCount(0);
});
