import { faker, seedFaker } from './seed';

seedFaker();

/**
 * Generated input belongs in the negative tests only.
 *
 * The happy-path cases assert exact figures: five days a week gives 28 days.
 * Feeding those a random number of days would mean reimplementing the
 * entitlement calculation to know what to expect, and a test that reproduces
 * the code under test cannot catch that code being wrong. Those keep their
 * fixed rows in holidayEntitlementData.json.
 *
 * Rejection is different. Every value below is invalid for the same reason,
 * and the page answers all of them with one message, so no oracle is needed.
 */

const REJECTION_MESSAGE =
  'There are only 7 days in a week. Please check and enter a correct value.';

export interface InvalidInput {
  scenario: string;
  input: string;
  expectedError: string;
}

function invalid(scenario: string, input: string): InvalidInput {
  return { scenario, input, expectedError: REJECTION_MESSAGE };
}

/** Values the days-per-week field has to refuse, one from each family. */
export function invalidDaysPerWeek(): InvalidInput[] {
  return [
    invalid('negative', String(faker.number.int({ min: -20, max: -1 }))),
    invalid('above seven', faker.number.float({ min: 7.1, max: 99, fractionDigits: 1 }).toString()),
    invalid('alphabetic', faker.word.noun()),
    invalid('alphanumeric', `${faker.number.int({ min: 1, max: 6 })}${faker.string.alpha(3)}`),
    invalid('symbols', faker.helpers.arrayElement(['!!', '£$%', '--', '?'])),
    invalid('whitespace only', '   '),
  ];
}
