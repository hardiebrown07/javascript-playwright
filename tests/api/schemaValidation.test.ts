import { expect, test } from '../../fixtures/api.fixture';
import { contentItemSchema, searchResponseSchema } from '../../api/schemas';

/**
 * Control for content.test.ts. A schema that accepted anything would pass there
 * too, so these check that the breakages an API does ship get rejected,
 * and that the error names the field.
 */

async function validContent() {
  return {
    base_path: '/calculate-your-holiday-entitlement',
    content_id: '11a41426-4d09-4b73-b7c0-7c1a0bab63e4',
    title: 'Calculate holiday entitlement',
    description: 'Work out your holiday entitlement',
    document_type: 'smart_answer',
    schema_name: 'smart_answer',
    locale: 'en',
    publishing_app: 'smartanswers',
    first_published_at: '2014-09-01T10:00:00.000+01:00',
    details: {},
    links: {},
  };
}

test('a removed required field is rejected, and named', async () => {
  const { title: _title, ...withoutTitle } = await validContent();

  const result = contentItemSchema.safeParse(withoutTitle);

  expect(result.success).toBe(false);
  expect(result.error?.issues.map((i) => i.path.join('.'))).toContain('title');
});

test('a field whose type changed is rejected', async () => {
  // The classic silent break: a string becomes a number after a backend change.
  const drifted = { ...(await validContent()), title: 42 };

  const result = contentItemSchema.safeParse(drifted);

  expect(result.success).toBe(false);
  expect(result.error?.issues[0]?.path).toEqual(['title']);
});

test('a malformed value of the right type is rejected', async () => {
  // Right type, wrong shape: base_path must be a path, content_id a UUID.
  const malformed = {
    ...(await validContent()),
    base_path: 'calculate-your-holiday-entitlement',
    content_id: 'not-a-uuid',
  };

  const result = contentItemSchema.safeParse(malformed);
  const paths = result.error?.issues.map((i) => i.path.join('.')) ?? [];

  expect(result.success).toBe(false);
  expect(paths).toContain('base_path');
  expect(paths).toContain('content_id');
});

test('a nested array element is validated, not just the array', async () => {
  const badResults = {
    total: 5,
    start: 0,
    results: [{ title: 'fine', link: '/somewhere' }, { title: '', link: '/other' }],
  };

  const result = searchResponseSchema.safeParse(badResults);

  expect(result.success).toBe(false);
  expect(result.error?.issues[0]?.path).toEqual(['results', 1, 'title']);
});

test('the live response still satisfies the schema', async ({ api }) => {
  // The schema rejects the cases above and still accepts what GOV.UK serves.
  await expect(api.getContent('/calculate-your-holiday-entitlement')).resolves.toBeDefined();
});
