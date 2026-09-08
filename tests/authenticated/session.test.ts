import { expect, test } from '../../fixtures/auth.fixture';

test('a saved session lands straight on the app, with no login form', async ({
  page,
  env,
}) => {
  // The app gates this page: see unauthenticated.test.ts, which asserts the
  // same navigation is refused without a session. Arriving here is therefore
  // evidence that the saved session was applied, not just that the page loads.
  await page.goto(`${env.authURL}/inventory.html`);

  await expect(page).toHaveURL(/inventory\.html/);
  await expect(page.locator('[data-test="error"]')).toHaveCount(0);
  await expect(page.locator('[data-test="login-button"]')).toHaveCount(0);
  await expect(page.locator('.inventory_list')).toBeVisible();
});

test('the saved session file carries a real session cookie', async ({ page, env }) => {
  await page.goto(`${env.authURL}/inventory.html`);

  const cookies = await page.context().cookies();
  const session = cookies.find((c) => c.name === 'session-username');

  expect(session, 'expected a session-username cookie from the saved state').toBeDefined();
  expect(session?.value).toBe('standard_user');
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
