import type { Page } from '@playwright/test';
import type { EnvironmentConfig } from '../../config/types';

export interface Credentials {
  username: string;
  password: string;
}

export interface AuthStrategy {
  readonly name: string;
  /** Leaves `page` signed in. The caller saves the storage state. */
  authenticate(
    page: Page,
    credentials: Credentials,
    env: EnvironmentConfig,
  ): Promise<void>;
}

export type AuthStrategyName = 'form' | 'entra-id';
