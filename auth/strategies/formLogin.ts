import { expect, Page } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { EnvironmentConfig } from '../../config/types';
import { AuthStrategy, Credentials } from './types';

/** Username and password against the application's own login form. */
export const formLoginStrategy: AuthStrategy = {
  name: 'form',

  async authenticate(page: Page, credentials: Credentials, env: EnvironmentConfig) {
    const loginPage = new LoginPage(page);
    await loginPage.goto(env.authURL);
    await loginPage.login(credentials.username, credentials.password);

    // Bad credentials fail here, before any test depends on the session.
    await expect(page).toHaveURL(/inventory\.html/);
  },
};
