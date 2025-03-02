import { test, expect } from '@playwright/test';
import { setupDashboard, fillCardByIndex, waitForCardsView } from './utils';

test.describe('Deck Creation', () => {
  async function setupDeckCreation(page) {
    // Setup dashboard
    await setupDashboard(page);
    
    // Click the Create Deck button - use a more reliable selector
    await page.getByRole('button', { name: 'Create Deck' }).first().click();
    
    // Verify we're on the deck creation page
    await expect(page.locator('h2')).toContainText('Create New Deck');
  }

  test('should allow creating a deck with basic information', async ({ page }) => {
    // Setup deck creation
    await setupDeckCreation(page);
    
    // Fill in the deck title
    await page.fill('input[placeholder="e.g., Basic Spanish Phrases"]', 'Common Greetings');
    
    // Add a description
    await page.fill('textarea[placeholder="What will you learn with this deck?"]', 'Basic greetings and introductions in Spanish');
    
    // Verify the language pair selector is displayed
    const languagePairSelector = page.getByRole('combobox').first();
    await expect(languagePairSelector).toBeVisible();
    
    // Click Next: Add Cards
    await page.getByRole('button', { name: 'Next: Add Cards' }).click();
    
    // Wait for the cards view to be visible using our helper function
    await waitForCardsView(page);
    
    // Add a card
    await fillCardByIndex(page, 0, 'Hello', 'Hola');
    
    // Create the deck
    await page.getByRole('button', { name: 'Create Deck' }).click();
    
    // Verify we're back on the dashboard
    await expect(page.getByText('Current Streak')).toBeVisible();
    await expect(page.getByText('Cards Due Today')).toBeVisible();
    
    // Verify the new deck is displayed
    await expect(page.getByText('Common Greetings')).toBeVisible();
  });

  test('should allow adding multiple cards to a deck', async ({ page }) => {
    // Setup deck creation
    await setupDeckCreation(page);
    
    // Fill in the deck title
    await page.fill('input[placeholder="e.g., Basic Spanish Phrases"]', 'Multiple Cards Deck');
    
    // Click Next: Add Cards
    await page.getByRole('button', { name: 'Next: Add Cards' }).click();
    
    // Wait for the cards view to be visible using our helper function
    await waitForCardsView(page);
    
    // Add first card
    await fillCardByIndex(page, 0, 'Hello', 'Hola');
    
    // Add a second card
    await page.getByRole('button', { name: 'Add Card' }).click();
    await fillCardByIndex(page, 1, 'Goodbye', 'Adiós');
    
    // Add a third card
    await page.getByRole('button', { name: 'Add Card' }).click();
    await fillCardByIndex(page, 2, 'Thank you', 'Gracias');
    
    // Create the deck
    await page.getByRole('button', { name: 'Create Deck' }).click();
    
    // Verify we're back on the dashboard
    await expect(page.getByText('Current Streak')).toBeVisible();
    
    // Verify the new deck is displayed
    await expect(page.getByText('Multiple Cards Deck')).toBeVisible();
  });

  test('should allow changing the language pair during deck creation', async ({ page }) => {
    // Setup deck creation
    await setupDeckCreation(page);
    
    // Fill in the deck title
    await page.fill('input[placeholder="e.g., Basic Spanish Phrases"]', 'German Phrases');
    
    // Change language pair to German -> English
    await page.getByRole('combobox').first().click();
    await page.getByText('German → English').click();
    
    // Click Next: Add Cards
    await page.getByRole('button', { name: 'Next: Add Cards' }).click();
    
    // Wait for the cards view to be visible using our helper function
    await waitForCardsView(page);
    
    // Add a card
    await fillCardByIndex(page, 0, 'Hello', 'Hola');
    
    // Create the deck
    await page.getByRole('button', { name: 'Create Deck' }).click();
    
    // Verify we're back on the dashboard
    await expect(page.getByText('Current Streak')).toBeVisible();
    
    // Verify the new deck is displayed with the correct language pair
    await expect(page.getByText('German Phrases')).toBeVisible();
    await expect(page.getByText('German → English')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Setup deck creation
    await setupDeckCreation(page);
    
    // Clear the title field to ensure it's empty
    await page.fill('input[placeholder="e.g., Basic Spanish Phrases"]', '');
    
    // Try to proceed without a title
    await page.getByRole('button', { name: 'Next: Add Cards' }).click();
    
    // Verify we're still on the details page (not moved to cards view)
    await expect(page.getByRole('button', { name: 'Next: Add Cards' })).toBeVisible();
    
    // Fill in the title and try again
    await page.fill('input[placeholder="e.g., Basic Spanish Phrases"]', 'Validated Deck');
    await page.getByRole('button', { name: 'Next: Add Cards' }).click();
    
    // Wait for the cards view to be visible using our helper function
    await waitForCardsView(page);
    
    // Fill in the card content
    await fillCardByIndex(page, 0, 'Hello', 'Hola');
    
    // Create the deck
    await page.getByRole('button', { name: 'Create Deck' }).click();
    
    // Verify we're back on the dashboard
    await expect(page.getByText('Current Streak')).toBeVisible();
    
    // Verify the new deck is displayed
    await expect(page.getByText('Validated Deck')).toBeVisible();
  });

  test('should pass language pair when navigating from landing page', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');
    
    // Select a specific language pair (French -> English)
    await page.getByRole('combobox').click();
    await page.getByText('French → English').click();
    
    // Click the Create Your First Deck button
    await page.getByRole('button', { name: 'Create Your First Deck' }).click();
    
    // Verify we're on the deck creation page
    await expect(page.locator('h2')).toContainText('Create New Deck');
    
    // Verify the language pair is pre-selected with French -> English
    const languagePairSelector = page.getByRole('combobox').first();
    await expect(languagePairSelector).toContainText('French → English');
    
    // Fill in the deck title
    await page.fill('input[placeholder="e.g., Basic Spanish Phrases"]', 'French Vocabulary');
    
    // Click Next: Add Cards
    await page.getByRole('button', { name: 'Next: Add Cards' }).click();
    
    // Wait for the cards view to be visible
    await waitForCardsView(page);
    
    // Verify the language labels show the correct languages
    await expect(page.getByText('Front (French)')).toBeVisible();
    await expect(page.getByText('Back (English)')).toBeVisible();
    
    // Add a card
    await fillCardByIndex(page, 0, 'Bonjour', 'Hello');
    
    // Create the deck
    await page.getByRole('button', { name: 'Create Deck' }).click();
    
    // Verify we're back on the dashboard
    await expect(page.getByText('Current Streak')).toBeVisible();
    
    // Verify the new deck is displayed with the correct language pair
    await expect(page.getByText('French Vocabulary')).toBeVisible();
    await expect(page.getByText('French → English')).toBeVisible();
  });

  test('should apply language pair changes in the create form', async ({ page }) => {
    // Setup deck creation
    await setupDeckCreation(page);
    
    // Fill in the deck title
    await page.fill('input[placeholder="e.g., Basic Spanish Phrases"]', 'German Vocabulary');
    
    // Change the language pair to German -> English
    await page.getByRole('combobox').click();
    await page.getByText('German → English').click();
    
    // Click Next: Add Cards
    await page.getByRole('button', { name: 'Next: Add Cards' }).click();
    
    // Wait for the cards view to be visible
    await waitForCardsView(page);
    
    // Verify the language labels show the correct languages
    await expect(page.getByText('Front (German)')).toBeVisible();
    await expect(page.getByText('Back (English)')).toBeVisible();
    
    // Add a card
    await fillCardByIndex(page, 0, 'Hallo', 'Hello');
    
    // Create the deck
    await page.getByRole('button', { name: 'Create Deck' }).click();
    
    // Verify we're back on the dashboard
    await expect(page.getByText('Current Streak')).toBeVisible();
    
    // Verify the new deck is displayed with the correct language pair
    await expect(page.getByText('German Vocabulary')).toBeVisible();
    await expect(page.getByText('German → English')).toBeVisible();
  });
});
