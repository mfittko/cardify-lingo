import { test, expect } from '@playwright/test';
import { setupDashboard, fillCardByIndex } from './utils';

test.describe('Dashboard', () => {
  test('should display dashboard elements correctly', async ({ page }) => {
    // Setup dashboard
    await setupDashboard(page);
    
    // Verify dashboard UI elements
    await expect(page.getByText('Current Streak')).toBeVisible();
    await expect(page.getByText('Total Cards Studied')).toBeVisible();
    
    // Verify search functionality is present
    await expect(page.getByPlaceholder('Search decks...')).toBeVisible();
    
    // Verify create deck button is present - use first() to get the first button
    await expect(page.getByRole('button', { name: 'Create Deck' }).first()).toBeVisible();
  });

  test('should allow creating a new deck', async ({ page }) => {
    // Setup dashboard
    await setupDashboard(page);
    
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
    
    // Add a card using the helper function
    await fillCardByIndex(page, 0, 'Hello', 'Hola');
    
    // Create the deck
    await page.click('text=Create Deck');
    
    // Verify we're back on the dashboard
    await expect(page.getByText('Cardify Lingo')).toBeVisible();
    
    // Verify the new deck is displayed
    await expect(page.getByText('Test Deck')).toBeVisible();
  });

  test('should display proper table alignment', async ({ page }) => {
    // Setup dashboard
    await setupDashboard(page);
    
    // Create a deck to ensure we have content to display
    const deckName = `Alignment Test Deck ${Date.now()}`;
    
    // Click the Create Deck button
    await page.getByRole('button', { name: 'Create Deck' }).first().click();
    
    // Fill in the deck title
    await page.fill('input[placeholder="e.g., Basic Spanish Phrases"]', deckName);
    
    // Click Next: Add Cards
    await page.getByRole('button', { name: 'Next: Add Cards' }).click();
    
    // Add a card
    await fillCardByIndex(page, 0, 'Hello', 'Hola');
    
    // Create the deck
    await page.getByRole('button', { name: 'Create Deck' }).click();
    
    // Wait for the dashboard to load with the new deck
    await expect(page.getByText('Current Streak')).toBeVisible();
    await expect(page.getByText('Cards Due Today')).toBeVisible();
    await expect(page.getByText(deckName)).toBeVisible();
    
    // Make sure we're on the "All Decks" tab to see the table
    await page.getByRole('tab', { name: 'All Decks' }).click();
    
    // Verify the table is visible
    await expect(page.locator('[data-testid="decks-table"]')).toBeVisible();
    
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
