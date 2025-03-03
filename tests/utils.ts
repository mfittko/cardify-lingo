import { Page, expect } from '@playwright/test';

/**
 * Navigate to the dashboard and ensure we're logged in with a language pair selected
 */
export async function setupDashboard(page: Page): Promise<void> {
  // Navigate to the landing page
  await page.goto('/');
  
  // Select English → Spanish
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'English → Spanish' }).click();
  
  // Go to dashboard
  await page.getByText('View Dashboard').click();
  
  // Verify we're on the dashboard by checking for dashboard elements
  await expect(page.getByText('Current Streak')).toBeVisible();
  await expect(page.getByText('Cards Due Today')).toBeVisible();
}

/**
 * Create a new deck with basic information
 */
export async function createBasicDeck(page: Page, deckName: string): Promise<void> {
  // Click the Create Deck button
  await page.getByRole('button', { name: 'Create Deck' }).first().click();
  
  // Fill in the deck title
  await page.fill('input[placeholder="e.g., Spanish Vocabulary"]', deckName);
  
  // Select a language pair
  const languagePairSelector = page.getByRole('combobox').first();
  await languagePairSelector.click();
  await page.waitForSelector('text=English → Spanish');
  await page.getByRole('option', { name: 'English → Spanish' }).click();
  
  // Click Next: Add Cards
  await page.getByRole('button', { name: 'Next: Add Cards' }).click();
  
  // Add a card
  await fillCardByIndex(page, 0, 'Hello', 'Hola');
  
  // Create the deck
  await page.getByRole('button', { name: 'Create Deck' }).click();
  
  // Verify we're back on the dashboard
  await expect(page.getByText('Current Streak')).toBeVisible();
  
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
export async function fillCardByIndex(page: Page, index: number, frontText: string, backText: string): Promise<void> {
  // Try to find the inputs with either naming pattern
  const frontSelector = `#front-${index}, #card-front-${index}`;
  const backSelector = `#back-${index}, #card-back-${index}`;
  
  // Wait for the card inputs to be visible
  await page.waitForSelector(frontSelector);
  await page.waitForSelector(backSelector);
  
  // Get the actual elements
  const frontInput = await page.$(frontSelector);
  const backInput = await page.$(backSelector);
  
  // Fill the inputs
  if (frontInput) {
    await frontInput.fill(frontText);
  }
  
  if (backInput) {
    await backInput.fill(backText);
  }
}
