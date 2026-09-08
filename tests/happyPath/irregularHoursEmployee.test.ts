import { expect, test } from '@playwright/test';
import testData from '../../testData/holidayEntitlementData.json';
import { HolidayCalculatorPage } from '../../pages/HolidayCalculatorPage';
import { LeaveDatePage } from '../../pages/LeaveDatePage';
import { ResultsPage } from '../../pages/ResultsPage';
import { WorkPatternPage } from '../../pages/WorkPatternPage';

const data = testData.irregularHoursEmployee;

test(`Calculate Holiday for irregular hours employee with ${data.shiftHours} hour shifts.`, async ({
  page,
}) => {
  const holidayCalculator = new HolidayCalculatorPage(page);
  const resultsPage = new ResultsPage(page);
  const workPatternPage = new WorkPatternPage(page);
  const leaveDatePage = new LeaveDatePage(page);

  const expectedLeaveYearDate = leaveDatePage.formatDate(
    data.employmentLeaveYearStartDate,
  );

  await test.step('Open the Holiday Entitlement Calculator', async () => {
    await holidayCalculator.navigate();
  });
  await test.step('Accept Cookies if they are visible', async () => {
    await holidayCalculator.acceptCookies();
  });
  await test.step('Select start now button', async () => {
    await holidayCalculator.selectStartNow();
  });
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
