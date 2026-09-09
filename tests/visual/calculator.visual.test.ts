import { expect, test } from '../../fixtures/pages.fixture';

/**
 * Baselines are per-platform and are generated on Linux in CI, because that is
 * where they are compared. Font rendering differs enough between macOS and
 * Linux that a macOS baseline fails on every CI run for reasons no one can act
 * on. Regenerate with the update-baselines workflow, never locally.
 */

test('the first question renders as expected', async ({ page }) => {
  await expect(page).toHaveScreenshot('first-question.png', { fullPage: true });
});

test('the entitlement basis question renders as expected', async ({
  workPatternPage,
  page,
}) => {
  await workPatternPage.selectIrregularHours('no');
  await expect(page).toHaveScreenshot('entitlement-basis.png', { fullPage: true });
});

test('the validation error summary renders as expected', async ({ workPatternPage }) => {
  await workPatternPage.selectIrregularHours('no');
  await workPatternPage.selectHolidayEntitlement('days');
  await workPatternPage.selectWorkOutHolidayFor('full_year');
  await workPatternPage.enterDaysWorked('99');

  // The summary alone, not the page: a component-level baseline survives
  // unrelated changes elsewhere on the page.
  await expect(workPatternPage.getErrorElement()).toHaveScreenshot('error-summary.png');
});

test('the results page renders as expected', async ({
  workPatternPage,
  resultsPage,
  page,
}) => {
  await workPatternPage.selectIrregularHours('no');
  await workPatternPage.selectHolidayEntitlement('days');
  await workPatternPage.selectWorkOutHolidayFor('full_year');
  await workPatternPage.enterDaysWorked('5.0');
  await resultsPage.getHolidayEntitlementSummary().waitFor();

  await expect(page).toHaveScreenshot('results.png', { fullPage: true });
});
