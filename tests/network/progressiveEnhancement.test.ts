import { expect, test } from '../../fixtures/network.fixture';

/**
 * The GOV.UK Design System requires services to work without client-side
 * JavaScript. Blocking every script is the cheapest way to check that claim
 * holds, and it is a real defect on a government service when it does not.
 */
test('the calculation still works with all JavaScript blocked', async ({
  network,
  holidayCalculatorPage,
  workPatternPage,
  resultsPage,
}) => {
  await network.abort('**/*.js');

  await holidayCalculatorPage.navigate();
  await holidayCalculatorPage.acceptCookies();
  await holidayCalculatorPage.selectStartNow();
  await workPatternPage.selectIrregularHours('no');
  await workPatternPage.selectHolidayEntitlement('days');
  await workPatternPage.selectWorkOutHolidayFor('full_year');
  await workPatternPage.enterDaysWorked('4.0');

  await expect(resultsPage.getHolidayEntitlementSummary()).toContainText('22.4 days');
});

test('the page still renders when the stylesheet fails', async ({
  network,
  holidayCalculatorPage,
  page,
}) => {
  await network.abort('**/*.css');

  await holidayCalculatorPage.navigate();

  // Content and controls survive; only their presentation is lost.
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start now' })).toBeVisible();
});
