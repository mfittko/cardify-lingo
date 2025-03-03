import { test, expect } from '@playwright/test';
import { setupDashboard, createBasicDeck, fillCardByIndex } from './utils';

test.describe('Study Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the landing page and set up the dashboard
    await setupDashboard(page);
  });

  test('should display flashcards correctly', async ({ page }) => {
    // Set a longer timeout for this test
    test.setTimeout(15000);
    
    // Create a unique test deck
    const deckName = `Study Display Deck ${Date.now()}`;
    
    // Create a new test deck for studying
    await createBasicDeck(page, deckName);
    
    // Wait for the UI to stabilize
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Click the Study button on the deck we just created
    await page.getByRole('button', { name: 'Study' }).first().click();
    
    // Wait for the study page to load
    await page.waitForLoadState('networkidle');
    
    // Verify we're in study mode by checking for the deck title
    await expect(page.getByRole('heading', { name: deckName })).toBeVisible();
    
    // Verify the flashcard is displayed - use a more specific selector
    await expect(page.locator('.perspective')).toBeVisible();
    
    // Verify the progress indicator is visible
    await expect(page.getByText(/Card \d+ of/)).toBeVisible();
  });

  test('should allow flipping cards', async ({ page }) => {
    // Set a longer timeout for this test
    test.setTimeout(15000);
    
    // Create a unique test deck
    const deckName = `Study Flip Deck ${Date.now()}`;
    
    // Create a new test deck for studying
    await createBasicDeck(page, deckName);
    
    // Wait for the UI to stabilize
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Click the Study button on the deck we just created
    await page.getByRole('button', { name: 'Study' }).first().click();
    
    // Wait for the study page to load
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.perspective');
    
    // Verify the difficulty buttons are not visible before flipping
    await expect(page.getByRole('button', { name: 'Easy' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Medium' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Hard' })).not.toBeVisible();
    
    // Click to flip the card
    await page.locator('.perspective').click();
    
    // Wait for the card to flip
    await page.waitForTimeout(500);
    
    // Verify the back of the card is now visible by checking for the rating buttons
    await expect(page.getByRole('button', { name: 'Easy' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Medium' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Hard' })).toBeVisible();
  });

  test('should allow marking cards as known or unknown', async ({ page }) => {
    // Set a longer timeout for this test
    test.setTimeout(15000);
    
    // Create a unique test deck
    const deckName = `Study Marking Deck ${Date.now()}`;
    
    // Create a new test deck for studying with two cards
    await page.getByRole('button', { name: 'Create Deck' }).first().click();
    await page.fill('input[placeholder="e.g., Spanish Vocabulary"]', deckName);
    await page.getByRole('button', { name: 'Next: Add Cards' }).click();
    
    // Add a card using the helper function
    await fillCardByIndex(page, 0, 'Hello', 'Hola');
    
    // Add second card
    await page.getByRole('button', { name: 'Add Card' }).click();
    await page.waitForSelector('text=Card 2');
    
    // Fill in the second card
    await fillCardByIndex(page, 1, 'Thank you', 'Gracias');
    
    // Create the deck
    await page.getByRole('button', { name: 'Create Deck' }).click();
    
    // Wait for the dashboard to load with the new deck
    await expect(page.getByText(deckName)).toBeVisible();
    
    // Wait for the UI to stabilize
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Click the Study button on the deck we just created
    await page.getByRole('button', { name: 'Study' }).first().click();
    
    // Wait for the study page to load
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.perspective');
    
    // Flip the card to see the answer
    await page.locator('.perspective').click();
    
    // Wait for the card to flip
    await page.waitForTimeout(500);
    
    // Verify the difficulty buttons are visible
    await expect(page.getByRole('button', { name: 'Easy' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Medium' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Hard' })).toBeVisible();
    
    // Click "Easy" (equivalent to "I knew it")
    await page.getByRole('button', { name: 'Easy' }).click();
    
    // Wait for the next card
    await page.waitForTimeout(1000);
    
    // Flip the second card
    await page.locator('.perspective').click();
    
    // Wait for the card to flip
    await page.waitForTimeout(500);
    
    // Click "Hard" (equivalent to "I didn't know")
    await page.getByRole('button', { name: 'Hard' }).click();
    
    // Wait for the completion screen
    await page.waitForTimeout(1000);
    
    // Now we should see the completion screen
    await expect(page.getByText('Session Complete!')).toBeVisible();
    
    // Verify the "Finish" button is visible
    await expect(page.getByRole('button', { name: 'Finish' })).toBeVisible();
    
    // Go back to dashboard
    await page.getByRole('button', { name: 'Finish' }).click();
    
    // Verify we're back on the dashboard
    await expect(page.getByText('Current Streak')).toBeVisible();
  });

  test('should track study progress', async ({ page }) => {
    // Set a longer timeout for this test
    test.setTimeout(15000);
    
    // Create a unique test deck
    const deckName = `Study Progress Deck ${Date.now()}`;
    
    // Create a new test deck for studying
    await createBasicDeck(page, deckName);
    
    // Wait for the UI to stabilize
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Click the Study button on the deck we just created
    await page.getByRole('button', { name: 'Study' }).first().click();
    
    // Wait for the study page to load
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.perspective');
    
    // Complete a study session
    await page.locator('.perspective').click();
    
    // Wait for the card to flip
    await page.waitForTimeout(500);
    
    await page.getByRole('button', { name: 'Easy' }).click();
    
    // Wait for the completion screen
    await page.waitForTimeout(1000);
    await expect(page.getByText('Session Complete!')).toBeVisible();
    
    // Go back to dashboard
    await page.getByRole('button', { name: 'Finish' }).click();
    
    // Wait for the dashboard to load
    await expect(page.getByText('Current Streak')).toBeVisible();
    
    // Verify the "Last Studied" field is updated - it should not contain "Never"
    const rows = await page.locator('table tbody tr').all();
    for (const row of rows) {
      const title = await row.locator('td').first().textContent();
      if (title && title.includes(deckName)) {
        const lastStudiedCell = row.locator('td').nth(3);
        await expect(lastStudiedCell).not.toContainText('Never');
        break;
      }
    }
    
    // Verify the streak counter is visible
    await expect(page.getByText('Current Streak')).toBeVisible();
    
    // Verify the total cards studied counter is updated
    await expect(page.getByText('Total Cards Studied')).toBeVisible();
    
    // Get the total studied count directly from the element that contains it
    const totalStudiedElement = await page.locator('text=Total Cards Studied').locator('xpath=../..').locator('.text-2xl');
    const totalStudiedText = await totalStudiedElement.textContent();
    
    // Make sure we have a valid text before parsing
    if (totalStudiedText) {
      const totalStudied = parseInt(totalStudiedText.trim());
      expect(totalStudied).toBeGreaterThan(0);
    }
  });
});
