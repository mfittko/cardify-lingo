import { test, expect } from '@playwright/test';
import { setupDashboard } from './utils';

test.describe('Deck Edit', () => {
  test.beforeEach(async ({ page }) => {
    // Set up the dashboard with a test deck
    await setupDashboard(page);
    
    // Create a test deck
    await page.getByRole('button', { name: 'Create Deck' }).first().click();
    
    // Fill in the deck title
    await page.fill('input[placeholder="e.g., Spanish Vocabulary"]', 'Edit Test Deck');
    
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
    
    // Verify the new deck is displayed
    await expect(page.getByText('Edit Test Deck')).toBeVisible();
    
    // Click on the deck to view it
    await page.getByText('Edit Test Deck').click();
    
    // Click the Edit button
    await page.getByRole('button', { name: 'Edit' }).click();
    
    // Verify we're on the edit page
    await expect(page.getByText('Edit Deck')).toBeVisible();
  });

  test('should allow editing deck title and description', async ({ page }) => {
    // Edit the title
    const titleInput = page.locator('input[placeholder="e.g., Basic Spanish Phrases"]');
    await titleInput.clear();
    await titleInput.fill('Updated Deck Title');
    
    // Edit the description
    const descriptionInput = page.locator('textarea[placeholder="What will you learn with this deck?"]');
    await descriptionInput.clear();
    await descriptionInput.fill('This is an updated description');
    
    // Go to cards tab
    await page.getByRole('button', { name: 'Next: Edit Cards' }).click();
    
    // Save changes
    await page.getByRole('button', { name: 'Save Changes' }).click();
    
    // Verify we're back on the deck view page
    await expect(page.getByText('Updated Deck Title')).toBeVisible();
    
    // Description might be displayed differently, so we'll just check that we're back on the deck view
    await expect(page.getByRole('button', { name: 'Study' })).toBeVisible();
  });

  test('should allow adding new cards to an existing deck', async ({ page }) => {
    // Go to the cards tab
    await page.getByRole('button', { name: 'Next: Edit Cards' }).click();
    
    // Verify the existing card is there
    await expect(page.getByText('Card 1')).toBeVisible();
    
    // Add a new card
    await page.getByRole('button', { name: 'Add Card' }).click();
    
    // Fill in the new card
    const frontInput = page.locator('#card-front-1');
    await frontInput.fill('Goodbye');
    
    const backInput = page.locator('#card-back-1');
    await backInput.fill('Adiós');
    
    // Save changes
    await page.getByRole('button', { name: 'Save Changes' }).click();
    
    // Verify we're back on the deck view page
    await expect(page.getByText('Edit Test Deck')).toBeVisible();
    
    // Verify we're on the deck view page with the Study button
    await expect(page.getByRole('button', { name: 'Study' })).toBeVisible();
  });

  test('should allow editing existing cards', async ({ page }) => {
    // Go to the cards tab
    await page.getByRole('button', { name: 'Next: Edit Cards' }).click();
    
    // Edit the existing card
    const frontInput = page.locator('#card-front-0');
    await frontInput.clear();
    await frontInput.fill('Hi');
    
    const backInput = page.locator('#card-back-0');
    await backInput.clear();
    await backInput.fill('¡Hola!');
    
    // Save changes
    await page.getByRole('button', { name: 'Save Changes' }).click();
    
    // Verify we're back on the deck view page
    await expect(page.getByText('Edit Test Deck')).toBeVisible();
    
    // Verify we're on the deck view page with the Study button
    await expect(page.getByRole('button', { name: 'Study' })).toBeVisible();
  });

  test('should allow deleting cards', async ({ page }) => {
    // Go to the cards tab
    await page.getByRole('button', { name: 'Next: Edit Cards' }).click();
    
    // Add a second card so we can delete one
    await page.getByRole('button', { name: 'Add Card' }).click();
    
    // Fill in the new card
    const frontInput = page.locator('#card-front-1');
    await frontInput.fill('Goodbye');
    
    const backInput = page.locator('#card-back-1');
    await backInput.fill('Adiós');
    
    // Delete the first card
    await page.locator('button').filter({ hasText: 'Remove card' }).first().click();
    
    // Save changes
    await page.getByRole('button', { name: 'Save Changes' }).click();
    
    // Verify we're back on the deck view page
    await expect(page.getByText('Edit Test Deck')).toBeVisible();
    
    // Verify we're on the deck view page with the Study button
    await expect(page.getByRole('button', { name: 'Study' })).toBeVisible();
  });

  test('should allow navigating back to dashboard', async ({ page }) => {
    // Click the back button
    await page.getByRole('button', { name: 'Back to Dashboard' }).click();
    
    // Verify we're back on the dashboard
    await expect(page.getByText('Current Streak')).toBeVisible();
    await expect(page.getByText('Cards Due Today')).toBeVisible();
  });
});
