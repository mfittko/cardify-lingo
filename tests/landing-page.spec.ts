import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display the landing page correctly', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');
    
    // Verify the page title and subtitle
    await expect(page.locator('h1')).toContainText('Cardify Lingo');
    await expect(page.getByText('Master languages with smart flashcards')).toBeVisible();
    
    // Verify the language selector is present
    await expect(page.locator('h2')).toContainText('Choose Your Language Pair:');
  });
  
  test('should allow selecting a language pair', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');
    
    // Verify the language selector component is present
    await expect(page.locator('.language-selector')).toBeVisible();
    
    // Verify the Continue button is present
    const continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeVisible();
    await expect(continueButton).toBeEnabled();
  });
  
  test('should navigate to dashboard when clicking Continue', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');
    
    // Click the Continue button
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Verify we're on the dashboard page by checking for elements only present on the dashboard
    await expect(page.getByText('Current Streak')).toBeVisible();
    await expect(page.getByText('Cards Due Today')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Deck' })).toBeVisible();
  });
});
