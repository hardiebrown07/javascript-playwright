import js from '@eslint/js';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'node_modules',
      'playwright-report',
      'test-results',
      'playwright/.auth',
      'eslint.config.mjs',
    ],
  },

  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,

  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },

  {
    // `async ({}, use)` is how Playwright declares a fixture with no
    // dependencies. The rule cannot tell it apart from a mistake.
    files: ['fixtures/**/*.ts'],
    rules: { 'no-empty-pattern': 'off' },
  },

  {
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'no-empty-pattern': 'off',
      // Waiting on a fixed duration is the usual cause of a flaky suite.
      'playwright/no-wait-for-timeout': 'error',
      // force: true clicks an element a real user could not have clicked.
      'playwright/no-force-option': 'error',
      // toBeVisible() retries; expect(await isVisible()) samples once.
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/no-conditional-in-test': 'warn',
    },
  },

  {
    // Setup projects sign in; the strategy asserts, and skipping is how a
    // valid saved session is reused.
    files: ['**/*.setup.ts'],
    rules: {
      'playwright/expect-expect': 'off',
      'playwright/no-skipped-test': 'off',
      'playwright/no-conditional-in-test': 'off',
    },
  },

  prettier,
);
