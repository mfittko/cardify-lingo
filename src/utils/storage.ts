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

// Example translations for language pairs
export const languageExamples: Record<string, { front: string; back: string }> = {
  "en-de": { front: "Hello", back: "Hallo" },
  "en-es": { front: "Hello", back: "Hola" },
  "en-fr": { front: "Hello", back: "Bonjour" },
  "en-it": { front: "Hello", back: "Ciao" },
  "en-pt": { front: "Hello", back: "Olá" },
  "en-nl": { front: "Hello", back: "Hallo" },
  "en-ru": { front: "Hello", back: "Привет" },
  "en-ja": { front: "Hello", back: "こんにちは" },
  "en-zh": { front: "Hello", back: "你好" },
  "en-ko": { front: "Hello", back: "안녕하세요" },
  "en-ar": { front: "Hello", back: "مرحبا" },
  "en-hi": { front: "Hello", back: "नमस्ते" },
  "en-tr": { front: "Hello", back: "Merhaba" },
  "en-pl": { front: "Hello", back: "Cześć" },
  "en-sv": { front: "Hello", back: "Hej" },
  "de-en": { front: "Hallo", back: "Hello" },
  "es-en": { front: "Hola", back: "Hello" },
  "fr-en": { front: "Bonjour", back: "Hello" },
  "it-en": { front: "Ciao", back: "Hello" },
  "pt-en": { front: "Olá", back: "Hello" },
  "nl-en": { front: "Hallo", back: "Hello" },
  "ru-en": { front: "Привет", back: "Hello" },
  "ja-en": { front: "こんにちは", back: "Hello" },
  "zh-en": { front: "你好", back: "Hello" },
  "ko-en": { front: "안녕하세요", back: "Hello" },
  "ar-en": { front: "مرحبا", back: "Hello" },
  "hi-en": { front: "नमस्ते", back: "Hello" },
  "tr-en": { front: "Merhaba", back: "Hello" },
  "pl-en": { front: "Cześć", back: "Hello" },
  "sv-en": { front: "Hej", back: "Hello" },
  // Add more language pairs as needed
};

// Mapping from full language names to language codes
const languageNameToCode: Record<string, string> = {
  "English": "en",
  "Spanish": "es",
  "French": "fr",
  "German": "de",
  "Italian": "it",
  "Portuguese": "pt",
  "Dutch": "nl",
  "Russian": "ru",
  "Japanese": "ja",
  "Chinese": "zh",
  "Korean": "ko",
  "Arabic": "ar",
  "Hindi": "hi",
  "Turkish": "tr",
  "Polish": "pl",
  "Swedish": "sv",
};

// Helper function to get example for a language pair
export function getLanguageExample(source: string, target: string): { front: string; back: string } {
  // Convert language names to codes if needed
  const sourceCode = languageNameToCode[source] || source;
  const targetCode = languageNameToCode[target] || target;
  
  // Create the pair key using the codes
  const pairKey = `${sourceCode}-${targetCode}`;
  
  // Look up the example
  return languageExamples[pairKey] || { front: "Example", back: "Translation" };
}

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
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
