import { Locator, Page } from '@playwright/test';

export class ResultsPage {
  private readonly resultText: Locator;
  readonly startAgainLink: Locator;

  constructor(page: Page) {
    this.resultText = page.getByTestId('result-info');
    this.startAgainLink = page.getByRole('link', { name: 'Start again' });
  }

  getHolidayEntitlementSummary(): Locator {
    return this.resultText;
  }

  async clickStartAgain(): Promise<void> {
    await this.startAgainLink.click();
  }
}
