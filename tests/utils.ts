import { Page, expect } from '@playwright/test';

/**
 * Navigate to the dashboard and ensure we're logged in with a language pair selected
 */
export async function setupDashboard(page: Page): Promise<void> {
  // Navigate to the landing page
  await page.goto('/');
  
  // Select English → Spanish and view dashboard
  await page.click('text=Select language pair...');
  await page.click('text=English → Spanish');
  await page.click('text=View Dashboard');
  
  // Verify we're on the dashboard page
  await expect(page.locator('h1')).toContainText('Dashboard');
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
  await page.fill('input[placeholder="e.g., Basic Spanish Phrases"]', deckName);
  
  // Click Next: Add Cards
  await page.click('text=Next: Add Cards');
  
  // Add a card
  await page.fill('input[placeholder="e.g., Hello"]', 'Hello');
  await page.fill('input[placeholder="e.g., Hola"]', 'Hola');
  
  // Create the deck
  await page.click('text=Create Deck');
  
  // Verify we're back on the dashboard
  await expect(page.locator('h1')).toContainText('Dashboard');
  
  // Verify the new deck is displayed
  await expect(page.getByText(deckName)).toBeVisible();
}
