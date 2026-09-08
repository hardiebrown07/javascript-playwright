import { entraIdStrategy } from './entraId';
import { formLoginStrategy } from './formLogin';
import { AuthStrategy, AuthStrategyName } from './types';

const strategies: Record<AuthStrategyName, AuthStrategy> = {
  form: formLoginStrategy,
  'entra-id': entraIdStrategy,
};

/**
 * Resolves the strategy named by the environment.
 *
 * Selecting how to authenticate is configuration, not code: pointing the
 * framework at an Entra-protected client application is a change to
 * `config/environments.ts` plus credentials, not to any test.
 */
export function getAuthStrategy(name: AuthStrategyName): AuthStrategy {
  const strategy = strategies[name];
  if (!strategy) {
    throw new Error(
      `Unknown auth strategy "${name}". Available: ${Object.keys(strategies).join(', ')}.`,
    );
  }
  return strategy;
}

export type { AuthStrategy, AuthStrategyName, Credentials } from './types';
