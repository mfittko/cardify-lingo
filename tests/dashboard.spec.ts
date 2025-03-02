import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');
    
    // Select English → Spanish and go to dashboard
    await page.click('text=Select language pair...');
    await page.click('text=English → Spanish');
    await page.click('text=View Dashboard');
    
    // Verify we're on the dashboard page
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should display dashboard elements correctly', async ({ page }) => {
    // Verify dashboard UI elements
    await expect(page.getByText('Current Streak')).toBeVisible();
    await expect(page.getByText('Total Cards Studied')).toBeVisible();
    
    // Verify search functionality is present
    await expect(page.getByPlaceholder('Search decks...')).toBeVisible();
    
    // Verify create deck button is present - use first() to get the first button
    await expect(page.getByRole('button', { name: 'Create Deck' }).first()).toBeVisible();
  });

  test('should allow creating a new deck', async ({ page }) => {
    // Click the Create Deck button
    await page.click('text=Create Deck');
    
    // Verify we're on the deck creation page
    await expect(page.locator('h2')).toContainText('Create New Deck');
    
    // Fill in the deck title
    await page.fill('input[placeholder="e.g., Basic Spanish Phrases"]', 'Test Deck');
    
    // Click Next: Add Cards
    await page.click('text=Next: Add Cards');
    
    // Verify we're on the card creation page
    await expect(page.getByText('Cards (1)')).toBeVisible();
    
    // Add a card
    await page.fill('input[placeholder="e.g., Hello"]', 'Hello');
    await page.fill('input[placeholder="e.g., Hola"]', 'Hola');
    
    // Create the deck
    await page.click('text=Create Deck');
    
    // Verify we're back on the dashboard
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Verify the new deck is displayed
    await expect(page.getByText('Test Deck')).toBeVisible();
  });

  test('should display proper table alignment', async ({ page }) => {
    // Create a deck if none exists
    if (await page.getByText('You don\'t have any decks yet').isVisible()) {
      await page.click('text=Create Your First Deck');
      await page.fill('input[placeholder="e.g., Basic Spanish Phrases"]', 'Alignment Test Deck');
      await page.click('text=Next: Add Cards');
      await page.fill('input[placeholder="e.g., Hello"]', 'Hello');
      await page.fill('input[placeholder="e.g., Hola"]', 'Hola');
      await page.click('text=Create Deck');
    }
    
    // Verify the table is visible
    await expect(page.locator('table')).toBeVisible();
    
    // Verify the table headers
    await expect(page.locator('th').filter({ hasText: 'Title' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'Cards' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'Due' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'Last Studied' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'Actions' })).toBeVisible();
    
    // Verify at least one deck is visible
    await expect(page.locator('tbody tr')).toBeVisible();
    
    // Verify action buttons are visible (using the icons)
    await expect(page.locator('button svg').first()).toBeVisible();
  });
});
