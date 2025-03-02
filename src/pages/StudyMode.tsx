
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import FlashCard from "@/components/FlashCard";
import ProgressBar from "@/components/ProgressBar";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { processReview, getDueCards } from "@/utils/spacedRepetition";
import { loadDeck, saveDeck, loadSettings, saveSettings, updateStreak, Deck } from "@/utils/storage";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type Difficulty = "easy" | "medium" | "hard";

const StudyMode = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [currentCards, setCurrentCards] = useState<any[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [studyComplete, setStudyComplete] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    easy: 0,
    medium: 0,
    hard: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!deckId) {
      navigate("/dashboard");
      return;
    }

    const loadedDeck = loadDeck(deckId);
    if (!loadedDeck) {
      toast.error("Deck not found");
      navigate("/dashboard");
      return;
    }

    setDeck(loadedDeck);
    
    // Get due cards
    const dueCards = getDueCards(loadedDeck.cards);
    if (dueCards.length === 0) {
      toast.info("No cards due for review");
      setStudyComplete(true);
    } else {
      setCurrentCards(dueCards);
      setStats(prev => ({ ...prev, total: dueCards.length }));
    }
    
    setIsLoading(false);
  }, [deckId, navigate]);

  const handleCardResult = (difficulty: Difficulty) => {
    if (!deck || currentCardIndex >= currentCards.length) return;

    // Process the card with spaced repetition algorithm
    const updatedCard = processReview(currentCards[currentCardIndex], difficulty);
    
    // Update stats
    setStats(prev => ({
      ...prev,
      [difficulty]: prev[difficulty as keyof typeof prev] + 1,
    }));
    
    // Update the deck with the processed card
    const updatedDeck: Deck = {
      ...deck,
      lastStudied: Date.now(),
      cards: deck.cards.map(card => 
        card.id === updatedCard.id ? updatedCard : card
      ),
    };
    
    // Save the updated deck
    saveDeck(updatedDeck);
    setDeck(updatedDeck);
    
    // Update user stats
    const settings = loadSettings();
    settings.totalCardsStudied += 1;
    saveSettings(settings);
    
    // Update streak if this is the first study session today
    updateStreak();
    
    // Move to next card or finish
    if (currentCardIndex < currentCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      setStudyComplete(true);
    }
  };

  const handleFinish = () => {
    navigate("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-xl px-4 py-8 min-h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        {!studyComplete && (
          <div className="text-sm font-medium">
            Card {currentCardIndex + 1} of {currentCards.length}
          </div>
        )}
      </div>
      
      <h1 className="text-2xl font-bold mb-6">{deck?.title}</h1>
      
      {!studyComplete && deck && currentCards.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentCardIndex} 
            className="flex-1 flex flex-col"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <ProgressBar 
                value={currentCardIndex} 
                max={currentCards.length - 1} 
                barClassName="bg-primary" 
                showLabel 
              />
            </div>
            
            <div className="flex-1 flex items-center justify-center mb-6">
              <FlashCard 
                front={currentCards[currentCardIndex].front}
                back={currentCards[currentCardIndex].back}
                image={currentCards[currentCardIndex].image}
                audio={currentCards[currentCardIndex].audio}
                language={`${deck.sourceLang} → ${deck.targetLang}`}
                onResult={handleCardResult}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      )}
      
      {studyComplete && (
        <motion.div 
          className="flex-1 flex flex-col items-center justify-center text-center px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="rounded-full bg-green-100 p-4 mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-semibold mb-2">Session Complete!</h2>
          <p className="text-muted-foreground mb-8">
            {stats.total > 0 
              ? `You've reviewed ${stats.total} cards`
              : "All cards are up to date. Come back later for more reviews."}
          </p>
          
          {stats.total > 0 && (
            <Card className="w-full max-w-sm mb-8">
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">Your Performance</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Easy</span>
                      <span className="text-sm font-medium">{stats.easy}</span>
                    </div>
                    <ProgressBar 
                      value={stats.easy} 
                      max={stats.total} 
                      barClassName="bg-[hsl(var(--easy))]" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Medium</span>
                      <span className="text-sm font-medium">{stats.medium}</span>
                    </div>
                    <ProgressBar 
                      value={stats.medium} 
                      max={stats.total} 
                      barClassName="bg-[hsl(var(--medium))]" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Hard</span>
                      <span className="text-sm font-medium">{stats.hard}</span>
                    </div>
                    <ProgressBar 
                      value={stats.hard} 
                      max={stats.total} 
                      barClassName="bg-[hsl(var(--hard))]" 
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}
          
          <Button onClick={handleFinish}>
            Finish
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default StudyMode;
