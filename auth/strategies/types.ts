import { Page } from '@playwright/test';
import { EnvironmentConfig } from '../../config/types';

export interface Credentials {
  username: string;
  password: string;
}

/**
 * How a role gets signed in.
 *
 * The setup project does not know or care whether that means filling a form,
 * following an SSO redirect chain, or exchanging credentials for a token over
 * HTTP. Swapping strategy is a config change, not a rewrite: this is the seam
 * that lets the same framework serve a client on a bare login form and a
 * client on Entra ID.
 */
export interface AuthStrategy {
  /** Identifier used in config and log output. */
  readonly name: string;

  /**
   * Leave `page` in a signed-in state. The caller saves the resulting
   * storage state; implementations should not write it themselves.
   */
  authenticate(page: Page, credentials: Credentials, env: EnvironmentConfig): Promise<void>;
}

export type AuthStrategyName = 'form' | 'entra-id';
