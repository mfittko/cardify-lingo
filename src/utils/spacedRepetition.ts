
// Implementation based on a simplified version of the SuperMemo-2 algorithm

interface Card {
  id: string;
  front: string;
  back: string;
  eFactor: number; // easiness factor, starting at 2.5
  interval: number; // in days
  repetitions: number; // count of successful repetitions
  dueDate: number; // timestamp
  lastReviewed: number; // timestamp
  image?: string;
  audio?: string;
}

type Difficulty = "hard" | "medium" | "easy";

const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;

// Convert difficulty to a numerical quality value (0-5)
const difficultyToQuality = (difficulty: Difficulty): number => {
  switch (difficulty) {
    case "hard": return 2;
    case "medium": return 3;
    case "easy": return 5;
    default: return 3;
  }
};

// Process a card review and schedule next review
export const processReview = (card: Card, difficulty: Difficulty): Card => {
  const quality = difficultyToQuality(difficulty);
  const newCard = { ...card };
  
  // Calculate new eFactor using SM-2 algorithm formula
  const newEFactor = Math.max(
    MIN_EASE_FACTOR,
    newCard.eFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );
  
  // Update repetitions and interval
  if (quality < 3) {
    // If the answer was difficult, reset repetitions but maintain some progress
    newCard.repetitions = Math.max(0, newCard.repetitions - 1);
    newCard.interval = 1; // Reset to 1 day
  } else {
    // If the answer was good, increase interval
    newCard.repetitions += 1;
    
    if (newCard.repetitions === 1) {
      newCard.interval = 1;
    } else if (newCard.repetitions === 2) {
      newCard.interval = 3;
    } else {
      newCard.interval = Math.round(newCard.interval * newEFactor);
    }
  }
  
  // Update card properties
  newCard.eFactor = newEFactor;
  newCard.lastReviewed = Date.now();
  newCard.dueDate = Date.now() + newCard.interval * 24 * 60 * 60 * 1000;
  
  return newCard;
};

// Create a new card with default spacing parameters
export const createCard = (
  id: string,
  front: string,
  back: string,
  image?: string,
  audio?: string
): Card => {
  return {
    id,
    front,
    back,
    eFactor: DEFAULT_EASE_FACTOR,
    interval: 0,
    repetitions: 0,
    dueDate: Date.now(), // Due immediately
    lastReviewed: 0, // Never reviewed
    image,
    audio
  };
};

// Get due cards from a deck
export const getDueCards = (cards: Card[]): Card[] => {
  const now = Date.now();
  return cards.filter(card => card.dueDate <= now);
};

// Calculate study statistics
export const getStudyStats = (cards: Card[]) => {
  const now = Date.now();
  const dueCards = cards.filter(card => card.dueDate <= now);
  const newCards = cards.filter(card => card.repetitions === 0);
  const learningCards = cards.filter(card => card.repetitions > 0 && card.repetitions < 3);
  const masteredCards = cards.filter(card => card.repetitions >= 3);
  
  // Calculate cards due in the next 7 days (excluding already due cards)
  const next7Days = Array(7).fill(0).map((_, i) => {
    const targetDate = now + (i + 1) * 24 * 60 * 60 * 1000;
    return cards.filter(card => 
      card.dueDate > now && 
      card.dueDate <= targetDate
    ).length;
  });
  
  return {
    dueCount: dueCards.length,
    newCount: newCards.length,
    learningCount: learningCards.length,
    masteredCount: masteredCards.length,
    totalCount: cards.length,
    next7Days
  };
};
