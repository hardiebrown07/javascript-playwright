import type { Locator, Page } from '@playwright/test';

export class HolidayCalculatorPage {
  private readonly acceptCookiesButton: Locator;
  private readonly startNowButton: Locator;

  constructor(private readonly page: Page) {
    this.acceptCookiesButton = page.getByRole('button', {
      name: 'Accept additional cookies',
    });
    this.startNowButton = page.getByRole('button', { name: 'Start now' });
  }

  /** Relative path; the host comes from `baseURL` in the Playwright config. */
  async navigate(): Promise<void> {
    await this.page.goto('/calculate-your-holiday-entitlement');
  }

  /** The banner only appears on a fresh session, so this is a no-op otherwise. */
  async acceptCookies(): Promise<void> {
    if (await this.acceptCookiesButton.isVisible()) {
      await this.acceptCookiesButton.click();
    }
  }

  async selectStartNow(): Promise<void> {
    await this.startNowButton.click();
  }
}
