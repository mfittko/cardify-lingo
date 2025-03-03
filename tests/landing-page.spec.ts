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
    
    // Verify the Create Your First Deck button is present
    const createButton = page.getByRole('button', { name: 'Create Your First Deck' });
    await expect(createButton).toBeVisible();
    await expect(createButton).toBeEnabled();
  });
  
  test('should navigate to create deck view when clicking Create Your First Deck', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');
    
    // Click the Create Your First Deck button
    await page.getByRole('button', { name: 'Create Your First Deck' }).click();
    
    // Verify we're on the deck creation page
    await expect(page.locator('h2')).toContainText('Create New Deck');
  });
});
