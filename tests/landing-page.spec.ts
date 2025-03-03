import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display the landing page correctly', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');
    
    // Verify the title is displayed
    await expect(page.locator('h1')).toContainText('Cardify Lingo');
    
    // Verify the subtitle is displayed
    await expect(page.getByText('Master languages with smart flashcards')).toBeVisible();
    
    // Verify the language selector is displayed
    await expect(page.getByRole('combobox').first()).toBeVisible();
    
    // Verify the buttons are displayed
    await expect(page.getByRole('button', { name: 'Create Your First Deck' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'View Dashboard' })).toBeVisible();
  });
  
  test('should allow selecting a language pair', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');
    
    // Verify the landing page title
    await expect(page.getByRole('heading', { name: 'Cardify Lingo' })).toBeVisible();
    
    // Verify the subtitle
    await expect(page.getByText('Master languages with smart flashcards')).toBeVisible();
    
    // Verify the language selector is present
    await expect(page.getByRole('combobox').first()).toBeVisible();
    
    // Click the language selector
    await page.getByRole('combobox').first().click();
    
    // Select English → French
    await page.getByRole('option', { name: 'English → French' }).click();
    
    // Verify the buttons are enabled after selection
    await expect(page.getByRole('button', { name: 'Create Your First Deck' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'View Dashboard' })).toBeEnabled();
  });
  
  test('should provide options to create deck or view dashboard', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');
    
    // Select a language pair
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'English → Spanish' }).click();
    
    // Verify the Create Your First Deck button is displayed
    const createDeckButton = page.getByRole('button', { name: 'Create Your First Deck' });
    await expect(createDeckButton).toBeVisible();
    
    // Verify the View Dashboard button is displayed
    const viewDashboardButton = page.getByRole('button', { name: 'View Dashboard' });
    await expect(viewDashboardButton).toBeVisible();
    
    // Test the Create Your First Deck button navigates to deck creation
    await createDeckButton.click();
    await expect(page.locator('h2')).toContainText('Create New Deck');
    
    // Go back to the landing page
    await page.goto('/');
    
    // Select a language pair again
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'English → Spanish' }).click();
    
    // Test the View Dashboard button navigates to dashboard
    await page.getByRole('button', { name: 'View Dashboard' }).click();
    await expect(page.getByText('Current Streak')).toBeVisible();
  });
});
