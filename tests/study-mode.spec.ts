import { test, expect } from '@playwright/test';

test.describe('Study Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');
    
    // Select English → Spanish and continue to dashboard
    await page.click('text=Select language pair...');
    await page.click('text=English → Spanish');
    await page.click('text=Continue');
    
    // Always create a new test deck for studying
    await page.click('text=Create Deck');
    await page.fill('input[placeholder="e.g., Basic Spanish Phrases"]', 'Study Test Deck');
    await page.click('text=Next: Add Cards');
    
    // Add first card
    await page.fill('input[placeholder="e.g., Hello"]', 'Hello');
    await page.fill('input[placeholder="e.g., Hola"]', 'Hola');
    
    // Add second card
    await page.click('text=Add Card');
    await page.waitForSelector('text=Card 2');
    const frontInputs = await page.locator('input[placeholder="e.g., Hello"]').all();
    const backInputs = await page.locator('input[placeholder="e.g., Hola"]').all();
    await frontInputs[1].fill('Thank you');
    await backInputs[1].fill('Gracias');
    
    // Create the deck
    await page.click('text=Create Deck');
    
    // Wait for the dashboard to load with the new deck
    await expect(page.getByText('Study Test Deck')).toBeVisible();
    
    // Click the Study button on the deck we just created
    await page.getByText('Study Test Deck').first().locator('xpath=ancestor::tr').getByRole('button', { name: 'Study' }).click();
  });

  test('should display flashcards correctly', async ({ page }) => {
    // Verify we're in study mode
    await expect(page.getByText('Studying')).toBeVisible();
    
    // Verify the flashcard is displayed
    await expect(page.locator('.card-front')).toBeVisible();
    
    // Verify the progress indicator is visible
    await expect(page.getByText('Card 1 of')).toBeVisible();
  });

  test('should allow flipping cards', async ({ page }) => {
    // Get the front content
    const frontContent = await page.locator('.card-front').textContent();
    
    // Click to flip the card
    await page.click('.flip-card');
    
    // Verify the back of the card is now visible
    await expect(page.locator('.card-back')).toBeVisible();
    
    // The back content should be different from the front
    const backContent = await page.locator('.card-back').textContent();
    expect(backContent).not.toEqual(frontContent);
    
    // Click again to flip back to the front
    await page.click('.flip-card');
    
    // Verify the front is visible again
    await expect(page.locator('.card-front')).toBeVisible();
  });

  test('should allow marking cards as known or unknown', async ({ page }) => {
    // Flip the card to see the answer
    await page.click('.flip-card');
    
    // Verify the "I knew it" and "I didn't know" buttons are visible
    await expect(page.getByRole('button', { name: 'I knew it' })).toBeVisible();
    await expect(page.getByRole('button', { name: "I didn't know" })).toBeVisible();
    
    // Click "I knew it"
    await page.click('text=I knew it');
    
    // We should now see the next card or completion screen
    const isComplete = await page.getByText('Study session complete!').isVisible();
    
    if (!isComplete) {
      // If not complete, we should be on the next card
      await expect(page.locator('.card-front')).toBeVisible();
      
      // Flip the card
      await page.click('.flip-card');
      
      // Click "I didn't know"
      await page.click("text=I didn't know");
      
      // Now we should see the completion screen
      await expect(page.getByText('Study session complete!')).toBeVisible();
    }
    
    // Verify the "Back to Dashboard" button is visible
    await expect(page.getByRole('button', { name: 'Back to Dashboard' })).toBeVisible();
    
    // Go back to dashboard
    await page.click('text=Back to Dashboard');
    
    // Verify we're back on the dashboard
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should track study progress', async ({ page }) => {
    // Complete a study session
    await page.click('.flip-card');
    await page.click('text=I knew it');
    
    // If there's another card, mark it as known too
    if (await page.locator('.card-front').isVisible()) {
      await page.click('.flip-card');
      await page.click('text=I knew it');
    }
    
    // Go back to dashboard
    await page.click('text=Back to Dashboard');
    
    // Verify the "Last Studied" field is updated
    const lastStudiedCell = page.locator('tr').first().locator('td').nth(3);
    await expect(lastStudiedCell).not.toContainText('Never');
    
    // Verify the streak counter is visible
    await expect(page.getByText('Current Streak')).toBeVisible();
    
    // Verify the total cards studied counter is updated
    await expect(page.getByText('Total Cards Studied')).toBeVisible();
    const totalStudiedElement = page.locator('text=Total Cards Studied').locator('xpath=..');
    const totalStudiedText = await totalStudiedElement.textContent();
    
    // Make sure we have a valid text before parsing
    if (totalStudiedText) {
      const totalStudied = parseInt(totalStudiedText.replace(/\D/g, ''));
      expect(totalStudied).toBeGreaterThan(0);
    }
  });
});
