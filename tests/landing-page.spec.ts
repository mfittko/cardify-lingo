import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display the landing page correctly', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');
    
    // Verify the page title and subtitle
    await expect(page.locator('h1')).toContainText('Linguo');
    await expect(page.getByText('Master languages through the power of flashcards')).toBeVisible();
    
    // Verify the language selector is present
    await expect(page.getByText('Select language pair...')).toBeVisible();
    
    // Verify the Continue button is present but disabled
    const continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeVisible();
    await expect(continueButton).toBeDisabled();
  });
  
  test('should allow selecting a language pair', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');
    
    // Click on the language pair dropdown
    await page.click('text=Select language pair...');
    
    // Verify the dropdown menu is visible - use a more specific selector
    await expect(page.getByPlaceholder('Search language pair...')).toBeVisible();
    
    // Select English → Spanish from the dropdown
    await page.click('text=English → Spanish');
    
    // Verify the selected language pair is displayed
    await expect(page.getByRole('combobox').first()).toContainText('English → Spanish');
    
    // Verify the Continue button is now enabled
    const continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeEnabled();
  });
});
