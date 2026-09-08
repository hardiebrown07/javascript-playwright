import { expect, test } from '../../fixtures/auth.fixture';

test('a saved session lands straight on the app, with no login form', async ({
  page,
  env,
}) => {
  // Navigating to the root would normally show the login form. The project's
  // storageState means we arrive already signed in.
  await page.goto(`${env.authURL}/inventory.html`);

  await expect(page).toHaveURL(/inventory\.html/);
  await expect(page.locator('[data-test="login-button"]')).toHaveCount(0);
  await expect(page.locator('.inventory_list')).toBeVisible();
});

test('the session survives a full page reload', async ({ page, env }) => {
  await page.goto(`${env.authURL}/inventory.html`);
  await page.reload();

  await expect(page).toHaveURL(/inventory\.html/);
  await expect(page.locator('.inventory_list')).toBeVisible();
});

test('a second role can be opened alongside the default one', async ({
  page,
  pageAs,
  env,
}) => {
  await page.goto(`${env.authURL}/inventory.html`);
  await expect(page.locator('.inventory_list')).toBeVisible();

  // Same test, a different identity, neither of them logging in.
  const problemPage = await pageAs('problem');
  await problemPage.goto(`${env.authURL}/inventory.html`);
  await expect(problemPage.locator('.inventory_list')).toBeVisible();
});
