
import { Card } from "./storage";
import { createCard } from "./spacedRepetition";

// Key for storing the OpenAI API key in localStorage
const OPENAI_KEY_STORAGE = "flashcards_openai_key";

// Get the stored OpenAI API key
export const getOpenAIKey = (): string | null => {
  try {
    return localStorage.getItem(OPENAI_KEY_STORAGE);
  } catch (error) {
    console.error("Error accessing OpenAI key from storage:", error);
    return null;
  }
};

// Store the OpenAI API key
export const setOpenAIKey = (key: string): void => {
  try {
    localStorage.setItem(OPENAI_KEY_STORAGE, key);
  } catch (error) {
    console.error("Error storing OpenAI key:", error);
  }
};

// Check if the OpenAI API key exists
export const hasOpenAIKey = (): boolean => {
  return !!getOpenAIKey();
};

// Clear the stored OpenAI API key
export const clearOpenAIKey = (): void => {
  try {
    localStorage.removeItem(OPENAI_KEY_STORAGE);
  } catch (error) {
    console.error("Error clearing OpenAI key:", error);
  }
};

// Generate flashcards using OpenAI
export const generateFlashcards = async (
  deckTitle: string,
  deckDescription: string,
  sourceLang: string,
  targetLang: string,
  count: number = 5
): Promise<Card[]> => {
  const apiKey = getOpenAIKey();
  
  if (!apiKey) {
    throw new Error("OpenAI API key not found");
  }

  // Define prompt for generating flashcards
  const systemPrompt = `You are an expert language teacher and translator who creates high-quality, accurate flashcards for language learning.
Generate ${count} flashcards for a deck titled "${deckTitle}" with the description "${deckDescription}".
The flashcards should translate words or phrases from ${sourceLang} to ${targetLang}.
Each flashcard should be useful, appropriate for language learners, and related to the deck's theme.
Provide only educational, appropriate content suitable for high school students.`;

  const userPrompt = `Please generate ${count} flashcards for my language learning deck.
Respond in the following JSON format only, with no additional text:
[
  {"front": "word or phrase in ${sourceLang}", "back": "translation in ${targetLang}"},
  {"front": "another word or phrase", "back": "its translation"}
]
The content should be relevant to the deck title "${deckTitle}" and description "${deckDescription}".`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON response
    let parsedCards;
    try {
      parsedCards = JSON.parse(content);
    } catch (e) {
      // If there's text before or after the JSON, try to extract just the JSON part
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsedCards = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse the AI response");
      }
    }

    // Convert to our Card format
    return parsedCards.map((card: { front: string; back: string }) => 
      createCard(
        Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        card.front,
        card.back
      )
    );

  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw error;
  }
};
