import { expect, test } from '../../fixtures/pages.fixture';
import testData from '../../testData/holidayEntitlementData.json';

test('Form Validation for days worked per week value.', async ({
  workPatternPage,
}) => {
  await test.step('Navigate to the Days Worked per Week input', async () => {
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
