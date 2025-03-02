import { Page, expect } from '@playwright/test';

/**
 * Navigate to the dashboard and ensure we're logged in with a language pair selected
 */
export async function setupDashboard(page: Page): Promise<void> {
  // Navigate to the landing page
  await page.goto('/');
  
  // Click the Continue button to go to dashboard
  await page.getByRole('button', { name: 'Continue' }).click();
  
  // Verify we're on the dashboard page - look for the Logo component or "Cardify Lingo" text
  // instead of the h1 with "Dashboard" text that was replaced
  await expect(page.getByText('Cardify Lingo')).toBeVisible();
}

/**
 * Create a new deck with basic information
 */
export async function createBasicDeck(page: Page, deckName: string): Promise<void> {
  // Click the Create Deck button
  await page.click('text=Create Deck');
  
  // Verify we're on the deck creation page
  await expect(page.locator('h2')).toContainText('Create New Deck');
  
  // Fill in the deck title
  await page.fill('input[placeholder^="e.g., Basic Spanish Phrases"]', deckName);
  
  // Click Next: Add Cards
  await page.click('text=Next: Add Cards');
  
  // Wait for the cards view to be visible
  await page.waitForSelector('text=Cards (1)');
  
  // Add a card using direct input selectors
  await page.fill('#card-front-0', 'Hello');
  await page.fill('#card-back-0', 'Hola');
  
  // Create the deck
  await page.click('text=Create Deck');
  
  // Verify we're back on the dashboard
  await expect(page.getByText('Cardify Lingo')).toBeVisible();
  
  // Verify the new deck is displayed
  await expect(page.getByText(deckName)).toBeVisible();
}

/**
 * Get the front input field for a card by its index (0-based)
 */
export async function getFrontInputByIndex(page: Page, index: number) {
  return page.locator(`#card-front-${index}`);
}

/**
 * Get the back input field for a card by its index (0-based)
 */
export async function getBackInputByIndex(page: Page, index: number) {
  return page.locator(`#card-back-${index}`);
}

/**
 * Fill a card's front and back by its index (0-based)
 */
export async function fillCardByIndex(page: Page, index: number, front: string, back: string) {
  // Wait for the card inputs to be visible
  await page.waitForSelector(`#card-front-${index}`);
  await page.waitForSelector(`#card-back-${index}`);
  
  // Fill the inputs
  await page.fill(`#card-front-${index}`, front);
  await page.fill(`#card-back-${index}`, back);
}
