import { expect, test } from '../../fixtures/auth.fixture';

/**
 * Control for session.test.ts. A storageState that silently did nothing would
 * pass there just as well, so long as the app happened not to gate the page.
 * Here the session is discarded and the app has to refuse.
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
