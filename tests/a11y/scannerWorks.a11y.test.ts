import { expect, test } from '../../fixtures/a11y.fixture';

/**
 * Control for calculator.a11y.test.ts. Those pass because GOV.UK is built to
 * WCAG AA, which is indistinguishable from a scanner that is not running.
 * Here a known violation is injected and has to be caught.
 */
test('the scanner detects a violation when one is present', async ({
  page,
  scanPage,
}) => {
  await page.evaluate(() => {
    const img = document.createElement('img');
    img.src =
      'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
    // No alt attribute: axe reports this under image-alt, a WCAG A failure.
    document.body.prepend(img);
  });

  await expect(scanPage('injected-violation')).rejects.toThrow(/image-alt/);
});
