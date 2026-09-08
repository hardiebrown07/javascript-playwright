import { expect, test } from '../../fixtures/api.fixture';

/**
 * Using the API to derive what the UI is expected to show, rather than
 * hardcoding it.
 *
 * The value is not that it is faster. It is that the assertion cannot drift:
 * when the content team retitles the page, a test with the title hardcoded
 * fails and gets "fixed" by editing the string. This one fails only when the
 * API and the rendered page genuinely disagree, which is a real defect.
 */
test('the rendered page matches the content the API serves for it', async ({
  api,
  page,
  env,
}) => {
  const content = await test.step('Fetch the expected content', async () => {
    return api.getContent('/calculate-your-holiday-entitlement');
  });

  await test.step('Load the same page in a browser', async () => {
    await page.goto(`${env.baseURL}${content.base_path}`);
  });

  await test.step('The rendered title matches the published title', async () => {
    await expect(page.locator('h1')).toContainText(content.title);
  });

  await test.step('The rendered page is the path the API reported', async () => {
    expect(new URL(page.url()).pathname).toBe(content.base_path);
  });
});
