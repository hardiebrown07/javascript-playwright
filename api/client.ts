import { APIRequestContext, APIResponse } from '@playwright/test';
import { z } from 'zod';
import {
  contentItemSchema,
  ContentItem,
  searchResponseSchema,
  SearchResponse,
} from './schemas';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly url: string,
    readonly body: string,
  ) {
    super(`${status} from ${url}: ${body.slice(0, 300)}`);
    this.name = 'ApiError';
  }
}

export class SchemaError extends Error {
  constructor(
    readonly url: string,
    readonly issues: z.core.$ZodIssue[],
  ) {
    const detail = issues
      .map((i) => `  ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    super(`Response from ${url} did not match its schema:\n${detail}`);
    this.name = 'SchemaError';
  }
}

/**
 * Typed client over Playwright's request context.
 *
 * Every call validates the response against a schema and returns a typed
 * object, so a contract break fails at the boundary with the offending field
 * named, rather than as `undefined is not an object` somewhere downstream.
 */
export class GovUkApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseURL: string,
  ) {}

  /** Fetches and validates in one step; throws with detail on either failure. */
  private async getValidated<T>(
    path: string,
    schema: z.ZodType<T>,
    params?: Record<string, string | number>,
  ): Promise<T> {
    const url = `${this.baseURL}${path}`;
    const response = await this.request.get(url, { params });

    if (!response.ok()) {
      throw new ApiError(response.status(), url, await response.text());
    }

    const parsed = schema.safeParse(await response.json());
    if (!parsed.success) {
      throw new SchemaError(url, parsed.error.issues);
    }
    return parsed.data;
  }

  /** Content for a page, keyed by its path, e.g. `/calculate-your-holiday-entitlement`. */
  async getContent(basePath: string): Promise<ContentItem> {
    return this.getValidated(`/api/content${basePath}`, contentItemSchema);
  }

  async search(query: string, count = 5): Promise<SearchResponse> {
    return this.getValidated('/api/search.json', searchResponseSchema, {
      q: query,
      count,
    });
  }

  /** Escape hatch for asserting on status codes and headers directly. */
  async raw(path: string): Promise<APIResponse> {
    return this.request.get(`${this.baseURL}${path}`);
  }
}
