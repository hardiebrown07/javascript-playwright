import { EnvironmentConfig, EnvironmentName } from './types';
import { Role } from './roles';

/** Non-secret settings only. Credentials come from the environment; see `credentialsFor`. */
const environments: Record<EnvironmentName, EnvironmentConfig> = {
  local: {
    name: 'local',
    baseURL: 'http://localhost:3000',
    apiURL: 'http://localhost:3000/api',
    authURL: 'https://www.saucedemo.com',
    authStrategy: 'form',
    timeouts: { action: 10_000, navigation: 30_000, expect: 5_000 },
    retries: 0,
    features: { analytics: false, cookieBanner: true },
  },

  // dev, staging and prod share a base URL because GOV.UK is the only real
  // target available. On a client engagement each points at its own host.
  dev: {
    name: 'dev',
    baseURL: 'https://www.gov.uk',
    apiURL: 'https://www.gov.uk/api',
    authURL: 'https://www.saucedemo.com',
    authStrategy: 'form',
    timeouts: { action: 10_000, navigation: 30_000, expect: 5_000 },
    retries: 1,
    features: { analytics: false, cookieBanner: true },
  },

  staging: {
    name: 'staging',
    baseURL: 'https://www.gov.uk',
    apiURL: 'https://www.gov.uk/api',
    authURL: 'https://www.saucedemo.com',
    authStrategy: 'form',
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
    authStrategy: 'form',
    timeouts: { action: 15_000, navigation: 45_000, expect: 10_000 },
    retries: 2,
    features: { analytics: true, cookieBanner: true },
  },
};

const VALID: readonly EnvironmentName[] = ['local', 'dev', 'staging', 'prod'];

function isEnvironmentName(value: string): value is EnvironmentName {
  return (VALID as readonly string[]).includes(value);
}

export function currentEnvironmentName(): EnvironmentName {
  const raw = process.env.ENV ?? 'dev';
  if (!isEnvironmentName(raw)) {
    throw new Error(
      `Unknown environment "${raw}". Set ENV to one of: ${VALID.join(', ')}.`,
    );
  }
  return raw;
}

/** BASE_URL overrides the environment's baseURL, for review apps and previews. */
export function getEnvironment(): EnvironmentConfig {
  const config = environments[currentEnvironmentName()];
  return process.env.BASE_URL
    ? { ...config, baseURL: process.env.BASE_URL }
    : config;
}

/** Throws rather than returning undefined, so a missing secret fails at setup. */
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

/** Gitignored: these files hold live cookies that can impersonate the test account. */
export function storageStatePath(role: Role): string {
  return `playwright/.auth/${role}.json`;
}
