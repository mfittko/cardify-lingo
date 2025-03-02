// Type definitions
export interface Card {
  id: string;
  front: string;
  back: string;
  eFactor: number;
  interval: number;
  repetitions: number;
  dueDate: number;
  lastReviewed: number;
  image?: string;
  audio?: string;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  sourceLang: string;
  targetLang: string;
  cards: Card[];
  createdAt: number;
  lastStudied?: number;
  tags?: string[];
}

export interface Settings {
  selectedLanguagePair?: {
    id: string;
    source: string;
    target: string;
  };
  streak: number;
  lastStreakUpdate: number;
  totalCardsStudied: number;
  lastStudyDate?: number;
  openAIKey?: string;
  elevenLabsKey?: string;
  elevenLabsVoiceId?: string;
}

// Default settings
const DEFAULT_SETTINGS: Settings = {
  streak: 0,
  lastStreakUpdate: 0,
  totalCardsStudied: 0,
};

// Storage keys
const STORAGE_KEYS = {
  DECKS: "flashcards_decks",
  SETTINGS: "flashcards_settings",
};

// Load all decks from local storage
export const loadDecks = (): Deck[] => {
  try {
    const decksJson = localStorage.getItem(STORAGE_KEYS.DECKS);
    return decksJson ? JSON.parse(decksJson) : [];
  } catch (error) {
    console.error("Error loading decks from storage:", error);
    return [];
  }
};

// Alias for loadDecks to maintain compatibility
export const loadAllDecks = (): Deck[] => {
  try {
    const decksJson = localStorage.getItem(STORAGE_KEYS.DECKS);
    return decksJson ? JSON.parse(decksJson) : [];
  } catch (error) {
    console.error("Error loading decks from storage:", error);
    return [];
  }
};

// Save all decks to local storage
export const saveDecks = (decks: Deck[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(decks));
  } catch (error) {
    console.error("Error saving decks to storage:", error);
  }
};

// Load a specific deck by ID
export const loadDeck = (deckId: string): Deck | null => {
  try {
    const decks = loadDecks();
    return decks.find((deck) => deck.id === deckId) || null;
  } catch (error) {
    console.error(`Error loading deck ${deckId} from storage:`, error);
    return null;
  }
};

// Save a specific deck (creates or updates)
export const saveDeck = (deck: Deck): void => {
  try {
    const decks = loadDecks();
    const existingIndex = decks.findIndex((d) => d.id === deck.id);
    
    if (existingIndex >= 0) {
      decks[existingIndex] = deck;
    } else {
      decks.push(deck);
    }
    
    saveDecks(decks);
  } catch (error) {
    console.error(`Error saving deck ${deck.id} to storage:`, error);
  }
};

// Delete a specific deck
export const deleteDeck = (deckId: string): void => {
  try {
    let decks = loadDecks();
    decks = decks.filter((deck) => deck.id !== deckId);
    saveDecks(decks);
  } catch (error) {
    console.error(`Error deleting deck ${deckId} from storage:`, error);
  }
};

// Delete multiple decks
export const deleteDecks = (deckIds: string[]): void => {
  try {
    let decks = loadDecks();
    decks = decks.filter((deck) => !deckIds.includes(deck.id));
    saveDecks(decks);
  } catch (error) {
    console.error(`Error deleting decks from storage:`, error);
  }
};

// Get count of due cards in a deck
export const getDueCardsCount = (cards: Card[]): number => {
  const now = Date.now();
  return cards.filter(card => card.dueDate <= now).length;
};

// Load user settings
export const loadSettings = (): Settings => {
  try {
    const settingsJson = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settingsJson 
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(settingsJson) } 
      : DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Error loading settings from storage:", error);
    return DEFAULT_SETTINGS;
  }
};

// Save user settings
export const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving settings to storage:", error);
  }
};

// Update streak count
export const updateStreak = (): number => {
  try {
    const settings = loadSettings();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - (24 * 60 * 60 * 1000);
    
    if (!settings.lastStudyDate) {
      settings.streak = 1;
    } else if (settings.lastStudyDate === today) {
      // Already studied today, don't increment
    } else if (settings.lastStudyDate === yesterday) {
      // Studied yesterday, increment streak
      settings.streak += 1;
    } else {
      // Streak broken
      settings.streak = 1;
    }
    
    settings.lastStudyDate = today;
    
    saveSettings(settings);
    return settings.streak;
  } catch (error) {
    console.error("Error updating streak:", error);
    return 0;
  }
};

// Generate a unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};
