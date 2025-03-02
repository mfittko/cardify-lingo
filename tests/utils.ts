import { Page, expect } from '@playwright/test';

/**
 * Navigate to the dashboard and ensure we're logged in with a language pair selected
 */
export async function setupDashboard(page: Page): Promise<void> {
  // Navigate to the dashboard directly
  await page.goto('/dashboard');
  
  // Verify we're on the dashboard page
  await expect(page.getByText('Cardify Lingo')).toBeVisible();
}

/**
 * Create a basic deck with one card
 */
export async function createBasicDeck(page: Page, deckName?: string): Promise<string> {
  // Setup dashboard first
  await setupDashboard(page);
  
  // Generate a unique deck name if not provided
  const uniqueDeckName = deckName || `Test Deck ${Date.now()}`;
  
  // Click the Create Deck button
  await page.getByRole('button', { name: 'Create Deck' }).first().click();
  
  // Verify we're on the deck creation page
  await expect(page.locator('h2')).toContainText('Create New Deck');
  
  // Fill in the deck title
  await page.fill('input[placeholder="e.g., Basic Spanish Phrases"]', uniqueDeckName);
  
  // Ensure a language pair is selected
  const languagePairText = await page.getByRole('combobox').textContent();
  if (!languagePairText || !languagePairText.includes('→')) {
    await page.getByRole('combobox').click();
    await page.getByText('English → Spanish').first().click();
  }
  
  // Click Next: Add Cards
  await page.getByRole('button', { name: 'Next: Add Cards' }).click();
  
  // Wait for the cards view to be visible
  await waitForCardsView(page);
  
  // Add first card
  await fillCardByIndex(page, 0, 'Hello', 'Hola');
  
  // Create the deck
  await page.getByRole('button', { name: 'Create Deck' }).click();
  
  // Verify we're back on the dashboard
  await expect(page.getByText('Current Streak')).toBeVisible();
  
  // Verify the new deck is displayed
  await expect(page.getByText(uniqueDeckName)).toBeVisible();
  
  return uniqueDeckName;
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
 * Wait for the cards view to be visible
 */
export async function waitForCardsView(page: Page): Promise<void> {
  // Check if we're still on the details page and need to click Next
  try {
    const nextButton = page.getByRole('button', { name: 'Next: Add Cards' });
    if (await nextButton.isVisible({ timeout: 1000 })) {
      // Check if we need to select a language pair first
      const languagePairText = await page.getByRole('combobox').textContent();
      if (!languagePairText || !languagePairText.includes('→')) {
        await page.getByRole('combobox').click();
        await page.getByText('English → Spanish').first().click();
      }
      
      await nextButton.click();
    }
  } catch (e) {
    // Ignore errors here, we're just trying to recover if we're still on the details page
  }

  // Wait for the card inputs to be visible
  await expect(page.locator('#card-front-0')).toBeVisible();
  await expect(page.locator('#card-back-0')).toBeVisible();
}

/**
 * Fill a card's front and back by its index (0-based)
 */
export async function fillCardByIndex(page: Page, index: number, front: string, back: string) {
  // Use more reliable selectors
  const frontInput = page.locator(`input[id^="card-front-${index}"]`).or(page.locator(`#card-front-${index}`));
  const backInput = page.locator(`input[id^="card-back-${index}"]`).or(page.locator(`#card-back-${index}`));
  
  // Wait for the inputs to be visible
  await expect(frontInput).toBeVisible();
  await expect(backInput).toBeVisible();
  
  // Clear the inputs first
  await frontInput.clear();
  await backInput.clear();
  
  // Fill the inputs
  await frontInput.fill(front);
  await backInput.fill(back);
  
  // Verify the inputs have the correct values
  await expect(frontInput).toHaveValue(front);
  await expect(backInput).toHaveValue(back);
}

/**
 * Wait for the flashcard to be visible in study mode
 */
export async function waitForFlashcard(page: Page): Promise<void> {
  await page.waitForSelector('.perspective', { state: 'visible' });
  await expect(page.getByText(/Card \d+ of/)).toBeVisible();
}

/**
 * Flip a flashcard and wait for the back to be visible
 */
export async function flipCard(page: Page): Promise<void> {
  await page.locator('.perspective').click();
  
  // Wait for the difficulty buttons to appear, which indicates the card has flipped
  await page.waitForSelector('button:has-text("Easy")', { state: 'visible' });
}

/**
 * Wait for the study session completion screen
 */
export async function waitForSessionComplete(page: Page): Promise<void> {
  await page.waitForSelector('text=Session Complete!', { state: 'visible' });
  await expect(page.getByRole('button', { name: 'Finish' })).toBeVisible();
}
