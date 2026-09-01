# Playwright UI Test Automation Framework

A JavaScript test automation framework built with [Playwright](https://playwright.dev), demonstrating a
maintainable approach to end-to-end UI testing: page object model, data-driven test generation,
containerised execution and CI integration.

The suite under test is the [GOV.UK holiday entitlement calculator](https://www.gov.uk/calculate-your-holiday-entitlement),
a real, publicly available multi-step form with branching logic and server-side validation. It makes a
useful target because the business rules are documented, the expected outputs are verifiable, and the
markup follows the GOV.UK Design System.

## Design

**Page Object Model.** Each screen of the calculator is a class in `pages/`, exposing intent-revealing
methods (`selectWorkPattern`, `enterDaysWorked`) rather than raw locators. Tests describe *what* a user
does; the page objects own *how*.

**Role-based locators.** Elements are found with `getByRole` and accessible names rather than CSS or
XPath. Selectors survive markup changes, and a test that cannot find an element by its accessible role
is usually surfacing a genuine accessibility defect.

**Guarded option maps.** Radio-group selections are driven by lookup maps that throw a descriptive
error on an unknown key, so an invalid test input fails immediately with a clear message instead of
timing out against a locator that was never going to match.

**Data-driven generation.** Test cases are generated from `testData/holidayEntitlementData.json`.
Adding a new scenario means adding a row of data, not writing a new test.

**Readable reports.** Every test is composed of `test.step()` blocks, so the HTML report reads as a
sequence of business actions rather than a stack of assertions.

## Layout

```
pages/                  Page objects, one per screen
  HolidayCalculatorPage.js
  WorkPatternPage.js
  LeaveDatePage.js
  ResultsPage.js
testData/               JSON fixtures driving parameterised tests
tests/
  happyPath/            Five end-to-end entitlement calculations
  negativeScenarios/    Input validation and error handling
playwright.config.js    Projects, reporters, timeouts, artefacts
Dockerfile              Containerised run
docker-compose.yml      Compose entrypoint used by CI
```

## Running

```sh
npm install
npx playwright install --with-deps
npm test
```

| Script | Purpose |
| --- | --- |
| `npm test` | Run the full suite |
| `npm run test:happy` | Happy path scenarios only |
| `npm run test:negative` | Validation scenarios only |
| `npm run test:headed` | Run with a visible browser |
| `npm run test:debug` | Playwright inspector |
| `npm run report` | Open the last HTML report |

Tests run against Chromium by default. Firefox and WebKit are configured and can be selected with
`npx playwright test --project=firefox`.

The target host is read from `BASE_URL`, defaulting to `https://www.gov.uk`.

### Docker

```sh
docker compose up --build
```

The report is written to `./playwright-report` on the host.

## Failure artefacts

Traces, screenshots and video are captured only on failure, keeping successful runs fast while giving
a full reproduction for anything that breaks. Open a trace with:

```sh
npx playwright show-trace test-results/<test-name>/trace.zip
```

## Continuous integration

`.github/workflows/playwright.yml` runs the suite on push and pull request against `main`, and can be
triggered manually. The HTML report is published as a build artefact on every run, including failures.
