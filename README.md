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
