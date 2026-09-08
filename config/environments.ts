import { EnvironmentConfig, EnvironmentName } from './types';
import { Role } from './roles';

/**
 * Per-environment settings.
 *
 * Non-secret values live here so they are reviewable in version control and
 * diff cleanly. Secrets never do: they come from environment variables, and
 * in CI from the pipeline's secret store. See `credentialsFor()` below.
 */
const environments: Record<EnvironmentName, EnvironmentConfig> = {
  local: {
    name: 'local',
    baseURL: 'http://localhost:3000',
    apiURL: 'http://localhost:3000/api',
    authURL: 'https://www.saucedemo.com',
    timeouts: { action: 10_000, navigation: 30_000, expect: 5_000 },
    retries: 0,
    features: { analytics: false, cookieBanner: true },
  },

  dev: {
    name: 'dev',
    baseURL: 'https://www.gov.uk',
    apiURL: 'https://www.gov.uk/api',
    authURL: 'https://www.saucedemo.com',
    timeouts: { action: 10_000, navigation: 30_000, expect: 5_000 },
    retries: 1,
    features: { analytics: false, cookieBanner: true },
  },

  staging: {
    name: 'staging',
    baseURL: 'https://www.gov.uk',
    apiURL: 'https://www.gov.uk/api',
    authURL: 'https://www.saucedemo.com',
    // Shared environment, so allow more headroom for a slower host.
    timeouts: { action: 15_000, navigation: 45_000, expect: 10_000 },
    retries: 2,
    features: { analytics: true, cookieBanner: true },
  },

  prod: {
    name: 'prod',
    baseURL: 'https://www.gov.uk',
    apiURL: 'https://www.gov.uk/api',
    authURL: 'https://www.saucedemo.com',
    timeouts: { action: 15_000, navigation: 45_000, expect: 10_000 },
    retries: 2,
    features: { analytics: true, cookieBanner: true },
  },
};

const VALID: readonly EnvironmentName[] = ['local', 'dev', 'staging', 'prod'];

function isEnvironmentName(value: string): value is EnvironmentName {
  return (VALID as readonly string[]).includes(value);
}

/** Which environment this run targets. Defaults to `dev`. */
export function currentEnvironmentName(): EnvironmentName {
  const raw = process.env.ENV ?? 'dev';
  if (!isEnvironmentName(raw)) {
    throw new Error(
      `Unknown environment "${raw}". Set ENV to one of: ${VALID.join(', ')}.`,
    );
  }
  return raw;
}

/**
 * Resolved config for this run.
 *
 * BASE_URL still wins if set, so a one-off run against a review app or a
 * preview deployment does not need a new entry in this file.
 */
export function getEnvironment(): EnvironmentConfig {
  const config = environments[currentEnvironmentName()];
  return process.env.BASE_URL
    ? { ...config, baseURL: process.env.BASE_URL }
    : config;
}

/**
 * Credentials for a role, read from the environment rather than this file.
 *
 * Naming convention: `<ROLE>_USERNAME` / `<ROLE>_PASSWORD`, e.g.
 * `ADMIN_USERNAME`. Throws rather than returning undefined, so a missing
 * secret fails at setup with a clear message instead of as a login timeout.
 */
export function credentialsFor(role: string): { username: string; password: string } {
  const key = role.toUpperCase();
  const username = process.env[`${key}_USERNAME`];
  const password = process.env[`${key}_PASSWORD`];

  if (!username || !password) {
    throw new Error(
      `Missing credentials for role "${role}". ` +
        `Set ${key}_USERNAME and ${key}_PASSWORD in your .env file or CI secrets.`,
    );
  }
  return { username, password };
}

export { environments };

/**
 * Where a role's saved session lives. Gitignored: these files are live
 * credentials in cookie form.
 */
export function storageStatePath(role: Role): string {
  return `.auth/${role}.json`;
}
