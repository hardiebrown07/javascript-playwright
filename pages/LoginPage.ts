import type { Locator, Page } from '@playwright/test';

/**
 * Login screen for the authenticated demo application.
 *
 * Swapping this class and the `authURL` in `config/environments.ts` is what
 * points the auth machinery at a client's own application. Nothing else in
 * `auth.setup.ts` or the fixtures needs to change.
 */
export class LoginPage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async goto(authURL: string): Promise<void> {
    await this.page.goto(authURL);
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
