import { expect, Page } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { EnvironmentConfig } from '../../config/types';
import { AuthStrategy, Credentials } from './types';

/**
 * Username and password against the application's own login form.
 *
 * Verified end to end against saucedemo.com.
 */
export const formLoginStrategy: AuthStrategy = {
  name: 'form',

  async authenticate(page: Page, credentials: Credentials, env: EnvironmentConfig) {
    const loginPage = new LoginPage(page);
    await loginPage.goto(env.authURL);
    await loginPage.login(credentials.username, credentials.password);

    // Assert the session established here, so a credential problem fails in
    // setup with a clear message instead of as an assertion failure in every
    // test that depended on it.
    await expect(page).toHaveURL(/inventory\.html/);
  },
};
