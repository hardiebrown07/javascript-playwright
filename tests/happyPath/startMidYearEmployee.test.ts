import { expect, test } from '../../fixtures/pages.fixture';
import testData from '../../testData/holidayEntitlementData.json';

const data = testData.startMidYearEmployee;

test('Calculate Holiday for employee starting mid year with annualised hours.', async ({
  workPatternPage,
  leaveDatePage,
  resultsPage,
  page,
}) => {
  const expectedStartDate = leaveDatePage.formatDate(data.employmentStartDate);
  const expectedLeaveYearStartDate = leaveDatePage.formatDate(
    data.employmentLeaveYearStartDate,
  );

  await test.step('Complete the form', async () => {
    await workPatternPage.selectIrregularHours('no');
    await workPatternPage.selectHolidayEntitlement('annualised');
    await workPatternPage.selectWorkOutHolidayFor('starting');
    await leaveDatePage.enterEmploymentStartDate(data.employmentStartDate);
    await leaveDatePage.enterLeaveYearStartDate(data.employmentLeaveYearStartDate);
  });

  await test.step(`Verify the holiday entitlement is ${data.expectedEntitlement}`, async () => {
    await expect(resultsPage.getHolidayEntitlementSummary()).toContainText(
      data.expectedEntitlement,
    );
  });

  await test.step('Verify form has the correct inputs', async () => {
    const summary = resultsPage.getHolidayEntitlementSummary();
    await expect(summary).toContainText('No');
    await expect(summary).toContainText('annualised hours');
    await expect(summary).toContainText(
      'for someone starting part way through a leave year',
    );
    await expect(summary).toContainText(expectedStartDate);
    await expect(summary).toContainText(expectedLeaveYearStartDate);
  });

  await test.step('Start again link is visible.', async () => {
    await expect(resultsPage.startAgainLink).toBeVisible();
  });

  await test.step('Verify URL.', async () => {
    await expect(page).toHaveURL(/annualised-hours/);
  });
});
