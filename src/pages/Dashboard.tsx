import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import DeckCard from "@/components/DeckCard";
import { loadDecks, loadSettings, Deck } from "@/utils/storage";
import { Plus, Fire, Award, BookOpen } from "lucide-react";
import { getDueCards, getStudyStats } from "@/utils/spacedRepetition";
import { motion } from "framer-motion";

const Dashboard = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  const [totalStudied, setTotalStudied] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load decks and settings
    const loadedDecks = loadDecks();
    const settings = loadSettings();

    setDecks(loadedDecks);
    setStreakCount(settings.streakCount);
    setTotalStudied(settings.totalCardsStudied);
    setIsLoading(false);
  }, []);

  const getDueCounts = (deck: Deck) => {
    const dueCards = getDueCards(deck.cards);
    return dueCards.length;
  };

  const formatLastStudied = (timestamp?: number) => {
    if (!timestamp) return "Never";
    
    const now = new Date();
    const date = new Date(timestamp);
    
    // If the date is today
    if (now.toDateString() === date.toDateString()) {
      return "Today";
    }
    
    // If the date is yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (yesterday.toDateString() === date.toDateString()) {
      return "Yesterday";
    }
    
    // Otherwise, use relative format
    const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (days < 7) {
      return `${days} days ago`;
    }
    
    // For older dates, use a more standard format
    return date.toLocaleDateString();
  };

  const calculateTotalDue = () => {
    return decks.reduce((total, deck) => total + getDueCounts(deck), 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Decks</h1>
        <Button asChild size="sm">
          <Link to="/create">
            <Plus className="mr-2 h-4 w-4" /> New Deck
          </Link>
        </Button>
      </div>

      {/* Stats area */}
      <motion.div 
        className="p-6 bg-card border border-border rounded-xl shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-xl font-medium mb-4">Your Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <div className="mr-4 h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Fire className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Streak</p>
              <p className="text-xl font-semibold">{streakCount} days</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="mr-4 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Due Today</p>
              <p className="text-xl font-semibold">{calculateTotalDue()} cards</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="mr-4 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <Award className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cards Studied</p>
              <p className="text-xl font-semibold">{totalStudied} total</p>
            </div>
          </div>
        </div>
      </motion.div>

      <Separator />

      {decks.length === 0 ? (
        <motion.div 
          className="text-center py-12 space-y-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="rounded-full h-20 w-20 bg-muted flex items-center justify-center mx-auto">
            <BookOpen className="h-10 w-10 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-medium">No decks yet</h3>
            <p className="text-muted-foreground mt-1">
              Create your first deck to start learning
            </p>
          </div>
          <Button asChild>
            <Link to="/create">
              <Plus className="mr-2 h-4 w-4" /> Create Deck
            </Link>
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {decks.map((deck, index) => (
            <motion.div
              key={deck.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <DeckCard
                id={deck.id}
                title={deck.title}
                description={deck.description}
                cardCount={deck.cards.length}
                dueCount={getDueCounts(deck)}
                lastStudied={formatLastStudied(deck.lastStudied)}
                sourceLang={deck.sourceLang}
                targetLang={deck.targetLang}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
