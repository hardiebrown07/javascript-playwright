import { faker } from '@faker-js/faker';

/**
 * Seed for generated values.
 *
 * Fixed by default so a failure reproduces on a rerun. Vary it with
 * FAKER_SEED to sweep for cases the fixed seed never reaches, and read the
 * seed off the console when one of those runs goes red.
 */
export const SEED = Number(process.env.FAKER_SEED) || 20260908;

export function seedFaker(): void {
  faker.seed(SEED);
}

export { faker };
