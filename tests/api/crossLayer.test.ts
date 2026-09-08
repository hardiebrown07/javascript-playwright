import { expect, test } from '../../fixtures/api.fixture';

/**
 * Takes the expected title from the API instead of hardcoding it. When the
 * content team retitles this page, a hardcoded assertion breaks and someone
 * edits the string to match; this one breaks when the two layers disagree.
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
