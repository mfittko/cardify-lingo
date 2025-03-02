import { defineConfig, devices } from '@playwright/test';
import os from 'os';
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Maximum time one test can run for. */
  timeout: 30000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  // Determine the number of workers based on environment
  workers: process.env.CI 
    ? 3 // Use a fixed number for CI environments
    : Math.max(2, os.cpus().length - 1), // Use CPU count for local development
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI 
    ? [['list'], ['html'], ['junit', { outputFile: 'test-results/playwright/junit.xml' }]] 
    : [['html'], ['list']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:8108',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: process.env.CI ? 'on-first-retry' : 'on-first-retry',
    /* Capture screenshot on failure */
    screenshot: 'only-on-failure',
    /* Run tests in headless mode */
    headless: true,
    /* Set a reasonable action timeout */
    actionTimeout: 10000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8108',
    reuseExistingServer: true,
    timeout: 20000,
  },
});
