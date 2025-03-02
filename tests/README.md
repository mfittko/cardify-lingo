# Playwright Tests

This directory contains end-to-end tests for the Cardify Lingo application using Playwright.

## Test Structure

- `landing-page.spec.ts` - Tests for the landing page
- `dashboard.spec.ts` - Tests for the dashboard
- `deck-creation.spec.ts` - Tests for creating new decks
- `deck-edit.spec.ts` - Tests for editing existing decks
- `study-mode.spec.ts` - Tests for studying flashcards
- `utils.ts` - Utility functions for common test operations
- `simple.spec.ts` - Basic smoke test

## Running Tests

```sh
# Run all tests
npm test

# Run tests in headed mode (with browser UI)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Run a specific test file
npm run test:single -- tests/landing-page.spec.ts

# Run tests in CI mode
npm run test:ci:full
```

## Best Practices

1. **Use utility functions** for common operations like setting up the dashboard or creating a deck.
2. **Create unique test data** by including timestamps in names to avoid conflicts between tests.
3. **Add explicit waits** when needed, especially after actions that trigger animations or state changes.
4. **Use specific selectors** rather than generic ones to ensure tests are robust.
5. **Keep tests fast** - No single test should take more than 30 seconds to run.
6. **Fix timing issues properly** - Don't increase timeouts to mask underlying problems.
7. **Make tests independent** so they can run in parallel without affecting each other.

## Timeout Philosophy

We maintain consistent timeouts across all environments (local and CI):
- **Test timeout**: 30 seconds maximum for any single test
- **Action timeout**: 10 seconds maximum for any UI action
- **Assertion timeout**: Default Playwright timeouts

If a test is timing out:
1. First, check if there's an actual issue with the application
2. Look for more specific selectors that can be found faster
3. Consider adding strategic waits for specific UI states
4. Optimize the test to reduce unnecessary steps

Increasing timeouts should be a last resort and may indicate an underlying issue that needs to be fixed.

## Debugging Failed Tests

When a test fails, Playwright generates several artifacts to help with debugging:

1. **Screenshots** - Captured at the moment of failure
2. **Trace files** - Detailed recordings of the test execution
3. **HTML reports** - Visual reports showing test results and failures

To view a trace file:

```sh
npx playwright show-trace test-results/[test-name]/trace.zip
```

## CI Integration

Tests are configured to run on CircleCI. The configuration is in the `.circleci/config.yml` file at the root of the project.

When tests run on CircleCI, the following artifacts are uploaded:
- JUnit XML reports for test insights
- HTML reports for visual inspection
- Screenshots of failed tests
- Trace files for debugging

## Adding New Tests

When adding new tests:

1. Create a new file with the `.spec.ts` extension
2. Import the necessary utilities from `utils.ts`
3. Use the `test.describe` and `test` functions to organize your tests
4. Follow the existing patterns for setup, assertions, and cleanup
5. Run your tests locally before pushing to ensure they pass

Example:

```typescript
import { test, expect } from '@playwright/test';
import { setupDashboard, createBasicDeck } from './utils';

test.describe('New Feature', () => {
  test.beforeEach(async ({ page }) => {
    await setupDashboard(page);
  });

  test('should work correctly', async ({ page }) => {
    // Test implementation
  });
});
```

## Test Configuration

The test configuration is defined in `playwright.config.ts` at the root of the project. The configuration includes:

- Test directory: `./tests`
- Browsers: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- Base URL: `http://localhost:8108`
- Web server: Starts the development server automatically

## Writing New Tests

When writing new tests, follow these guidelines:

1. Create a new file for each major feature or page
2. Use descriptive test names that explain what is being tested
3. Use the `test.beforeEach()` hook for common setup steps
4. Use page objects or helper functions for common operations
5. Make assertions that verify both UI elements and functionality

## Example Test

```typescript
test('should allow selecting a language pair and proceeding to dashboard', async ({ page }) => {
  // Navigate to the landing page
  await page.goto('/');
  
  // Verify the page title and subtitle
  await expect(page.locator('h1')).toContainText('Linguo');
  
  // Click on the language pair dropdown
  await page.click('text=Select language pair...');
  
  // Select English → Spanish from the dropdown
  await page.click('text=English → Spanish');
  
  // Click the Continue button
  await page.click('text=Continue');
  
  // Verify we're on the dashboard page
  await expect(page.locator('h1')).toContainText('Dashboard');
});
