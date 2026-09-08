import { Locator, Page } from '@playwright/test';
import { EntitlementBasis, HolidayPeriod, IrregularHours } from '../testData/types';

export class WorkPatternPage {
  private readonly irregularHoursOptions: Record<IrregularHours, Locator>;
  private readonly holidayEntitlementOptions: Record<EntitlementBasis, Locator>;
  private readonly workOutHolidayForOptions: Record<HolidayPeriod, Locator>;

  private readonly daysInput: Locator;
  private readonly hoursInput: Locator;
  private readonly shiftHours: Locator;
  private readonly noOfShifts: Locator;
  private readonly shiftDays: Locator;
  private readonly errorMessage: Locator;
  private readonly continueButton: Locator;

  constructor(page: Page) {
    this.irregularHoursOptions = {
      yes: page.getByRole('radio', { name: 'Yes' }),
      no: page.getByRole('radio', { name: 'No' }),
    };

    this.holidayEntitlementOptions = {
      days: page.getByRole('radio', { name: 'days worked per week' }),
      hours: page.getByRole('radio', { name: 'hours worked per week' }),
      annualised: page.getByRole('radio', { name: 'annualised hours' }),
      compressed: page.getByRole('radio', { name: 'compressed hours' }),
      shifts: page.getByRole('radio', { name: 'shifts' }),
    };

    this.workOutHolidayForOptions = {
      full_year: page.getByRole('radio', { name: 'for a full leave year' }),
      starting: page.getByRole('radio', {
        name: 'for someone starting part way through a leave year',
      }),
      leaving: page.getByRole('radio', {
        name: 'for someone leaving part way through a leave year',
      }),
      starting_and_leaving: page.getByRole('radio', {
        name: 'for someone starting and leaving part way through a leave year',
      }),
    };

    this.daysInput = page.getByRole('textbox', { name: 'Days worked' });
    this.hoursInput = page.getByRole('textbox', { name: 'Hours worked' });
    this.shiftHours = page.getByRole('textbox', {
      name: 'How many hours in each shift',
    });
    this.noOfShifts = page.getByRole('textbox', {
      name: 'How many shifts will be worked per shift pattern',
    });
    this.shiftDays = page.getByRole('textbox', {
      name: 'How many days in the shift pattern',
    });

    this.errorMessage = page.getByTestId('error-summary');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
  }

  /**
   * Resolves an option against its lookup map. The union types make an unknown
   * key a compile error; the runtime guard covers values arriving from JSON,
   * where the compiler cannot help.
   */
  private resolve<K extends string>(
    options: Record<K, Locator>,
    option: K,
    allowed: readonly K[],
  ): Locator {
    const selected = options[option.toLowerCase() as K];
    if (!selected) {
      throw new Error(
        `Invalid option "${option}". Choose from: ${allowed.join(', ')}.`,
      );
    }
    return selected;
  }

  async selectIrregularHours(option: IrregularHours): Promise<void> {
    await this.resolve(this.irregularHoursOptions, option, ['yes', 'no']).click();
    await this.continueButton.click();
  }

  async selectHolidayEntitlement(option: EntitlementBasis): Promise<void> {
    await this.resolve(this.holidayEntitlementOptions, option, [
      'days',
      'hours',
      'annualised',
      'compressed',
      'shifts',
    ]).click();
    await this.continueButton.click();
  }

  async selectWorkOutHolidayFor(option: HolidayPeriod): Promise<void> {
    await this.resolve(this.workOutHolidayForOptions, option, [
      'full_year',
      'starting',
      'leaving',
      'starting_and_leaving',
    ]).click();
    await this.continueButton.click();
  }

  async enterDaysWorked(days: string): Promise<void> {
    await this.daysInput.fill(days);
    await this.continueButton.click();
  }

  async enterHoursWorked(hours: string): Promise<void> {
    await this.hoursInput.fill(hours);
    await this.continueButton.click();
  }

  async enterShiftHours(hours: string): Promise<void> {
    await this.shiftHours.fill(hours);
    await this.continueButton.click();
  }

  async enterNoOfShifts(shifts: string): Promise<void> {
    await this.noOfShifts.fill(shifts);
    await this.continueButton.click();
  }

  async enterShiftDays(days: string): Promise<void> {
    await this.shiftDays.fill(days);
    await this.continueButton.click();
  }

  getErrorElement(): Locator {
    return this.errorMessage;
  }
}
