import { expect, test } from '../../fixtures/network.fixture';

const OWN_HOST = 'www.gov.uk';

test(
  'the journey completes with every third party blocked',
  {
    tag: ['@smoke'],
  },
  async ({
    network,
    contactedHosts,
    holidayCalculatorPage,
    workPatternPage,
    resultsPage,
  }) => {
    await network.blockThirdParty();

    await holidayCalculatorPage.navigate();
    await holidayCalculatorPage.acceptCookies();
    await holidayCalculatorPage.selectStartNow();
    await workPatternPage.selectIrregularHours('no');
    await workPatternPage.selectHolidayEntitlement('days');
    await workPatternPage.selectWorkOutHolidayFor('full_year');
    await workPatternPage.enterDaysWorked('5.0');

    await expect(resultsPage.getHolidayEntitlementSummary()).toContainText('28 days');

    const thirdParty = [...new Set(contactedHosts)].filter((h) => h !== OWN_HOST);
    expect(thirdParty, 'no third party should have answered').toEqual([]);
  },
);

test('the journey survives analytics returning errors', async ({
  network,
  holidayCalculatorPage,
  workPatternPage,
  resultsPage,
}) => {
  // Analytics failing should not affect a user. Asserting that stops a
  // third-party outage from turning into red builds nobody can action.
  await network.failWith(/googletagmanager|google-analytics|doubleclick/, 503);

  await holidayCalculatorPage.navigate();
  await holidayCalculatorPage.acceptCookies();
  await holidayCalculatorPage.selectStartNow();
  await workPatternPage.selectIrregularHours('no');
  await workPatternPage.selectHolidayEntitlement('days');
  await workPatternPage.selectWorkOutHolidayFor('full_year');
  await workPatternPage.enterDaysWorked('3.0');

  await expect(resultsPage.getHolidayEntitlementSummary()).toContainText('16.8 days');
});
