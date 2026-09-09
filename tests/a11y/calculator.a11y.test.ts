import { test } from '../../fixtures/a11y.fixture';

/**
 * Scans each screen of the journey rather than the landing page alone. Most
 * accessibility defects live in form controls, error summaries and results,
 * none of which a scan of the first page ever reaches.
 */

test('the first question is accessible', { tag: ['@smoke'] }, async ({ scanPage }) => {
  await scanPage('irregular-hours');
});

test('the entitlement basis question is accessible', async ({
  workPatternPage,
  scanPage,
}) => {
  await workPatternPage.selectIrregularHours('no');
  await scanPage('entitlement-basis');
});

test('the days worked input is accessible', async ({ workPatternPage, scanPage }) => {
  await workPatternPage.selectIrregularHours('no');
  await workPatternPage.selectHolidayEntitlement('days');
  await workPatternPage.selectWorkOutHolidayFor('full_year');
  await scanPage('days-worked');
});

test('the validation error summary is accessible', async ({
  workPatternPage,
  scanPage,
}) => {
  await workPatternPage.selectIrregularHours('no');
  await workPatternPage.selectHolidayEntitlement('days');
  await workPatternPage.selectWorkOutHolidayFor('full_year');
  await workPatternPage.enterDaysWorked('99');
  await scanPage('validation-error');
});

test('the results page is accessible', async ({
  workPatternPage,
  resultsPage,
  scanPage,
}) => {
  await workPatternPage.selectIrregularHours('no');
  await workPatternPage.selectHolidayEntitlement('days');
  await workPatternPage.selectWorkOutHolidayFor('full_year');
  await workPatternPage.enterDaysWorked('5.0');
  await resultsPage.getHolidayEntitlementSummary().waitFor();
  await scanPage('results');
});
