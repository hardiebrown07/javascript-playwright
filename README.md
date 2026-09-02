# Playwright Test Automation Framework

A JavaScript test automation framework built with [Playwright](https://playwright.dev).

## Getting started

```sh
npm install
npx playwright install --with-deps
npm test
```

| Script | Purpose |
| --- | --- |
| `npm test` | Run the full suite |
| `npm run test:happy` | Happy path scenarios |
| `npm run test:negative` | Validation scenarios |
| `npm run test:headed` | Run with a visible browser |
| `npm run test:debug` | Playwright inspector |
| `npm run report` | Open the last HTML report |

Chromium runs by default. Firefox and WebKit are configured: `npx playwright test --project=firefox`.
The target host comes from `BASE_URL`.

Docker:

```sh
docker compose up --build
```

## Planned

- TypeScript throughout, with typed page objects and fixtures
- Custom fixtures so page objects are injected rather than instantiated per test
- Multi-environment configuration
- Authentication via `globalSetup` and stored session state, with per-role fixtures
- An API layer for contract tests and for test data setup and teardown
- Test tagging (`@smoke`, `@regression`) for pipeline stage selection
- Accessibility checks and visual regression
- Linting and pre-commit hooks
