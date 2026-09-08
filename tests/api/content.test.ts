import { expect, test } from '../../fixtures/api.fixture';
import { ApiError } from '../../api/client';

const CALCULATOR_PATH = '/calculate-your-holiday-entitlement';

test(
  'the calculator page exposes a valid content document',
  {
    tag: ['@smoke'],
  },
  async ({ api }) => {
    // Throws with the offending field named if the shape has drifted.
    const content = await api.getContent(CALCULATOR_PATH);

    expect(content.base_path).toBe(CALCULATOR_PATH);
    expect(content.title).toBe('Calculate holiday entitlement');
    expect(content.document_type).toBe('smart_answer');
    expect(content.locale).toBe('en');
  },
);

test('search returns matching, well-formed results', async ({ api }) => {
  const results = await api.search('holiday entitlement', 3);

  expect(results.total).toBeGreaterThan(0);
  expect(results.results).toHaveLength(3);

  for (const result of results.results) {
    expect(result.title.length).toBeGreaterThan(0);
    expect(result.link).toMatch(/^[/h]/); // a path or an absolute URL
  }
});

test('an unknown path returns 404 rather than an empty 200', async ({ api }) => {
  const response = await api.raw('/api/content/this-page-does-not-exist-8f3a2b');
  expect(response.status()).toBe(404);
});

test('the client raises ApiError, with status and URL, on a failed request', async ({
  api,
}) => {
  // Covers the client's own error handling. Swallow the 404 and return
  // undefined, and the failure surfaces somewhere further down instead.
  await expect(api.getContent('/this-page-does-not-exist-8f3a2b')).rejects.toThrow(
    ApiError,
  );
});
