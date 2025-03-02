import { test, expect } from '@playwright/test';

test.describe('Deck Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');
    
    // Select English → Spanish and continue to dashboard
    await page.click('text=Select language pair...');
    await page.click('text=English → Spanish');
    await page.click('text=Continue');
    
    // Click the Create Deck button
    await page.click('text=Create Deck');
    
    // Verify we're on the deck creation page
    await expect(page.locator('h2')).toContainText('Create New Deck');
  });

  test('should allow creating a deck with basic information', async ({ page }) => {
    // Fill in the deck title
    await page.fill('input[placeholder="e.g., Basic Spanish Phrases"]', 'Common Greetings');
    
    // Add a description
    await page.fill('textarea[placeholder="What will you learn with this deck?"]', 'Basic greetings and introductions in Spanish');
    
    // Verify the language pair is displayed
    await expect(page.getByText('English → Spanish')).toBeVisible();
    
    // Click Next: Add Cards
    await page.click('text=Next: Add Cards');
    
    // Verify we're on the card creation page
    await expect(page.getByText('Cards (1)')).toBeVisible();
  });

  test('should allow adding multiple cards to a deck', async ({ page }) => {
    // Fill in the deck title
    await page.fill('input[placeholder="e.g., Basic Spanish Phrases"]', 'Multiple Cards Test');
    
    // Click Next: Add Cards
    await page.click('text=Next: Add Cards');
    
    // Add first card
    await page.fill('input[placeholder="e.g., Hello"]', 'Hello');
    await page.fill('input[placeholder="e.g., Hola"]', 'Hola');
    
    // Add a second card
    await page.click('text=Add Card');
    
    // Wait for the second card to be visible
    await page.waitForSelector('text=Card 2');
    
    // Fill in the second card
    const frontInputs = await page.locator('input[placeholder="e.g., Hello"]').all();
    const backInputs = await page.locator('input[placeholder="e.g., Hola"]').all();
    
    await frontInputs[1].fill('Good morning');
    await backInputs[1].fill('Buenos días');
    
    // Add a third card
    await page.click('text=Add Card');
    
    // Wait for the third card to be visible
    await page.waitForSelector('text=Card 3');
    
    // Fill in the third card
    const updatedFrontInputs = await page.locator('input[placeholder="e.g., Hello"]').all();
    const updatedBackInputs = await page.locator('input[placeholder="e.g., Hola"]').all();
    
    await updatedFrontInputs[2].fill('Goodbye');
    await updatedBackInputs[2].fill('Adiós');
    
    // Create the deck
    await page.click('text=Create Deck');
    
    // Verify we're back on the dashboard
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Verify the new deck is displayed
    await expect(page.getByText('Multiple Cards Test')).toBeVisible();
    
    // Verify the card count is 3
    const cardCountCell = page.locator('tr', { hasText: 'Multiple Cards Test' }).locator('td').nth(1);
    await expect(cardCountCell).toContainText('3');
  });

  test('should validate required fields', async ({ page }) => {
    // Try to proceed without a title
    await page.click('text=Next: Add Cards');
    
    // We should still be on the same page
    await expect(page.locator('h2')).toContainText('Create New Deck');
    
    // Fill in the title and proceed
    await page.fill('input[placeholder="e.g., Basic Spanish Phrases"]', 'Validation Test');
    await page.click('text=Next: Add Cards');
    
    // Try to create the deck without filling in the cards
    await page.click('text=Create Deck');
    
    // We should still be on the card creation page
    await expect(page.getByText('Cards (1)')).toBeVisible();
    
    // Fill in the card and create the deck
    await page.fill('input[placeholder="e.g., Hello"]', 'Hello');
    await page.fill('input[placeholder="e.g., Hola"]', 'Hola');
    
    await page.click('text=Create Deck');
    
    // Verify we're back on the dashboard
    await expect(page.locator('h1')).toContainText('Dashboard');
  });
});
