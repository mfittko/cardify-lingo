import { test, expect } from '@playwright/test';
import { setupDashboard, fillCardByIndex } from './utils';

test.describe('Deck Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');
    
    // Select English → Spanish and go to dashboard
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'English → Spanish' }).click();
    await page.getByText('View Dashboard').click();
    
    // Click the Create Deck button
    await page.getByRole('button', { name: 'Create Deck' }).first().click();
    
    // Verify we're on the deck creation page
    await expect(page.locator('h2')).toContainText('Create New Deck');
  });

  test('should allow creating a deck with basic information', async ({ page }) => {
    // Fill in the deck title
    await page.fill('input[placeholder="e.g., Spanish Vocabulary"]', 'Common Greetings');
    
    // Add a description
    await page.fill('textarea[placeholder="What is this deck about?"]', 'Basic greetings and introductions in Spanish');
    
    // Verify the language pair selector is displayed
    const languagePairSelector = page.getByRole('combobox').first();
    await expect(languagePairSelector).toBeVisible();
    
    // Select a language pair
    await languagePairSelector.click();
    await page.waitForSelector('text=English → Spanish');
    await page.getByRole('option', { name: 'English → Spanish' }).click();
    
    // Verify the language pair has been selected
    await expect(languagePairSelector).toContainText('English → Spanish');
    
    // Click Next: Add Cards
    await page.getByRole('button', { name: 'Next: Add Cards' }).click();
    
    // Verify we're on the card creation page
    await expect(page.getByText('Add Flashcards')).toBeVisible();
  });

  test('should allow adding multiple cards to a deck', async ({ page }) => {
    // Fill in the deck title
    await page.fill('input[placeholder="e.g., Spanish Vocabulary"]', 'Multiple Cards Test');
    
    // Select a language pair
    const languagePairSelector = page.getByRole('combobox').first();
    await languagePairSelector.click();
    await page.waitForSelector('text=English → Spanish');
    await page.getByRole('option', { name: 'English → Spanish' }).click();
    
    // Click Next: Add Cards
    await page.getByRole('button', { name: 'Next: Add Cards' }).click();
    
    // Add first card using our helper function
    await fillCardByIndex(page, 0, 'Hello', 'Hola');
    
    // Add a second card
    await page.getByRole('button', { name: 'Add Card' }).click();
    
    // Wait for the second card to be visible
    await page.waitForSelector('text=Card 2');
    
    // Fill in the second card using our helper function
    await fillCardByIndex(page, 1, 'Good morning', 'Buenos días');
    
    // Add a third card
    await page.getByRole('button', { name: 'Add Card' }).click();
    
    // Wait for the third card to be visible
    await page.waitForSelector('text=Card 3');
    
    // Fill in the third card using our helper function
    await fillCardByIndex(page, 2, 'Goodbye', 'Adiós');
    
    // Create the deck
    await page.getByRole('button', { name: 'Create Deck' }).click();
    
    // Verify we're back on the dashboard
    await expect(page.getByText('Current Streak')).toBeVisible();
    
    // Verify the new deck is displayed
    await expect(page.getByText('Multiple Cards Test')).toBeVisible();
    
    // Verify the card count is 3
    const cardCountCell = page.locator('tr', { hasText: 'Multiple Cards Test' }).locator('td').nth(1);
    await expect(cardCountCell).toContainText('3');
  });

  test('should allow changing the language pair during deck creation', async ({ page }) => {
    // Fill in the deck title
    await page.fill('input[placeholder="e.g., Spanish Vocabulary"]', 'Language Change Test');
    
    // Verify the language pair selector is displayed
    const languagePairSelector = page.getByRole('combobox').first();
    await expect(languagePairSelector).toBeVisible();
    
    // Select the initial language pair
    await languagePairSelector.click();
    await page.waitForSelector('text=English → Spanish');
    await page.getByRole('option', { name: 'English → Spanish' }).click();
    
    // Verify the language pair has been selected
    await expect(languagePairSelector).toContainText('English → Spanish');
    
    // Change the language pair
    await languagePairSelector.click();
    await page.waitForSelector('text=English → French');
    await page.getByRole('option', { name: 'English → French' }).click();
    
    // Verify the language pair has been updated
    await expect(languagePairSelector).toContainText('English → French');
    
    // Click Next: Add Cards
    await page.getByRole('button', { name: 'Next: Add Cards' }).click();
    
    // Add a card using the helper function
    await fillCardByIndex(page, 0, 'Hello', 'Bonjour');
    
    // Create the deck
    await page.getByRole('button', { name: 'Create Deck' }).click();
    
    // Verify we're back on the dashboard
    await expect(page.getByText('Current Streak')).toBeVisible();
    
    // Verify the new deck is displayed
    await expect(page.getByText('Language Change Test')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Try to proceed without a title
    await page.getByRole('button', { name: 'Next: Add Cards' }).click();
    
    // We should still be on the same page
    await expect(page.locator('h2')).toContainText('Create New Deck');
    
    // Fill in the title
    await page.fill('input[placeholder="e.g., Spanish Vocabulary"]', 'Validation Test');
    
    // Select a language pair
    const languagePairSelector = page.getByRole('combobox').first();
    await languagePairSelector.click();
    await page.waitForSelector('text=English → Spanish');
    await page.getByRole('option', { name: 'English → Spanish' }).click();
    
    // Proceed to next step
    await page.getByRole('button', { name: 'Next: Add Cards' }).click();
    
    // Try to create the deck without filling in the cards
    await page.getByRole('button', { name: 'Create Deck' }).click();
    
    // We should still be on the card creation page
    await expect(page.getByText('Add Flashcards')).toBeVisible();
    
    // Fill in the card and create the deck using the helper function
    await fillCardByIndex(page, 0, 'Hello', 'Hola');
    
    await page.getByRole('button', { name: 'Create Deck' }).click();
    
    // Verify we're back on the dashboard
    await expect(page.getByText('Current Streak')).toBeVisible();
  });

  test('should pass language pair when navigating from landing page', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');
    
    // Select a language pair
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'English → German' }).click();
    
    // Click Create Your First Deck button
    await page.getByRole('button', { name: 'Create Your First Deck' }).click();
    
    // Verify we're on the deck creation page
    await expect(page.locator('h2')).toContainText('Create New Deck');
    
    // Verify the language pair has been passed correctly
    const languagePairSelector = page.getByRole('combobox').first();
    await expect(languagePairSelector).toContainText('English → German');
    
    // Fill in the deck title
    await page.fill('input[placeholder="e.g., Spanish Vocabulary"]', 'German Vocabulary');
    
    // Click Next: Add Cards
    await page.getByRole('button', { name: 'Next: Add Cards' }).click();
    
    // Verify the language labels show the correct languages
    await expect(page.getByText('English')).toBeVisible();
    await expect(page.getByText('German')).toBeVisible();
  });
});
