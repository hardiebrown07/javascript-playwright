# Playwright Test Automation Framework

A TypeScript Playwright framework covering UI journeys, API contracts, authentication,
accessibility, network conditions and visual regression.

The application under test is the [GOV.UK holiday entitlement calculator](https://www.gov.uk/calculate-your-holiday-entitlement),
a multi-step form with branching logic and server-side validation.

## Why I built this

I wanted to show how I would structure a Playwright framework for a production codebase, so the
focus is maintainability, fast feedback and coverage beyond the happy path rather than a large
number of UI tests.

A few things changed while building it, which is most of what I learned:

- My first third-party blocking test listened on `page.on('request')` and failed. That event fires
  before routing decides, so aborted requests still appear in it. Had I written the assertion the
  other way round it would have passed without the blocking working at all. It now listens on
  `requestfinished`.
- I dropped `--with-deps` from the CI browser install after four shards hit a corrupted apt index
  at once. That fixed Chromium and broke Firefox and WebKit, which need system libraries the bare
  runner lacks. Running the job in the official Playwright container removed both problems.
- One of four artifact downloads failed, so I called it flaky and re-ran it. It failed identically.
  The actions were pinned to v4 while GitHub was forcing them onto Node 24, which the warning in
  every log had been saying.
- I wrote a set of test data builders and then deleted them. Nothing in a stateless calculator
  constructs entities, so they would have shipped unused.

## Getting started

```sh
npm install
npm test
```

`npm install` pulls the browsers down as well, via a `postinstall` hook.

| Script                                  | Purpose                      |
| --------------------------------------- | ---------------------------- |
| `npm test`                              | Full suite, every project    |
| `npm run test:smoke`                    | Tagged subset, Chromium, ~3s |
| `npm run test:visual`                   | Visual regression only       |
| `npm run test:ui`                       | Interactive UI mode          |
| `npm run test:headed` / `test:debug`    | Visible browser / inspector  |
| `npm run report`                        | Open the last HTML report    |
| `npm run typecheck` / `lint` / `format` | Static checks                |

## Projects

Each concern runs as its own Playwright project, so a failure names the layer it came from.

| Project                           | Covers                                    | Browsers              |
| --------------------------------- | ----------------------------------------- | --------------------- |
| `setup`                           | Signs each role in, saves session state   | Chromium              |
| `api`                             | Contract tests, schema validation         | none unless requested |
| `chromium` / `firefox` / `webkit` | UI journeys                               | all three             |
| `authenticated`                   | Tests behind a login                      | Chromium              |
| `network`                         | Interception, offline and degraded states | Chromium              |
| `a11y`                            | WCAG 2.2 AA scans                         | Chromium              |
| `visual`                          | Screenshot comparison                     | Chromium              |

## Architecture

Page objects live in `pages/` with `private readonly` locators, so tests reach a page through its
methods rather than its selectors. Elements are found by accessible role rather than CSS or XPath.

Fixtures in `fixtures/` inject page objects lazily, so a test only builds what it destructures.
There are four `test` objects and which one a spec imports declares what kind of test it is:
`pages` navigates to the calculator automatically, `auth` arrives signed in, `api` launches no
browser, `network` installs routes before the first request.

The radio groups are union types, so `selectHolidayEntitlement('daily')` fails at compile time
rather than timing out against a locator that was never going to match.

## Environments

`local`, `dev`, `staging` and `prod` live in `config/environments.ts` with their own base URL,
timeouts, retries and feature flags.

```sh
ENV=staging npm test
```

They all point at GOV.UK, because it is the only real target available. On a client engagement each
would point at its own host. `BASE_URL` overrides the selection for review apps.

Credentials never live in config. `credentialsFor('admin')` reads `ADMIN_USERNAME` and
`ADMIN_PASSWORD` from the environment and throws a named error when either is missing, so a missing
secret fails at setup instead of surfacing as a login timeout. Copy `.env.example` to `.env`.

## Authentication

`tests/auth/auth.setup.ts` signs each role in once and saves cookies and localStorage to
`playwright/.auth/<role>.json`, which is gitignored. A session still in date is reused, so
authentication persists across runs rather than only across the tests within one.

`unauthenticated.test.ts` runs the same navigation with the session discarded and asserts the
application refuses it. Without that, a `storageState` doing nothing would look identical to one
working.

How a role signs in is configuration. `form` is verified against the demo application.
`entra-id` is written to Microsoft's documented flow but **has never run against a real tenant**,
and cannot work where the account has MFA enforced.

## API tests

`tests/api/` runs against the GOV.UK Content and Search APIs. No browser launches unless a spec
asks for `page`, so the set finishes in about a second.

`api/client.ts` validates responses against zod schemas and returns typed objects, so a contract
break names the offending field. `schemaValidation.test.ts` checks the schemas reject removed
fields, changed types, malformed values and bad nested array elements.

`crossLayer.test.ts` takes the expected title from the API rather than hardcoding it, so a content
edit does not fail the test.

## Accessibility

`tests/a11y/` scans five screens against WCAG 2.2 AA, the level UK public sector accessibility
regulations require. Form controls, error summaries and results are where defects live, so scanning
the landing page alone would miss them. `scannerWorks.a11y.test.ts` injects a known violation and
asserts it is caught.

## Network interception

`tests/network/` covers states the live site cannot produce on demand: third parties blocked,
analytics returning 503, and the journey with JavaScript or CSS gone. The GOV.UK Design System
requires services to work without client-side JavaScript, so those two check an obligation rather
than a hypothetical.

## Visual regression

Four screenshot comparisons with a 1% pixel tolerance for anti-aliasing.

Baselines are generated on Linux by the **Update visual baselines** workflow, because that is where
CI compares them. macOS font rendering differs enough that a locally generated baseline fails every
CI run. Run the workflow, download the artifact, commit the images.

## Test data

The calculator cases assert exact figures, so they keep fixed rows in
`testData/holidayEntitlementData.json`. Generating a random number of days worked would mean
reimplementing the entitlement calculation to know the expected answer, and a test that reproduces
the code under test agrees with that code's bugs.

Validation is different: every invalid value is rejected with the same message, so no oracle is
needed. `testData/generators.ts` covers six families of bad input with a fixed seed, recorded on the
run so a failure reproduces. `FAKER_SEED=777 npm test` sweeps further.

## Tags

```sh
npm run test:smoke   # ~3s, Chromium only
npm test             # everything, ~20s
```

Nothing carries a `@regression` tag. Untagged tests run by default, so tagging everything would be
upkeep with no benefit.

## Continuous integration

Runs on push, pull request, a 2am schedule and manual dispatch. A new push cancels the run in flight
for the same ref.

| Job      | Runs                                                                    |
| -------- | ----------------------------------------------------------------------- |
| `static` | Typecheck, lint, format. No browsers, so a type error fails in seconds. |
| `smoke`  | Tagged subset on Chromium. The pull request gate.                       |
| `full`   | Four shards, all browsers. Skipped on pull requests.                    |
| `report` | Merges the shard blobs into one HTML report.                            |

The full job runs inside `mcr.microsoft.com/playwright:v1.63.0-noble`, which carries all three
browsers and their system libraries. `report` runs on `!cancelled()` rather than `success()`, since
a failed run is when you want the report.

ESLint with `typescript-eslint` and `eslint-plugin-playwright`, Prettier, and a Husky pre-commit
hook. Three Playwright rules are errors because they are the usual causes of a flaky suite: no
fixed-duration waits, no force clicks, web-first assertions only.
