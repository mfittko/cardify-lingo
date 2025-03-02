import { test, expect } from '@playwright/test';

test.describe('Deck Edit', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');
    
    // Select English → Spanish and continue to dashboard
    await page.click('text=Select language pair...');
    await page.click('text=English → Spanish');
    await page.click('text=Continue');
  });

  test('should display current deck information', async ({ page }) => {
    // Create a unique test deck
    const deckName = `Display Info Deck ${Date.now()}`;
    
    // Create a new test deck for editing
    await page.click('text=Create Deck');
    await page.fill('input[placeholder="e.g., Basic Spanish Phrases"]', deckName);
    await page.click('text=Next: Add Cards');
    
    // Add first card
    await page.fill('input[placeholder="e.g., Hello"]', 'Hello');
    await page.fill('input[placeholder="e.g., Hola"]', 'Hola');
    
    // Create the deck
    await page.click('text=Create Deck');
    
    // Wait for the dashboard to load with the new deck
    await expect(page.getByText(deckName)).toBeVisible();
    
    // Click the Edit button on the deck we just created
    await page.getByText(deckName).first().locator('xpath=ancestor::tr').getByRole('button', { name: 'Edit' }).click();
    
    // Verify we're on the edit page
    await expect(page.getByText('Edit Deck')).toBeVisible();
    
    // Verify the deck title is displayed
    const titleInput = page.getByLabel('Deck Title');
    await expect(titleInput).toBeVisible();
    await expect(titleInput).not.toBeEmpty();
    
    // Verify the language pair is displayed
    await expect(page.getByText('English → Spanish')).toBeVisible();
    
    // Verify cards are displayed
    await expect(page.getByText('Cards')).toBeVisible();
    
    // Click Next: Edit Cards to see the cards
    await page.click('text=Next: Edit Cards');
    
    // Verify at least one card is displayed
    await expect(page.getByText('Card 1')).toBeVisible();
  });

  test('should allow editing deck title', async ({ page }) => {
    // Create a unique test deck
    const deckName = `Edit Title Deck ${Date.now()}`;
    
    // Create a new test deck for editing
    await page.click('text=Create Deck');
    await page.fill('input[placeholder="e.g., Basic Spanish Phrases"]', deckName);
    await page.click('text=Next: Add Cards');
    
    // Add first card
    await page.fill('input[placeholder="e.g., Hello"]', 'Hello');
    await page.fill('input[placeholder="e.g., Hola"]', 'Hola');
    
    // Create the deck
    await page.click('text=Create Deck');
    
    // Wait for the dashboard to load with the new deck
    await expect(page.getByText(deckName)).toBeVisible();
    
    // Click the Edit button on the deck we just created
    await page.getByText(deckName).first().locator('xpath=ancestor::tr').getByRole('button', { name: 'Edit' }).click();
    
    // Verify we're on the edit page
    await expect(page.getByText('Edit Deck')).toBeVisible();
    
    // Get the current title
    const titleInput = page.getByLabel('Deck Title');
    const currentTitle = await titleInput.inputValue();
    
    // Edit the title
    await titleInput.fill(currentTitle + ' (Updated)');
    
    // Go to cards view and then save
    await page.click('text=Next: Edit Cards');
    
    // Save changes
    await page.click('text=Save Changes');
    
    // Verify we're back on the dashboard
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Verify the updated title is displayed
    await expect(page.getByText(currentTitle + ' (Updated)')).toBeVisible();
  });

  test('should allow adding new cards', async ({ page }) => {
    // Set a longer timeout for this test
    test.setTimeout(15000);
    
    // Create a unique test deck
    const deckName = `Add Cards Deck ${Date.now()}`;
    
    // Create a new test deck for editing
    await page.click('text=Create Deck');
    await page.fill('input[placeholder="e.g., Basic Spanish Phrases"]', deckName);
    await page.click('text=Next: Add Cards');
    
    // Add first card
    await page.fill('input[placeholder="e.g., Hello"]', 'Hello');
    await page.fill('input[placeholder="e.g., Hola"]', 'Hola');
    
    // Create the deck
    await page.click('text=Create Deck');
    
    // Wait for the dashboard to load with the new deck
    await expect(page.getByText(deckName)).toBeVisible();
    
    // Click the Edit button on the deck we just created
    await page.getByText(deckName).first().locator('xpath=ancestor::tr').getByRole('button', { name: 'Edit' }).click();
    
    // Verify we're on the edit page
    await expect(page.getByText('Edit Deck')).toBeVisible();
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Wait for the "Next: Edit Cards" button to be stable
    await page.waitForSelector('button:has-text("Next: Edit Cards")');
    await page.waitForTimeout(500); // Give the UI a moment to stabilize
    
    // Go to cards view using a more specific selector
    await page.getByRole('button', { name: 'Next: Edit Cards' }).click();
    
    // Wait for the cards view to be fully loaded
    await page.waitForSelector('text=Cards');
    await page.waitForTimeout(500); // Give the UI a moment to stabilize
    
    // Get the current number of cards
    const initialCardText = await page.getByText(/Cards \(\d+\)/).textContent();
    const initialCardCount = initialCardText ? parseInt(initialCardText.match(/\d+/)![0]) : 0;
    
    // Click Add Card button
    await page.getByRole('button', { name: 'Add Card' }).click();
    
    // Wait for the new card to be added
    await page.waitForTimeout(500); // Small delay to ensure UI updates
    
    // Verify a new card form is added by checking the updated card count text
    const updatedCardText = await page.getByText(/Cards \(\d+\)/).textContent();
    const updatedCardCount = updatedCardText ? parseInt(updatedCardText.match(/\d+/)![0]) : 0;
    expect(updatedCardCount).toBe(initialCardCount + 1);
    
    // Fill in the new card
    const frontInputs = await page.getByPlaceholder('e.g., Hello').all();
    const backInputs = await page.getByPlaceholder('e.g., Hola').all();
    
    await frontInputs[initialCardCount].fill('Good afternoon');
    await backInputs[initialCardCount].fill('Buenas tardes');
    
    // Save changes
    await page.getByRole('button', { name: 'Save Changes' }).click();
    
    // Wait for navigation to dashboard
    await page.waitForSelector('h1:has-text("Dashboard")');
    await page.waitForLoadState('networkidle');
    
    // Verify we're back on the dashboard
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Go back to edit mode to verify the new card was saved
    // Find the deck by title and click its Edit button
    await page.waitForTimeout(500); // Give the UI a moment to stabilize
    await page.getByRole('button', { name: 'Edit' }).first().click();
    
    // Wait for navigation to edit page
    await page.waitForSelector('text=Edit Deck');
    await page.waitForLoadState('networkidle');
    
    // Wait for the "Next: Edit Cards" button to be stable
    await page.waitForSelector('button:has-text("Next: Edit Cards")');
    await page.waitForTimeout(500); // Give the UI a moment to stabilize
    
    // Go to cards view
    await page.getByRole('button', { name: 'Next: Edit Cards' }).click();
    
    // Wait for the cards view to be fully loaded
    await page.waitForSelector('text=Cards');
    await page.waitForTimeout(500); // Give the UI a moment to stabilize
    
    // Verify the new card count
    const finalCardText = await page.getByText(/Cards \(\d+\)/).textContent();
    const finalCardCount = finalCardText ? parseInt(finalCardText.match(/\d+/)![0]) : 0;
    expect(finalCardCount).toBe(initialCardCount + 1);
    
    // Verify the new card content
    const updatedFrontInputs = await page.getByPlaceholder('e.g., Hello').all();
    const updatedBackInputs = await page.getByPlaceholder('e.g., Hola').all();
    
    await expect(updatedFrontInputs[initialCardCount]).toHaveValue('Good afternoon');
    await expect(updatedBackInputs[initialCardCount]).toHaveValue('Buenas tardes');
  });

  test('should allow removing cards', async ({ page }) => {
    // Set a longer timeout for this test
    test.setTimeout(15000);
    
    // Create a unique test deck
    const deckName = `Remove Cards Deck ${Date.now()}`;
    
    // Create a new test deck for editing
    await page.click('text=Create Deck');
    await page.fill('input[placeholder="e.g., Basic Spanish Phrases"]', deckName);
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
    await expect(page.getByText(deckName)).toBeVisible();
    
    // Click the Edit button on the deck we just created
    await page.getByText(deckName).first().locator('xpath=ancestor::tr').getByRole('button', { name: 'Edit' }).click();
    
    // Verify we're on the edit page
    await expect(page.getByText('Edit Deck')).toBeVisible();
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Wait for the "Next: Edit Cards" button to be stable
    await page.waitForSelector('button:has-text("Next: Edit Cards")');
    await page.waitForTimeout(500); // Give the UI a moment to stabilize
    
    // Go to cards view using a more specific selector
    await page.getByRole('button', { name: 'Next: Edit Cards' }).click();
    
    // Wait for the cards view to be fully loaded
    await page.waitForSelector('text=Cards');
    await page.waitForTimeout(500); // Give the UI a moment to stabilize
    
    // Get the current number of cards
    const initialCardText = await page.getByText(/Cards \(\d+\)/).textContent();
    const initialCardCount = initialCardText ? parseInt(initialCardText.match(/\d+/)![0]) : 0;
    
    // Click the remove button on the last card
    const removeButtons = await page.getByRole('button', { name: 'Remove card' }).all();
    await removeButtons[initialCardCount - 1].click();
    
    // Wait for the card to be removed
    await page.waitForTimeout(500); // Small delay to ensure UI updates
    
    // Verify the card was removed
    const finalCardText = await page.getByText(/Cards \(\d+\)/).textContent();
    const finalCardCount = finalCardText ? parseInt(finalCardText.match(/\d+/)![0]) : 0;
    expect(finalCardCount).toBe(initialCardCount - 1);
    
    // Save changes
    await page.getByRole('button', { name: 'Save Changes' }).click();
    
    // Wait for navigation to dashboard
    await page.waitForSelector('h1:has-text("Dashboard")');
    await page.waitForLoadState('networkidle');
    
    // Verify we're back on the dashboard
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Go back to edit mode to verify the card was removed permanently
    await page.waitForTimeout(500); // Give the UI a moment to stabilize
    await page.getByRole('button', { name: 'Edit' }).first().click();
    
    // Wait for navigation to edit page
    await page.waitForSelector('text=Edit Deck');
    await page.waitForLoadState('networkidle');
    
    // Wait for the "Next: Edit Cards" button to be stable
    await page.waitForSelector('button:has-text("Next: Edit Cards")');
    await page.waitForTimeout(500); // Give the UI a moment to stabilize
    
    // Go to cards view
    await page.getByRole('button', { name: 'Next: Edit Cards' }).click();
    
    // Wait for the cards view to be fully loaded
    await page.waitForSelector('text=Cards');
    await page.waitForTimeout(500); // Give the UI a moment to stabilize
    
    // Verify the card count
    const verificationCardText = await page.getByText(/Cards \(\d+\)/).textContent();
    const verificationCardCount = verificationCardText ? parseInt(verificationCardText.match(/\d+/)![0]) : 0;
    expect(verificationCardCount).toBe(initialCardCount - 1);
  });

  test('should validate card content before saving', async ({ page }) => {
    // Create a unique test deck
    const deckName = `Validate Cards Deck ${Date.now()}`;
    
    // Create a new test deck for editing
    await page.click('text=Create Deck');
    await page.fill('input[placeholder="e.g., Basic Spanish Phrases"]', deckName);
    await page.click('text=Next: Add Cards');
    
    // Add first card
    await page.fill('input[placeholder="e.g., Hello"]', 'Hello');
    await page.fill('input[placeholder="e.g., Hola"]', 'Hola');
    
    // Create the deck
    await page.click('text=Create Deck');
    
    // Wait for the dashboard to load with the new deck
    await expect(page.getByText(deckName)).toBeVisible();
    
    // Click the Edit button on the deck we just created
    await page.getByText(deckName).first().locator('xpath=ancestor::tr').getByRole('button', { name: 'Edit' }).click();
    
    // Verify we're on the edit page
    await expect(page.getByText('Edit Deck')).toBeVisible();
    
    // Go to cards view
    await page.click('text=Next: Edit Cards');
    
    // Add a new card
    await page.click('text=Add Card');
    
    // Try to save with empty card fields
    await page.click('text=Save Changes');
    
    // We should still be on the edit page
    await expect(page.getByText('Cards')).toBeVisible();
    
    // Fill in the required fields
    const frontInputs = await page.getByPlaceholder('e.g., Hello').all();
    const backInputs = await page.getByPlaceholder('e.g., Hola').all();
    const lastIndex = frontInputs.length - 1;
    
    await frontInputs[lastIndex].fill('Goodbye');
    await backInputs[lastIndex].fill('Adiós');
    
    // Save changes
    await page.click('text=Save Changes');
    
    // Verify we're back on the dashboard
    await expect(page.locator('h1')).toContainText('Dashboard');
  });
});
