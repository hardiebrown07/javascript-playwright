import { expect, test } from '@playwright/test';
import testData from '../../testData/holidayEntitlementData.json';
import { HolidayCalculatorPage } from '../../pages/HolidayCalculatorPage';
import { LeaveDatePage } from '../../pages/LeaveDatePage';
import { ResultsPage } from '../../pages/ResultsPage';
import { WorkPatternPage } from '../../pages/WorkPatternPage';

const data = testData.leaveMidYearEmployee;

test('Calculate Holiday for employee leaving mid year with compressed hours', async ({
  page,
}) => {
  const holidayCalculator = new HolidayCalculatorPage(page);
  const resultsPage = new ResultsPage(page);
  const leaveDatePage = new LeaveDatePage(page);
  const workPatternPage = new WorkPatternPage(page);

  const expectedEndDate = leaveDatePage.formatDate(data.employmentEndDate);
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
    await workPatternPage.selectIrregularHours('no');
    await workPatternPage.selectHolidayEntitlement('compressed');
    await workPatternPage.selectWorkOutHolidayFor('leaving');
    await leaveDatePage.enterEmploymentEndDate(data.employmentEndDate);
    await leaveDatePage.enterLeaveYearStartDate(data.employmentLeaveYearStartDate);
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
    await expect(summary).toContainText('compressed hours');
    await expect(summary).toContainText(
      'for someone leaving part way through a leave year',
    );
    await expect(summary).toContainText(expectedEndDate);
    await expect(summary).toContainText(expectedLeaveYearDate);
    await expect(summary).toContainText(data.hoursWorked);
    await expect(summary).toContainText(data.daysWorked);
  });
  await test.step('Start again link is visible.', async () => {
    await expect(resultsPage.startAgainLink).toBeVisible();
  });
  await test.step('Verify URL.', async () => {
    await expect(page).toHaveURL(/compressed-hours/);
  });
});
