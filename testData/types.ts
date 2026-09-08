/** A date as the GOV.UK form takes it: three separate text inputs. */
export interface DateParts {
  day: string;
  month: string;
  year: string;
}

/** Does the employee work irregular hours? */
export type IrregularHours = 'yes' | 'no';

/** What the entitlement is calculated from. */
export type EntitlementBasis =
  | 'days'
  | 'hours'
  | 'annualised'
  | 'compressed'
  | 'shifts';

/** Which slice of the leave year the calculation covers. */
export type HolidayPeriod =
  | 'full_year'
  | 'starting'
  | 'leaving'
  | 'starting_and_leaving';
