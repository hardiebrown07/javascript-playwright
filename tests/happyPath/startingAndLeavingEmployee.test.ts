import { expect, test } from '../../fixtures/pages.fixture';
import testData from '../../testData/holidayEntitlementData.json';

const data = testData.startingAndLeavingEmployee;

test(`Calculate Holiday for employee starting and leaving with ${data.hoursWorked} hours worked per week.`, async ({
  workPatternPage,
  leaveDatePage,
  resultsPage,
  page,
}) => {
  const expectedStartDate = leaveDatePage.formatDate(data.employmentStartDate);
  const expectedEndDate = leaveDatePage.formatDate(data.employmentEndDate);

  await test.step('Complete the form', async () => {
    await workPatternPage.selectIrregularHours('no');
    await workPatternPage.selectHolidayEntitlement('hours');
    await workPatternPage.selectWorkOutHolidayFor('starting_and_leaving');
    await leaveDatePage.enterEmploymentStartDate(data.employmentStartDate);
    await leaveDatePage.enterLeaveYearStartDate(data.employmentEndDate);
    await workPatternPage.enterHoursWorked(data.hoursWorked);
    await workPatternPage.enterDaysWorked(data.daysWorked);
  });
  await test.step(`Verify the holiday entitlement is ${data.expectedEntitlement}`, async () => {
    await expect(resultsPage.getHolidayEntitlementSummary()).toContainText(
      data.expectedEntitlement,
    );
  });
  await test.step('Verify form has the correct inputs', async () => {
    const summary = resultsPage.getHolidayEntitlementSummary();
    await expect(summary).toContainText('No');
    await expect(summary).toContainText('hours worked per week');
    await expect(summary).toContainText(
      'for someone starting and leaving part way through a leave year',
    );
    await expect(summary).toContainText(expectedStartDate);
    await expect(summary).toContainText(expectedEndDate);
    await expect(summary).toContainText(data.hoursWorked);
    await expect(summary).toContainText(data.daysWorked);
  });
  await test.step('Start again link is visible.', async () => {
    await expect(resultsPage.startAgainLink).toBeVisible();
  });
  await test.step('Verify URL.', async () => {
    await expect(page).toHaveURL(/hours-worked-per-week/);
  });
});
