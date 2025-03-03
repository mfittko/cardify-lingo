import { test, expect } from '@playwright/test';
import { 
  setupDashboard, 
  createBasicDeck, 
  fillCardByIndex, 
  waitForFlashcard,
  flipCard,
  waitForSessionComplete,
  waitForCardsView
} from './utils';

test.describe('Study Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the landing page and set up the dashboard
    await setupDashboard(page);
  });

  test('should display flashcards correctly', async ({ page }) => {
    // Create a unique test deck
    const deckName = `Study Display Deck ${Date.now()}`;
    
    // Create a new test deck for studying
    await createBasicDeck(page, deckName);
    
    // Wait for the UI to stabilize
    await page.waitForLoadState('networkidle');
    
    // Click the Study button on the deck we just created
    await page.getByRole('button', { name: 'Study' }).first().click();
    
    // Wait for the study page to load and verify flashcard is displayed
    await waitForFlashcard(page);
  });

  test('should allow flipping cards', async ({ page }) => {
    // Create a unique test deck
    const deckName = `Study Flip Deck ${Date.now()}`;
    
    // Create a new test deck for studying
    await createBasicDeck(page, deckName);
    
    // Wait for the UI to stabilize
    await page.waitForLoadState('networkidle');
    
    // Click the Study button on the deck we just created
    await page.getByRole('button', { name: 'Study' }).first().click();
    
    // Wait for the flashcard to be visible
    await waitForFlashcard(page);
    
    // Verify the difficulty buttons are not visible before flipping
    await expect(page.getByRole('button', { name: 'Easy' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Medium' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Hard' })).not.toBeVisible();
    
    // Flip the card and wait for the back to be visible
    await flipCard(page);
    
    // Verify the back of the card is now visible by checking for the rating buttons
    await expect(page.getByRole('button', { name: 'Easy' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Medium' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Hard' })).toBeVisible();
  });

  test('should allow marking cards as known or unknown', async ({ page }) => {
    // Create a unique test deck
    const deckName = `Study Marking Deck ${Date.now()}`;
    
    // Create a new test deck for studying with two cards
    await page.click('text=Create Deck');
    await page.fill('input[placeholder="e.g., Basic Spanish Phrases"]', deckName);
    await page.click('text=Next: Add Cards');
    
    // Wait for the cards view to be visible
    await waitForCardsView(page);
    
    // Add a card using the helper function
    await fillCardByIndex(page, 0, 'Hello', 'Hola');
    
    // Add second card
    await page.click('text=Add Card');
    await page.waitForSelector('text=Card 2');
    const frontInputs = await page.getByPlaceholder('e.g., Hello').all();
    const backInputs = await page.getByPlaceholder('e.g., Hola').all();
    await frontInputs[1].fill('Thank you');
    await backInputs[1].fill('Gracias');
    
    // Create the deck
    await page.click('text=Create Deck');
    
    // Wait for the dashboard to load with the new deck
    await expect(page.getByText(deckName)).toBeVisible();
    
    // Wait for the UI to stabilize
    await page.waitForLoadState('networkidle');
    
    // Click the Study button on the deck we just created
    await page.getByRole('button', { name: 'Study' }).first().click();
    
    // Wait for the flashcard to be visible
    await waitForFlashcard(page);
    
    // Flip the card to see the answer
    await flipCard(page);
    
    // Click "Easy" (equivalent to "I knew it")
    await page.getByRole('button', { name: 'Easy' }).click();
    
    // Wait for the next card to be visible
    await waitForFlashcard(page);
    
    // Flip the second card
    await flipCard(page);
    
    // Click "Hard" (equivalent to "I didn't know")
    await page.getByRole('button', { name: 'Hard' }).click();
    
    // Wait for the completion screen
    await waitForSessionComplete(page);
    
    // Go back to dashboard
    await page.getByRole('button', { name: 'Finish' }).click();
    
    // Verify we're back on the dashboard
    await expect(page.getByText('Current Streak')).toBeVisible();
    await expect(page.getByText('Cards Due Today')).toBeVisible();
  });

  test('should track study progress', async ({ page }) => {
    // Create a unique test deck
    const deckName = `Study Progress Deck ${Date.now()}`;
    
    // Create a new test deck for studying
    await createBasicDeck(page, deckName);
    
    // Wait for the UI to stabilize
    await page.waitForLoadState('networkidle');
    
    // Click the Study button on the deck we just created
    await page.getByRole('button', { name: 'Study' }).first().click();
    
    // Wait for the flashcard to be visible
    await waitForFlashcard(page);
    
    // Complete a study session
    await flipCard(page);
    
    await page.getByRole('button', { name: 'Easy' }).click();
    
    // Wait for the completion screen
    await waitForSessionComplete(page);
    
    // Go back to dashboard
    await page.getByRole('button', { name: 'Finish' }).click();
    
    // Wait for the dashboard to load
    await page.waitForSelector('[data-testid="dashboard-stats"]');
    
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
