export type EnvironmentName = 'local' | 'dev' | 'staging' | 'prod';

export interface Timeouts {
  /** Per-action cap: click, fill, and so on. */
  action: number;
  /** Per-navigation cap. */
  navigation: number;
  /** How long an expect() polls before failing. */
  expect: number;
}

/**
 * Behaviour that differs between environments, so tests can branch on
 * capability rather than on environment name.
 */
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
  timeouts: Timeouts;
  retries: number;
  features: FeatureFlags;
}
