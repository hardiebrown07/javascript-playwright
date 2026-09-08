import { expect, test } from '@playwright/test';
import testData from '../../testData/holidayEntitlementData.json';
import { HolidayCalculatorPage } from '../../pages/HolidayCalculatorPage';
import { WorkPatternPage } from '../../pages/WorkPatternPage';

test('Form Validation for days worked per week value.', async ({ page }) => {
  const holidayCalculator = new HolidayCalculatorPage(page);
  const workPatternPage = new WorkPatternPage(page);

  await test.step('Open the Holiday Entitlement Calculator', async () => {
    await holidayCalculator.navigate();
  });
  await test.step('Accept Cookies if they are visible', async () => {
    await holidayCalculator.acceptCookies();
  });
  await test.step('Select start now button', async () => {
    await holidayCalculator.selectStartNow();
  });
  await test.step('Navigate to Days Worked per Week input', async () => {
    await workPatternPage.selectIrregularHours('no');
    await workPatternPage.selectHolidayEntitlement('days');
    await workPatternPage.selectWorkOutHolidayFor('full_year');
  });

  // Soft assertions so every invalid input is reported, not just the first.
  for (const { scenario, input, expectedError } of testData.daysWorkedPerWeekValidation) {
    await test.step(`Validate ${scenario}`, async () => {
      await workPatternPage.enterDaysWorked(input);
      await expect.soft(workPatternPage.getErrorElement()).toBeVisible();
      await expect.soft(workPatternPage.getErrorElement()).toContainText(expectedError);
    });
  }
});
