import { expect, test } from '../../fixtures/pages.fixture';
import testData from '../../testData/holidayEntitlementData.json';

const data = testData.irregularHoursEmployee;

test(`Calculate Holiday for irregular hours employee with ${data.shiftHours} hour shifts.`, async ({
  workPatternPage,
  leaveDatePage,
  resultsPage,
  page,
}) => {
  const expectedLeaveYearDate = leaveDatePage.formatDate(
    data.employmentLeaveYearStartDate,
  );

  await test.step('Complete the form', async () => {
    await workPatternPage.selectIrregularHours('yes');
    await leaveDatePage.enterEmploymentStartDate(data.employmentLeaveYearStartDate);
    await workPatternPage.selectHolidayEntitlement('shifts');
    await workPatternPage.selectWorkOutHolidayFor('full_year');
    await workPatternPage.enterShiftHours(data.shiftHours);
    await workPatternPage.enterNoOfShifts(data.noOfShifts);
    await workPatternPage.enterShiftDays(data.shiftDays);
  });
  await test.step(`Verify the holiday entitlement is ${data.expectedEntitlement}`, async () => {
    await expect(resultsPage.getHolidayEntitlementSummary()).toContainText(
      data.expectedEntitlement,
    );
  });
  await test.step('Verify form has the correct inputs', async () => {
    const summary = resultsPage.getHolidayEntitlementSummary();
    await expect(summary).toContainText('Yes');
    await expect(summary).toContainText('shifts');
    await expect(summary).toContainText('for a full leave year');
    await expect(summary).toContainText(expectedLeaveYearDate);
    await expect(summary).toContainText(data.shiftHours);
    await expect(summary).toContainText(data.noOfShifts);
    await expect(summary).toContainText(data.shiftDays);
  });
  await test.step('Start again link is visible.', async () => {
    await expect(resultsPage.startAgainLink).toBeVisible();
  });
  await test.step('Verify URL.', async () => {
    await expect(page).toHaveURL(/shift-worker/);
  });
});
