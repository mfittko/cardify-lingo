import { test, expect } from '@playwright/test';
import { setupDashboard, fillCardByIndex } from './utils';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Set up the dashboard
    await setupDashboard(page);
  });

  test('should display dashboard elements correctly', async ({ page }) => {
    // Verify the dashboard elements are displayed
    await expect(page.getByText('Current Streak')).toBeVisible();
    await expect(page.getByText('Cards Due Today')).toBeVisible();
    await expect(page.getByText('Total Cards Studied')).toBeVisible();
    
    // Verify the Create Deck button is displayed
    await expect(page.getByRole('button', { name: 'Create Deck' })).toBeVisible();
  });

  test('should allow creating a new deck', async ({ page }) => {
    // Click the Create Deck button
    await page.getByRole('button', { name: 'Create Deck' }).first().click();
    
    // Verify we're on the deck creation page
    await expect(page.locator('h2')).toContainText('Create New Deck');
    
    // Fill in the deck title
    await page.fill('input[placeholder="e.g., Spanish Vocabulary"]', 'Test Deck');
    
    // Select a language pair
    const languagePairSelector = page.getByRole('combobox').first();
    await languagePairSelector.click();
    await page.waitForSelector('text=English → Spanish');
    await page.getByRole('option', { name: 'English → Spanish' }).click();
    
    // Click Next: Add Cards
    await page.getByRole('button', { name: 'Next: Add Cards' }).click();
    
    // Verify we're on the card creation page
    await expect(page.getByText('Add Flashcards')).toBeVisible();
    
    // Add a card using the helper function
    await fillCardByIndex(page, 0, 'Hello', 'Hola');
    
    // Create the deck
    await page.getByRole('button', { name: 'Create Deck' }).click();
    
    // Verify we're back on the dashboard
    await expect(page.getByText('Current Streak')).toBeVisible();
    
    // Verify the new deck is displayed
    await expect(page.getByText('Test Deck')).toBeVisible();
  });

  test('should display proper table alignment', async ({ page }) => {
    // Create a test deck
    await page.getByRole('button', { name: 'Create Deck' }).first().click();
    
    // Fill in the deck title
    await page.fill('input[placeholder="e.g., Spanish Vocabulary"]', 'Table Test Deck');
    
    // Select a language pair
    const languagePairSelector = page.getByRole('combobox').first();
    await languagePairSelector.click();
    await page.waitForSelector('text=English → Spanish');
    await page.getByRole('option', { name: 'English → Spanish' }).click();
    
    // Click Next: Add Cards
    await page.getByRole('button', { name: 'Next: Add Cards' }).click();
    
    // Add a card
    const frontInput = page.locator('#front-0');
    await frontInput.fill('Hello');
    
    const backInput = page.locator('#back-0');
    await backInput.fill('Hola');
    
    // Create the deck
    await page.getByRole('button', { name: 'Create Deck' }).click();
    
    // Verify we're back on the dashboard
    await expect(page.getByText('Current Streak')).toBeVisible();
    
    // Verify the table is displayed
    await expect(page.locator('table')).toBeVisible();
    
    // Verify the table headers
    const tableHeaders = page.locator('table thead th');
    await expect(tableHeaders.nth(0)).toContainText('Title');
    await expect(tableHeaders.nth(1)).toContainText('Cards');
    await expect(tableHeaders.nth(2)).toContainText('Due');
    await expect(tableHeaders.nth(3)).toContainText('Last Studied');
    
    // Verify the deck row has the correct number of cells
    const deckRow = page.locator('table tbody tr').first();
    const cells = deckRow.locator('td');
    await expect(cells).toHaveCount(5); // Title, Cards, Due, Last Studied, Actions
  });
});
