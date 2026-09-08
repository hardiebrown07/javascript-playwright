import type { Page } from '@playwright/test';
import type { EnvironmentConfig } from '../../config/types';
import type { AuthStrategy, Credentials } from './types';

/**
 * Microsoft Entra ID interactive sign-in.
 *
 * NOT VERIFIED against a real tenant. Written to the documented flow and the
 * well-known element ids, but expect to adjust selectors: tenants customise
 * the sign-in page with their own branding.
 *
 * Cannot work where the account has MFA enforced. The options are a
 * Conditional Access exemption scoped to the CI egress IPs, a test tenant
 * without MFA, or a seeded TOTP secret.
 */
export const entraIdStrategy: AuthStrategy = {
  name: 'entra-id',

  async authenticate(page: Page, credentials: Credentials, env: EnvironmentConfig) {
    await page.goto(env.authURL);

    const email = page.locator('#i0116, input[type="email"][name="loginfmt"]').first();
    await email.waitFor({ state: 'visible' });
    await email.fill(credentials.username);
    await page.locator('#idSIButton9, input[type="submit"]').first().click();

    // Some tenants interpose a sign-in method chooser.
    const passwordOption = page.getByText('Use your password', { exact: false });
    if (await passwordOption.isVisible().catch(() => false)) {
      await passwordOption.click();
    }

    const password = page
      .locator('#i0118, input[type="password"][name="passwd"]')
      .first();
    await password.waitFor({ state: 'visible' });
    await password.fill(credentials.password);
    await page.locator('#idSIButton9, input[type="submit"]').first().click();

    const mfaChallenge = page.locator(
      '#idTxtBx_SAOTCC_OTC, #idDiv_SAOTCS_Proofs, [data-testid="mfa"]',
    );
    if (
      await mfaChallenge
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      throw new Error(
        'Entra ID is requesting MFA for this account, which automated sign-in ' +
          'cannot satisfy. See the notes in auth/strategies/entraId.ts.',
      );
    }

    // Decline "Stay signed in?": it issues a long-lived cookie we do not want in CI.
    const staySignedIn = page.locator('#idBtn_Back, #declineButton');
    if (
      await staySignedIn
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await staySignedIn.first().click();
    }

    await page.waitForURL((url) => url.origin === new URL(env.authURL).origin, {
      timeout: env.timeouts.navigation,
    });
  },
};
