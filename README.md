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
The target host comes from `BASE_URL`.

Docker:

```sh
docker compose up --build
```

## Planned

- Custom fixtures so page objects are injected rather than instantiated per test
- Multi-environment configuration
- Authentication via `globalSetup` and stored session state, with per-role fixtures
- An API layer for contract tests and for test data setup and teardown
- Test tagging (`@smoke`, `@regression`) for pipeline stage selection
- Accessibility checks and visual regression
- Linting and pre-commit hooks
