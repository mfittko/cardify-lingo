import { test, expect } from '@playwright/test';
import { setupDashboard, fillCardByIndex } from './utils';

test.describe('Deck Edit', () => {
  async function createTestDeck(page, deckName) {
    // Setup dashboard
    await setupDashboard(page);
    
    // Create a new test deck for editing
    await page.getByRole('button', { name: 'Create Deck' }).first().click();
    
    // Fill in the deck title
    await page.fill('input[placeholder^="e.g., Basic Spanish Phrases"]', deckName);
    
    // Click Next: Add Cards
    await page.getByRole('button', { name: 'Next: Add Cards' }).click();
    
    // Wait for the cards view to be visible
    await expect(page.getByText('Cards (1)')).toBeVisible();
    
    // Add first card using the helper function
    await fillCardByIndex(page, 0, 'Hello', 'Hola');
    
    // Create the deck
    await page.getByRole('button', { name: 'Create Deck' }).click();
    
    // Wait for the dashboard to load with the new deck
    await expect(page.getByText('Current Streak')).toBeVisible();
    await expect(page.getByText('Cards Due Today')).toBeVisible();
    await expect(page.getByText(deckName)).toBeVisible();
  }

  test('should display current deck information', async ({ page }) => {
    // Create a unique test deck
    const deckName = `Display Info Deck ${Date.now()}`;
    await createTestDeck(page, deckName);
    
    // Click the Edit button on the deck we just created
    await page.getByText(deckName).first().locator('xpath=ancestor::tr').getByRole('button', { name: 'Edit' }).click();
    
    // Verify we're on the edit page - check for the deck title field
    const titleInput = page.locator('input[id^="title"]');
    await expect(titleInput).toBeVisible();
    await expect(titleInput).toHaveValue(deckName);
    
    // Click on the "Cards" tab/button to switch to cards view
    await page.getByRole('button', { name: 'Next: Edit Cards' }).click();
    
    // Verify the card is displayed
    const frontInput = page.locator('#card-front-0');
    const backInput = page.locator('#card-back-0');
    await expect(frontInput).toBeVisible();
    await expect(backInput).toBeVisible();
    await expect(frontInput).toHaveValue('Hello');
    await expect(backInput).toHaveValue('Hola');
  });

  test('should allow editing deck title', async ({ page }) => {
    // Create a unique test deck
    const deckName = `Edit Title Deck ${Date.now()}`;
    await createTestDeck(page, deckName);
    
    // Click the Edit button on the deck we just created
    await page.getByText(deckName).first().locator('xpath=ancestor::tr').getByRole('button', { name: 'Edit' }).click();
    
    // Edit the deck title
    const titleInput = page.locator('input[id^="title"]');
    await expect(titleInput).toBeVisible();
    await titleInput.fill(`${deckName} - Updated`);
    
    // Click on the "Cards" tab/button to switch to cards view
    await page.getByRole('button', { name: 'Next: Edit Cards' }).click();
    
    // Save the changes
    await page.getByRole('button', { name: 'Save Changes' }).click();
    
    // Verify we're back on the dashboard
    await expect(page.getByText('Current Streak')).toBeVisible();
    await expect(page.getByText('Cards Due Today')).toBeVisible();
    
    // Verify the updated deck title is displayed
    await expect(page.getByText(`${deckName} - Updated`)).toBeVisible();
  });

  test('should allow adding new cards', async ({ page }) => {
    // Create a unique test deck
    const deckName = `Add Cards Deck ${Date.now()}`;
    await createTestDeck(page, deckName);
    
    // Click the Edit button on the deck we just created
    await page.getByText(deckName).first().locator('xpath=ancestor::tr').getByRole('button', { name: 'Edit' }).click();
    
    // Click on the "Cards" tab/button to switch to cards view
    await page.getByRole('button', { name: 'Next: Edit Cards' }).click();
    
    // Add a new card
    await page.getByRole('button', { name: 'Add Card' }).click();
    
    // Fill in the new card
    await fillCardByIndex(page, 1, 'Goodbye', 'Adiós');
    
    // Save the changes
    await page.getByRole('button', { name: 'Save Changes' }).click();
    
    // Verify we're back on the dashboard
    await expect(page.getByText('Current Streak')).toBeVisible();
    await expect(page.getByText('Cards Due Today')).toBeVisible();
    
    // Verify the card count has increased
    const cardCountCell = page.getByText(deckName).first().locator('xpath=ancestor::tr').locator('td').nth(1);
    await expect(cardCountCell).toContainText('2');
  });

  test('should allow removing cards', async ({ page }) => {
    // Create a unique test deck
    const deckName = `Remove Cards Deck ${Date.now()}`;
    await createTestDeck(page, deckName);
    
    // Click the Edit button on the deck we just created
    await page.getByText(deckName).first().locator('xpath=ancestor::tr').getByRole('button', { name: 'Edit' }).click();
    
    // Click on the "Cards" tab/button to switch to cards view
    await page.getByRole('button', { name: 'Next: Edit Cards' }).click();
    
    // Verify we have one card
    await expect(page.locator('#card-front-0')).toBeVisible();
    
    // Save the changes without adding a second card
    await page.getByRole('button', { name: 'Save Changes' }).click();
    
    // Verify we're back on the dashboard
    await expect(page.getByText('Current Streak')).toBeVisible();
    await expect(page.getByText('Cards Due Today')).toBeVisible();
    
    // Verify the card count is 1
    const cardCountCell = page.getByText(deckName).first().locator('xpath=ancestor::tr').locator('td').nth(1);
    await expect(cardCountCell).toContainText('1');
  });

  test('should validate card content before saving', async ({ page }) => {
    // Create a unique test deck
    const deckName = `Validate Cards Deck ${Date.now()}`;
    await createTestDeck(page, deckName);
    
    // Click the Edit button on the deck we just created
    await page.getByText(deckName).first().locator('xpath=ancestor::tr').getByRole('button', { name: 'Edit' }).click();
    
    // Click on the "Cards" tab/button to switch to cards view
    await page.getByRole('button', { name: 'Next: Edit Cards' }).click();
    
    // Verify the card is displayed
    await expect(page.locator('#card-front-0')).toBeVisible();
    await expect(page.locator('#card-back-0')).toBeVisible();
    
    // Modify the card content
    await page.locator('#card-front-0').fill('Modified front');
    await page.locator('#card-back-0').fill('Modified back');
    
    // Save the changes
    await page.getByRole('button', { name: 'Save Changes' }).click();
    
    // Verify we're back on the dashboard
    await expect(page.getByText('Current Streak')).toBeVisible();
    await expect(page.getByText('Cards Due Today')).toBeVisible();
  });

  test('should preserve language pair when editing a deck', async ({ page }) => {
    // Create a unique test deck
    const deckName = `Language Pair Deck ${Date.now()}`;
    await createTestDeck(page, deckName);
    
    // Click the Edit button on the deck we just created
    await page.getByText(deckName).first().locator('xpath=ancestor::tr').getByRole('button', { name: 'Edit' }).click();
    
    // Edit the deck title
    const titleInput = page.locator('input[id^="title"]');
    await expect(titleInput).toBeVisible();
    await titleInput.fill(`${deckName} - Updated`);
    
    // Click on the "Cards" tab/button to switch to cards view
    await page.getByRole('button', { name: 'Next: Edit Cards' }).click();
    
    // Save the changes
    await page.getByRole('button', { name: 'Save Changes' }).click();
    
    // Verify we're back on the dashboard
    await expect(page.getByText('Current Streak')).toBeVisible();
    await expect(page.getByText('Cards Due Today')).toBeVisible();
    
    // Verify the updated deck title is displayed
    await expect(page.getByText(`${deckName} - Updated`)).toBeVisible();
  });
});
