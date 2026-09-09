import AxeBuilder from '@axe-core/playwright';
import type { Page, TestInfo } from '@playwright/test';
import { test as base } from './pages.fixture';

/** WCAG 2.2 AA, which is what the UK public sector accessibility regulations require. */
const WCAG_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

export interface A11yFixtures {
  scanPage: (name: string) => Promise<void>;
}

/**
 * Attaches the full axe result to the test before asserting, so a failure
 * arrives with the offending selectors and rule descriptions rather than a
 * count that sends you back to reproduce it by hand.
 */
async function scan(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  const results = await new AxeBuilder({ page }).withTags(WCAG_AA).analyze();

  await testInfo.attach(`axe-${name}`, {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  });

  if (results.violations.length > 0) {
    const summary = results.violations
      .map(
        (v) =>
          `${v.id} (${v.impact}): ${v.help}\n` +
          v.nodes.map((n) => `    ${n.target.join(' ')}`).join('\n'),
      )
      .join('\n');
    throw new Error(
      `${results.violations.length} accessibility violations on ${name}:\n${summary}`,
    );
  }
}

export const test = base.extend<A11yFixtures>({
  scanPage: async ({ page }, use, testInfo) => {
    await use((name: string) => scan(page, testInfo, name));
  },
});

export { expect } from '@playwright/test';
