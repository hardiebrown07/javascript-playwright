# Playwright Test Automation Framework

A TypeScript test automation framework built with [Playwright](https://playwright.dev), covering UI
journeys, API contracts, authentication, accessibility, network conditions and visual regression.

The application under test is the [GOV.UK holiday entitlement calculator](https://www.gov.uk/calculate-your-holiday-entitlement),
a real multi-step form with branching logic and server-side validation.

## Getting started

```sh
npm install
npm test
```

`npm install` pulls the browsers down as well, via a `postinstall` hook.

| Script                            | Purpose                      |
| --------------------------------- | ---------------------------- |
| `npm test`                        | Full suite, every project    |
| `npm run test:smoke`              | Tagged subset, Chromium, ~3s |
| `npm run test:regression`         | Everything, all browsers     |
| `npm run test:visual`             | Visual regression only       |
| `npm run test:ui`                 | Interactive UI mode          |
| `npm run test:headed`             | Visible browser              |
| `npm run test:debug`              | Playwright inspector         |
| `npm run report`                  | Open the last HTML report    |
| `npm run typecheck`               | `tsc --noEmit`               |
| `npm run lint` / `lint:fix`       | ESLint                       |
| `npm run format` / `format:check` | Prettier                     |

Docker:

```sh
docker compose up --build
```

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

**Page objects** in `pages/`. Locators are `private readonly`, so tests reach a page through its
methods rather than its selectors. Elements are found by accessible role rather than CSS or XPath,
which survives markup changes and surfaces genuine accessibility problems when it does not.

**Fixtures** in `fixtures/`. Page objects are injected rather than constructed per test, and built
lazily so a test only pays for what it destructures. There are four `test` objects, and which one a
spec imports declares what kind of test it is: `pages` navigates to the calculator automatically,
`auth` arrives signed in, `api` launches no browser, `network` installs routes before the first
request.

**Typed options.** The radio groups are union types, so `selectHolidayEntitlement('daily')` fails at
compile time instead of timing out against a locator that was never going to match.

## Environments

`local`, `dev`, `staging` and `prod` are defined in `config/environments.ts`, each with its own base
URL, timeouts, retry count and feature flags.

```sh
npm run test:staging
ENV=prod npx playwright test --project=chromium
```

`BASE_URL` overrides the selected environment, for review apps and preview deployments. An unknown
`ENV` fails at config load naming the valid options, rather than as a timeout against an undefined
base URL.

Credentials never live in config. `credentialsFor('admin')` reads `ADMIN_USERNAME` and
`ADMIN_PASSWORD` from the environment and throws a named error when either is missing. Copy
`.env.example` to `.env` for local runs; `.env` is gitignored.

## Authentication

`tests/auth/auth.setup.ts` signs each role in `config/roles.ts` in once and saves cookies and
localStorage to `playwright/.auth/<role>.json`. Authenticated specs start signed in, so no test
exercises a login form unless that is the thing it tests.

A session still in date is reused rather than recreated, so authentication persists across runs and
not only across the tests within one run. `playwright/.auth/` is gitignored: those files are live
cookies that would let anyone holding them impersonate the test account.

`unauthenticated.test.ts` is the control. It runs the same navigation with the session discarded and
asserts the application refuses it, so the passing tests are evidence rather than assertion.

### Strategies

How a role signs in is configuration. `authStrategy` in `config/environments.ts` selects between:

| Strategy   | Status                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------- |
| `form`     | Username and password against the application's own login form. Verified.                   |
| `entra-id` | Microsoft Entra ID interactive sign-in. **Written but not verified against a real tenant.** |

Entra ID cannot sign in automatically where the account has MFA enforced; the strategy detects the
challenge and fails with the available remedies. Adding a strategy means implementing `AuthStrategy`
and registering it in `auth/strategies/index.ts`.

## API tests

`tests/api/` runs against the GOV.UK Content and Search APIs. No browser launches unless a spec asks
for `page`, so the set completes in about a second and gates the slower UI projects.

`api/client.ts` validates every response against a zod schema and returns a typed object, so a
contract break fails at the boundary naming the offending field. `schemaValidation.test.ts` asserts
that removed fields, changed types, malformed values and bad nested array elements are each
rejected, so the schemas cannot degrade into accepting anything.

`crossLayer.test.ts` fetches the expected content from the API and asserts the rendered page matches,
rather than hardcoding the title. It fails only when the two layers genuinely disagree.

## Accessibility

`tests/a11y/` scans five screens against WCAG 2.2 AA, the level the UK public sector accessibility
regulations require. Form controls, error summaries and results are where defects live, so scanning
the landing page alone would miss them.

Failures carry the offending selectors and rule descriptions, and the full axe output attaches to the
run. `scannerWorks.a11y.test.ts` injects a known violation and asserts it is caught.

## Network interception

`tests/network/` covers states the live site cannot produce on demand: third parties blocked,
analytics returning 503, and the journey with JavaScript or CSS gone. The GOV.UK Design System
requires services to work without client-side JavaScript, so those assert an obligation rather than a
hypothetical.

`contactedHosts` records `requestfinished` rather than `request`. The request event fires before
routing decides, so an aborted request appears there and a blocking assertion would pass whether or
not the block worked.

## Visual regression

`tests/visual/` compares full-page and component screenshots against committed baselines, with a 1%
pixel tolerance for anti-aliasing.

Baselines are platform-specific and are generated on Linux by the **Update visual baselines**
workflow, because that is where CI compares them. Font rendering differs enough between macOS and
Linux that a locally generated baseline fails every CI run for reasons nobody can action. Run that
workflow, download the artifact, commit the images.

## Test data

The calculator cases assert exact figures, so they stay on fixed rows in
`testData/holidayEntitlementData.json`. Generating a random number of days worked would mean
reimplementing the entitlement calculation to know what to expect, and a test that reproduces the
code under test cannot catch that code being wrong.

Validation is where generated input works: every invalid value is rejected with the same message, so
no oracle is needed. `testData/generators.ts` covers six families of bad input. The seed is fixed so
a failure reproduces, and recorded on the run as an annotation. `FAKER_SEED=777 npm test` sweeps for
cases the default seed never reaches.

## Tags

`@smoke` marks the shortest set that gives confidence the application is up.

```sh
npm run test:smoke        # ~3s, Chromium only
npm run test:regression   # everything, ~20s
```

Nothing carries a `@regression` tag: untagged tests run by default, so tagging everything would be
upkeep with no benefit. `--grep-invert @smoke` selects the complement.

## Continuous integration

`.github/workflows/playwright.yml` runs on push, pull request, a 2am schedule and manual dispatch.
A new push cancels the run in flight for the same ref.

| Job      | Runs                                                                    |
| -------- | ----------------------------------------------------------------------- |
| `static` | Typecheck, lint, format. No browsers, so a type error fails in seconds. |
| `smoke`  | Tagged subset on Chromium. The pull request gate.                       |
| `full`   | Four shards, all browsers. Skipped on pull requests.                    |
| `report` | Merges the shard blobs into one HTML report.                            |

The full job runs inside `mcr.microsoft.com/playwright:v1.63.0-noble`, which carries all three
browsers and their system libraries. Installing browsers on a bare runner needs `--with-deps`, whose
apt step fails intermittently when four shards hit it at once, and without it Firefox and WebKit
cannot launch.

`report` runs on `!cancelled()` rather than `success()`, because a red run is when the report matters
most.

## Code quality

ESLint with `typescript-eslint` and `eslint-plugin-playwright`, Prettier, and a Husky pre-commit hook
running `lint-staged`. Three Playwright rules are raised to errors because they are the usual causes
of a flaky suite: no fixed-duration waits, no force clicks, and web-first assertions only.
