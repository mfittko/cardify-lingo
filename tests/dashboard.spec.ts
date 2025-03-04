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

  test('should have all action buttons including statistics in the deck table', async ({ page }) => {
    /* 
     * This test specifically checks for the presence of the statistics button in the dashboard table.
     * It would have caught the issue where the statistics button was missing from the table actions
     * while being present in the DeckCard component.
     */
    
    // Create a test deck
    await page.getByRole('button', { name: 'Create Deck' }).first().click();
    
    // Fill in the deck title
    await page.fill('input[placeholder="e.g., Spanish Vocabulary"]', 'Action Buttons Test Deck');
    
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
    
    // Switch to "All Decks" tab to ensure we see all decks
    await page.getByRole('tab', { name: 'All Decks' }).click();
    
    // Get the first deck row
    const deckRow = page.locator('table tbody tr').first();
    
    // Verify all action buttons are present
    const actionCell = deckRow.locator('td').last();
    
    // Check for Study button (using aria-label)
    const studyButton = actionCell.locator('button').nth(0);
    await expect(studyButton).toBeVisible();
    await expect(studyButton.locator('span').filter({ hasText: 'Study' })).toBeVisible();
    
    // Check for Statistics button (this would have caught the missing button)
    const statsButton = actionCell.locator('button').nth(1);
    await expect(statsButton).toBeVisible();
    await expect(statsButton.locator('span').filter({ hasText: 'View statistics' })).toBeVisible();
    
    // Check for Edit button
    const editButton = actionCell.locator('button').nth(2);
    await expect(editButton).toBeVisible();
    await expect(editButton.locator('span').filter({ hasText: 'Edit' })).toBeVisible();
    
    // Check for Delete button
    const deleteButton = actionCell.locator('button').nth(3);
    await expect(deleteButton).toBeVisible();
    await expect(deleteButton.locator('span').filter({ hasText: 'Delete' })).toBeVisible();
    
    // Verify the correct number of action buttons
    await expect(actionCell.locator('button')).toHaveCount(4); // Study, Stats, Edit, Delete
    
    // Also check the "Due for Review" tab
    await page.getByRole('tab', { name: 'Due for Review' }).click();
    
    // Since we just created a new deck, it might not have due cards
    // So we'll only check if there are decks in this tab
    if (await page.locator('table tbody tr').first().isVisible()) {
      const dueActionCell = page.locator('table tbody tr').first().locator('td').last();
      
      // Check for Statistics button in the "Due for Review" tab
      const dueStatsButton = dueActionCell.locator('button').nth(1);
      if (await dueStatsButton.isVisible()) {
        await expect(dueStatsButton.locator('span').filter({ hasText: 'View statistics' })).toBeVisible();
      }
    }
  });
});
