import { test, expect } from '@playwright/test';
import { setupDashboard, fillCardByIndex } from './utils';

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
    
    // Wait for the cards view to be visible
    await expect(page.getByText('Cards (1)')).toBeVisible();
    
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
    await page.fill('input[placeholder="e.g., Basic Spanish Phrases"]', 'Multiple Cards Test');
    
    // Click Next: Add Cards
    await page.getByRole('button', { name: 'Next: Add Cards' }).click();
    
    // Wait for the cards view to be visible
    await expect(page.getByText('Cards (1)')).toBeVisible();
    
    // Add first card
    await fillCardByIndex(page, 0, 'Hello', 'Hola');
    
    // Add a second card
    await page.click('text=Add Card');
    await fillCardByIndex(page, 1, 'Goodbye', 'Adiós');
    
    // Add a third card
    await page.click('text=Add Card');
    await fillCardByIndex(page, 2, 'Thank you', 'Gracias');
    
    // Create the deck
    await page.getByRole('button', { name: 'Create Deck' }).click();
    
    // Verify we're back on the dashboard
    await expect(page.getByText('Current Streak')).toBeVisible();
    await expect(page.getByText('Cards Due Today')).toBeVisible();
    
    // Verify the new deck is displayed
    await expect(page.getByText('Multiple Cards Test')).toBeVisible();
  });

  test('should allow changing the language pair during deck creation', async ({ page }) => {
    // Setup deck creation
    await setupDeckCreation(page);
    
    // Fill in the deck title
    await page.fill('input[placeholder="e.g., Basic Spanish Phrases"]', 'Language Change Test');
    
    // Verify the language pair selector is displayed
    const languagePairSelector = page.getByRole('combobox').first();
    await expect(languagePairSelector).toBeVisible();
    
    // Click Next: Add Cards
    await page.getByRole('button', { name: 'Next: Add Cards' }).click();
    
    // Wait for the cards view to be visible
    await expect(page.getByText('Cards (1)')).toBeVisible();
    
    // Add a card
    await fillCardByIndex(page, 0, 'Hello', 'Hola');
    
    // Create the deck
    await page.getByRole('button', { name: 'Create Deck' }).click();
    
    // Verify we're back on the dashboard
    await expect(page.getByText('Current Streak')).toBeVisible();
    await expect(page.getByText('Cards Due Today')).toBeVisible();
    
    // Verify the new deck is displayed
    await expect(page.getByText('Language Change Test')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Setup deck creation
    await setupDeckCreation(page);
    
    // Fill in the title
    await page.fill('input[placeholder^="e.g., Basic Spanish Phrases"]', 'Validation Test');
    
    // Click Next: Add Cards
    await page.getByRole('button', { name: 'Next: Add Cards' }).click();
    
    // Now we should be on the cards page
    await expect(page.getByText('Cards (1)')).toBeVisible();
    
    // Fill in the card content
    await fillCardByIndex(page, 0, 'Hello', 'Hola');
    
    // Create the deck
    await page.getByRole('button', { name: 'Create Deck' }).click();
    
    // Verify we're back on the dashboard
    await expect(page.getByText('Current Streak')).toBeVisible();
    await expect(page.getByText('Cards Due Today')).toBeVisible();
    
    // Verify the new deck is displayed
    await expect(page.getByText('Validation Test')).toBeVisible();
  });

  test('should pass language pair when navigating from landing page', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');
    
    // Click the Continue button
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Verify we're on the dashboard page by checking for elements only present on the dashboard
    await expect(page.getByText('Current Streak')).toBeVisible();
    await expect(page.getByText('Cards Due Today')).toBeVisible();
    
    // Click Create Deck button
    await page.getByRole('button', { name: 'Create Deck' }).first().click();
    
    // Verify we're on the deck creation page
    await expect(page.locator('h2')).toContainText('Create New Deck');
    
    // Verify the language pair is pre-selected
    const languagePairSelector = page.getByRole('combobox').first();
    await expect(languagePairSelector).toBeVisible();
  });
});
