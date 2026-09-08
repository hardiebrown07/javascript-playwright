import { expect, test } from '../../fixtures/auth.fixture';

test(
  'a saved session lands straight on the app, with no login form',
  {
    tag: ['@smoke'],
  },
  async ({ page, env }) => {
    // unauthenticated.test.ts asserts this same navigation is refused without a
    // session, so reaching the inventory shows storageState was applied.
    await page.goto(`${env.authURL}/inventory.html`);

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator('[data-test="error"]')).toHaveCount(0);
    await expect(page.locator('[data-test="login-button"]')).toHaveCount(0);
    await expect(page.locator('.inventory_list')).toBeVisible();
  },
);

test('the saved session file carries a real session cookie', async ({ page, env }) => {
  await page.goto(`${env.authURL}/inventory.html`);

  const cookies = await page.context().cookies();
  const session = cookies.find((c) => c.name === 'session-username');

  expect(
    session,
    'expected a session-username cookie from the saved state',
  ).toBeDefined();
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

  // Two identities inside one test, and neither logs in.
  const problemPage = await pageAs('problem');
  await problemPage.goto(`${env.authURL}/inventory.html`);
  await expect(problemPage.locator('.inventory_list')).toBeVisible();
});
