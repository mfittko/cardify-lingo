import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display the landing page correctly', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');
    
    // Verify the page title and subtitle
    await expect(page.locator('h1')).toContainText('Linguo');
    await expect(page.getByText('Master languages through the power of flashcards')).toBeVisible();
    
    // Verify the language selector is present
    await expect(page.getByRole('combobox').first()).toBeVisible();
    
    // Verify the Create New Deck and View Dashboard buttons are present but disabled
    const createDeckButton = page.getByRole('button', { name: 'Create New Deck' });
    const viewDashboardButton = page.getByRole('button', { name: 'View Dashboard' });
    await expect(createDeckButton).toBeVisible();
    await expect(viewDashboardButton).toBeVisible();
    await expect(createDeckButton).toBeDisabled();
    await expect(viewDashboardButton).toBeDisabled();
  });
  
  test('should allow selecting a language pair', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');
    
    // Click on the language pair dropdown
    await page.getByRole('combobox').first().click();
    
    // Verify the dropdown menu is visible - use a more specific selector
    await expect(page.getByPlaceholder('Search language pair...')).toBeVisible();
    
    // Select English → Spanish from the dropdown
    await page.getByRole('option', { name: 'English → Spanish' }).click();
    
    // Verify the selected language pair is displayed
    await expect(page.getByRole('combobox').first()).toContainText('English → Spanish');
    
    // Verify the Create New Deck and View Dashboard buttons are now enabled
    const createDeckButton = page.getByRole('button', { name: 'Create New Deck' });
    const viewDashboardButton = page.getByRole('button', { name: 'View Dashboard' });
    await expect(createDeckButton).toBeEnabled();
    await expect(viewDashboardButton).toBeEnabled();
  });
  
  test('should provide options to create deck or view dashboard', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');
    
    // Select a language pair
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'English → Spanish' }).click();
    
    // Verify both options are available and enabled
    const createDeckButton = page.getByRole('button', { name: 'Create New Deck' });
    const viewDashboardButton = page.getByRole('button', { name: 'View Dashboard' });
    await expect(createDeckButton).toBeVisible();
    await expect(viewDashboardButton).toBeVisible();
    await expect(createDeckButton).toBeEnabled();
    await expect(viewDashboardButton).toBeEnabled();
    
    // Test the Create New Deck button navigates to deck creation
    await createDeckButton.click();
    await expect(page.locator('h2')).toContainText('Create New Deck');
    
    // Go back to landing page
    await page.goto('/');
    
    // Select a language pair again
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'English → Spanish' }).click();
    
    // Test the View Dashboard button navigates to dashboard
    await page.getByRole('button', { name: 'View Dashboard' }).click();
    await expect(page.locator('h1')).toContainText('Dashboard');
  });
});
