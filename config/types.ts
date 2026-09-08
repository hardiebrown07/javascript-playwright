import type { AuthStrategyName } from '../auth/strategies/types';

export type EnvironmentName = 'local' | 'dev' | 'staging' | 'prod';

export interface Timeouts {
  /** Per-action cap: click, fill, and so on. */
  action: number;
  /** Per-navigation cap. */
  navigation: number;
  /** How long an expect() polls before failing. */
  expect: number;
}

/** Behaviour that varies by environment. Tests read these flags to decide what to expect. */
export interface FeatureFlags {
  analytics: boolean;
  cookieBanner: boolean;
}

export interface EnvironmentConfig {
  name: EnvironmentName;
  baseURL: string;
  apiURL: string;
  /** Login page for the authenticated application. */
  authURL: string;
  /** How to sign in: a plain form, or an SSO provider. */
  authStrategy: AuthStrategyName;
  timeouts: Timeouts;
  retries: number;
  features: FeatureFlags;
}
