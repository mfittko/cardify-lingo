# Playwright Test Suite for Cardify Lingo

This directory contains automated tests for the Cardify Lingo application using Playwright. These tests verify the functionality of the application and ensure that UI components are working correctly.

## Test Structure

The test suite is organized into the following files:

- **landing-page.spec.ts**: Tests for the landing page and language selection
- **dashboard.spec.ts**: Tests for the dashboard page, including table alignment and deck creation
- **deck-creation.spec.ts**: Tests for creating new decks with flashcards
- **deck-edit.spec.ts**: Tests for editing existing decks and managing cards
- **study-mode.spec.ts**: Tests for studying flashcards and tracking progress

## Running Tests

You can run the tests using the following npm scripts:

```bash
# Run all tests
npm test

# Run tests with UI mode (shows test execution in a UI)
npm run test:ui

# Run tests in headed mode (shows browser windows)
npm run test:headed

# Run tests in debug mode
npm run test:debug
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
