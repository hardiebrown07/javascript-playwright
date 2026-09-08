# Playwright Test Automation Framework

A TypeScript test automation framework built with [Playwright](https://playwright.dev).

## Getting started

```sh
npm install
npm test
```

`npm install` pulls the browsers down as well, via a `postinstall` hook.

| Script | Purpose |
| --- | --- |
| `npm test` | Run the full suite |
| `npm run test:ui` | Interactive UI mode |
| `npm run test:happy` | Happy path scenarios |
| `npm run test:negative` | Validation scenarios |
| `npm run test:headed` | Run with a visible browser |
| `npm run test:debug` | Playwright inspector |
| `npm run report` | Open the last HTML report |
| `npm run typecheck` | Type check without emitting |

Chromium runs by default. Firefox and WebKit are configured: `npx playwright test --project=firefox`.

## Tags

`@smoke` marks the shortest set that gives confidence the application is up: one calculation, one
validation case, one API contract check, one authenticated session.

```sh
npm run test:smoke        # 7 tests, ~3s, Chromium only
npm run test:regression   # everything, all browsers, ~19s
```

Nothing carries a `@regression` tag. Untagged tests run by default, so tagging all 47 would be
upkeep with no benefit. Add tags with the option form, which keeps them out of test titles:

```ts
test('name', { tag: ['@smoke'] }, async ({ page }) => {
```

`--grep-invert @smoke` selects the complement, for a nightly job that skips what the PR gate covered.

## Network interception

`tests/network/` uses `page.route()` to cover states the live site cannot produce on demand.

```sh
npx playwright test --project=network
```

Third parties blocked, so the gate does not fail on a Google outage. Analytics returning 503, which
a user should never notice. And two progressive-enhancement checks: the calculation with all
JavaScript blocked, and the page with its stylesheet gone. The GOV.UK Design System requires
services to work without client-side JavaScript, so those assert an obligation rather than a
hypothetical.

`contactedHosts` records `requestfinished` rather than `request`. The request event fires before
routing decides, so an aborted request appears there and a blocking assertion would pass whether or
not the block worked.

## Test data

The calculator cases assert exact figures, so they stay on fixed rows in
`testData/holidayEntitlementData.json`. Generating a random number of days worked would mean
reimplementing the entitlement calculation to know what to expect, and a test that reproduces the
code under test cannot catch that code being wrong.

Validation is the case where generated input works: every invalid value is rejected with the same
message, so no oracle is needed. `testData/generators.ts` covers six families of bad input.

The seed is fixed so a failure reproduces on a rerun, and recorded on the run as an annotation.
`FAKER_SEED=777 npm test` sweeps for cases the default seed never reaches.

## Environments

`local`, `dev`, `staging` and `prod` are defined in `config/environments.ts`, each with its own
base URL, timeouts, retry count and feature flags. Select one with `ENV`, or use the scripts:

```sh
npm run test:staging
ENV=prod npx playwright test --project=chromium
```

`BASE_URL` overrides the selected environment's base URL, for review apps and preview deployments.

Credentials are never stored in config. `credentialsFor('admin')` reads `ADMIN_USERNAME` and
`ADMIN_PASSWORD` from the environment and fails with a named error if either is missing. Copy
`.env.example` to `.env` to set them locally; `.env` is gitignored.

Docker:

```sh
docker compose up --build
```

## Authentication

`tests/auth/auth.setup.ts` signs each role in `config/roles.ts` in once before the suite runs and
saves its cookies and localStorage to `.auth/<role>.json`. Authenticated specs start already signed
in, so a login form is never exercised by a test that is not about logging in.

```sh
npx playwright test --project=authenticated
```

A saved session that is still in date is reused rather than recreated, so authentication persists
across runs and not only across the tests within a run. `playwright/.auth/` is gitignored: those
files are live cookies that would let anyone holding them impersonate the test account.

`fixtures/auth.fixture.ts` exports its own `test` for these specs, and provides `pageAs(role)` where
one test needs a second identity.

### Strategies

How a role signs in is configuration. `authStrategy` in `config/environments.ts` selects between:

| Strategy | Status |
| --- | --- |
| `form` | Username and password against the application's own login form. Verified. |
| `entra-id` | Microsoft Entra ID interactive sign-in. **Written but not verified against a real tenant.** |

Entra ID cannot sign in automatically where the test account has MFA enforced; the strategy detects
the challenge and fails with the available options. Adding a strategy means implementing
`AuthStrategy` and registering it in `auth/strategies/index.ts`. Pointing the framework at another
application means replacing `pages/LoginPage.ts` and the `authURL`, not touching any test.

## API tests

`tests/api/` runs against the GOV.UK Content and Search APIs, the same application the UI journeys
exercise. No browser is launched unless a spec asks for `page`, so the whole set completes in about a
second and is the right gate before the slower UI projects.

```sh
npx playwright test --project=api
```

`api/client.ts` validates every response against a zod schema in `api/schemas.ts` and returns a typed
object, so a contract break fails at the boundary naming the offending field rather than as
`undefined is not an object` further downstream. `schemaValidation.test.ts` is the control for that:
it asserts realistic breakages are rejected, so the schemas cannot quietly degrade into accepting
anything.

`crossLayer.test.ts` fetches the expected content from the API and asserts the rendered page matches
it, rather than hardcoding the title. It fails only when the two genuinely disagree.

## Planned

- Custom fixtures so page objects are injected rather than instantiated per test
- Test tagging (`@smoke`, `@regression`) for pipeline stage selection
- Accessibility checks and visual regression
- Linting and pre-commit hooks
