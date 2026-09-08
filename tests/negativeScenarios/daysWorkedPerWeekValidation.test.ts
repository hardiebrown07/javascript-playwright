import { expect, test } from '../../fixtures/pages.fixture';
import { invalidDaysPerWeek } from '../../testData/generators';
import { SEED } from '../../testData/seed';

const invalidInputs = invalidDaysPerWeek();

test('Form Validation for days worked per week value.', {
  tag: ['@smoke'],
}, async ({ workPatternPage }) => {
  // Recorded on the run so a failure can be reproduced with FAKER_SEED.
  test.info().annotations.push({ type: 'faker-seed', description: String(SEED) });

  await test.step('Navigate to the Days Worked per Week input', async () => {
    await workPatternPage.selectIrregularHours('no');
    await workPatternPage.selectHolidayEntitlement('days');
    await workPatternPage.selectWorkOutHolidayFor('full_year');
  });

  // Soft assertions so every invalid input is reported, not just the first.
  for (const { scenario, input, expectedError } of invalidInputs) {
    await test.step(`Rejects ${scenario}: "${input}"`, async () => {
      await workPatternPage.enterDaysWorked(input);
      await expect.soft(workPatternPage.getErrorElement()).toBeVisible();
      await expect.soft(workPatternPage.getErrorElement()).toContainText(expectedError);
    });
  }
});
