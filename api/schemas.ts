import { z } from 'zod';

/**
 * Response contracts.
 *
 * These are the point of API testing in a UI framework. A status code and a
 * couple of field assertions tell you the endpoint answered; a schema tells
 * you the shape the front end depends on has not quietly changed. A removed
 * field or a string that became a number is the kind of break that otherwise
 * surfaces as a confusing UI failure days later.
 *
 * Deliberately not exhaustive: these describe the fields this suite relies
 * on. Asserting every field an API happens to return makes the tests fail on
 * changes that affect nobody.
 */

export const contentItemSchema = z.object({
  base_path: z.string().startsWith('/'),
  content_id: z.uuid(),
  title: z.string().min(1),
  description: z.string().nullable(),
  document_type: z.string().min(1),
  schema_name: z.string().min(1),
  locale: z.string().min(2),
  publishing_app: z.string().min(1),
  first_published_at: z.iso.datetime({ offset: true }),
  details: z.record(z.string(), z.unknown()),
  links: z.record(z.string(), z.unknown()),
});

export type ContentItem = z.infer<typeof contentItemSchema>;

export const searchResultSchema = z.object({
  title: z.string().min(1),
  link: z.string().min(1),
  description: z.string().nullable().optional(),
  index: z.string().optional(),
});

export const searchResponseSchema = z.object({
  total: z.number().int().nonnegative(),
  start: z.number().int().nonnegative(),
  results: z.array(searchResultSchema),
});

export type SearchResponse = z.infer<typeof searchResponseSchema>;
