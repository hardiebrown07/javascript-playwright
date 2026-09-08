import { Locator, Page } from '@playwright/test';
import { format, parse } from 'date-fns';
import { DateParts } from '../testData/types';

/**
 * The three date screens (employment start, employment end, leave year start)
 * present the same Day/Month/Year inputs, so one set of locators serves all
 * three. The distinct method names document which screen the caller is on.
 */
export class LeaveDatePage {
  private readonly dayInput: Locator;
  private readonly monthInput: Locator;
  private readonly yearInput: Locator;
  private readonly continueButton: Locator;

  constructor(page: Page) {
    this.dayInput = page.getByRole('textbox', { name: 'Day' });
    this.monthInput = page.getByRole('textbox', { name: 'Month' });
    this.yearInput = page.getByRole('textbox', { name: 'Year' });
    this.continueButton = page.getByRole('button', { name: 'Continue' });
  }

  private async fillDate({ day, month, year }: DateParts): Promise<void> {
    await this.dayInput.fill(day);
    await this.monthInput.fill(month);
    await this.yearInput.fill(year);
    await this.continueButton.click();
  }

  async enterEmploymentStartDate(date: DateParts): Promise<void> {
    await this.fillDate(date);
  }

  async enterEmploymentEndDate(date: DateParts): Promise<void> {
    await this.fillDate(date);
  }

  async enterLeaveYearStartDate(date: DateParts): Promise<void> {
    await this.fillDate(date);
  }

  /** Renders a date the way the results summary displays it, e.g. "1 May 2024". */
  formatDate(
    { day, month, year }: DateParts,
    dateFormat = 'd MMMM yyyy',
  ): string {
    return format(
      parse(`${year}-${month}-${day}`, 'yyyy-MM-dd', new Date()),
      dateFormat,
    );
  }

  async getFormattedEntitlementDate(date: DateParts): Promise<string> {
    return this.formatDate(date);
  }
}
