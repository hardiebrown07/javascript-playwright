import { Page } from '@playwright/test';
import { EnvironmentConfig } from '../../config/types';
import { AuthStrategy, Credentials } from './types';

/**
 * Microsoft Entra ID (formerly Azure AD) interactive sign-in.
 *
 * ── STATUS ──────────────────────────────────────────────────────────────
 * NOT VERIFIED END TO END. Written against the documented Entra sign-in
 * flow and its well-known element ids, but never executed against a real
 * tenant, because this repository has none. Treat the selectors as a
 * starting point and expect to adjust them: Microsoft changes that page,
 * and tenants customise it with company branding, which moves things.
 * ────────────────────────────────────────────────────────────────────────
 *
 * The flow is a redirect chain away from your own domain and back:
 *
 *   app  →  login.microsoftonline.com  →  (email)  →  (password)
 *        →  [optional MFA]  →  [optional "Stay signed in?"]  →  app
 *
 * Each step is a separate page load, which is why this waits on elements
 * rather than assuming a single form.
 *
 * ## MFA is the real obstacle
 *
 * If the test account has multi-factor authentication enforced, this cannot
 * work, and no amount of selector tuning fixes it: that is the entire point
 * of MFA. The options, in descending order of preference:
 *
 *   1. A Conditional Access policy exempting the test account when it comes
 *      from the CI egress IP range. This is the standard arrangement and the
 *      one to ask a client's identity team for.
 *   2. A dedicated test tenant without MFA.
 *   3. TOTP seeded into CI and generated at runtime. Workable, but it means
 *      holding a live second factor in the pipeline, which some security
 *      teams will refuse.
 *
 * Ask about this before promising an estimate. It is usually a
 * conversation with an identity team rather than an engineering task, and
 * it is the single most common reason SSO test automation stalls.
 */
export const entraIdStrategy: AuthStrategy = {
  name: 'entra-id',

  async authenticate(page: Page, credentials: Credentials, env: EnvironmentConfig) {
    // Hitting the app triggers the redirect to Microsoft.
    await page.goto(env.authURL);

    // Email. #i0116 is Microsoft's long-standing id for this field; the type
    // selector is the fallback for branded or newer variants.
    const email = page.locator('#i0116, input[type="email"][name="loginfmt"]').first();
    await email.waitFor({ state: 'visible' });
    await email.fill(credentials.username);
    await page.locator('#idSIButton9, input[type="submit"]').first().click();

    // Some tenants interpose a "how would you like to sign in" screen.
    const passwordOption = page.getByText('Use your password', { exact: false });
    if (await passwordOption.isVisible().catch(() => false)) {
      await passwordOption.click();
    }

    const password = page.locator('#i0118, input[type="password"][name="passwd"]').first();
    await password.waitFor({ state: 'visible' });
    await password.fill(credentials.password);
    await page.locator('#idSIButton9, input[type="submit"]').first().click();

    // If MFA is enforced we land on a challenge here and cannot proceed.
    // Fail with an explanation rather than a selector timeout, because the
    // fix is a policy change and the error should say so.
    const mfaChallenge = page.locator(
      '#idTxtBx_SAOTCC_OTC, #idDiv_SAOTCS_Proofs, [data-testid="mfa"]',
    );
    if (await mfaChallenge.first().isVisible().catch(() => false)) {
      throw new Error(
        'Entra ID is requesting multi-factor authentication for this account. ' +
          'Automated sign-in cannot satisfy it. Exempt the test account via a ' +
          'Conditional Access policy scoped to the CI egress IPs, use a test ' +
          'tenant without MFA, or supply a TOTP secret. See the notes in ' +
          'auth/strategies/entraId.ts.',
      );
    }

    // "Stay signed in?" — decline. Accepting issues a longer-lived persistent
    // cookie, which is convenient and exactly the kind of credential you do
    // not want sitting in CI for weeks.
    const staySignedIn = page.locator('#idBtn_Back, #declineButton');
    if (await staySignedIn.first().isVisible().catch(() => false)) {
      await staySignedIn.first().click();
    }

    // Back on the application's own origin, which is the signal the redirect
    // chain completed rather than stalling on a consent or error screen.
    await page.waitForURL((url) => url.origin === new URL(env.authURL).origin, {
      timeout: env.timeouts.navigation,
    });
  },
};
