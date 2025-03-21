import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Plus, 
  X, 
  AlertCircle, 
  Volume,
  Sparkles,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { saveDeck, loadDeck, loadSettings, getLanguageExample } from "@/utils/storage";
import { createCard } from "@/utils/spacedRepetition";
import { motion, AnimatePresence } from "framer-motion";
import { AIKeyDialog } from "@/components/AIKeyDialog";
import { hasOpenAIKey, generateFlashcards } from "@/utils/aiService";

interface CardForm {
  id: string;
  front: string;
  back: string;
  image?: string;
  audio?: string;
  // We don't include spaced repetition fields in the form
}

const DeckEdit = () => {
  const navigate = useNavigate();
  const { deckId } = useParams<{ deckId: string }>();
  const settings = loadSettings();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cardForms, setCardForms] = useState<CardForm[]>([]);
  const [currentView, setCurrentView] = useState<"details" | "cards">("details");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [deckLanguagePair, setDeckLanguagePair] = useState<{
    source: string;
    target: string;
  } | null>(null);

  // Load the deck data when the component mounts
  useEffect(() => {
    if (!deckId) {
      toast.error("No deck ID provided");
      navigate("/dashboard");
      return;
    }

    const deck = loadDeck(deckId);
    if (!deck) {
      toast.error("Deck not found");
      navigate("/dashboard");
      return;
    }

    // Set the deck details
    setTitle(deck.title);
    setDescription(deck.description || "");
    
    // Store the deck's language pair
    setDeckLanguagePair({
      source: deck.sourceLang,
      target: deck.targetLang
    });
    
    // Convert cards to card forms (only the fields we need for editing)
    const forms = deck.cards.map(card => ({
      id: card.id,
      front: card.front,
      back: card.back,
      image: card.image,
      audio: card.audio
    }));
    
    setCardForms(forms);
    setIsLoading(false);
  }, [deckId, navigate]);

  const addCard = () => {
    setCardForms([...cardForms, { 
      id: `new-${Date.now()}`, // Temporary ID for new cards
      front: "", 
      back: "" 
    }]);
  };

  const removeCard = (index: number) => {
    if (cardForms.length === 1) {
      toast.error("A deck must have at least one card");
      return;
    }
    
    const newCardForms = [...cardForms];
    newCardForms.splice(index, 1);
    setCardForms(newCardForms);
  };

  const updateCard = (index: number, field: keyof CardForm, value: string) => {
    const newCardForms = [...cardForms];
    newCardForms[index] = { ...newCardForms[index], [field]: value };
    setCardForms(newCardForms);
  };

  const handleDetailsNext = () => {
    if (!title.trim()) {
      toast.error("Please enter a deck title");
      return;
    }

    if (!deckLanguagePair) {
      toast.error("No language pair found for this deck");
      return;
    }

    setCurrentView("cards");
  };

  const handleGenerateCards = async () => {
    if (!deckLanguagePair) {
      toast.error("No language pair found for this deck");
      return;
    }

    if (!hasOpenAIKey()) {
      setShowKeyDialog(true);
      return;
    }

    setIsGenerating(true);

    try {
      // Convert cardForms to the Card format expected by generateFlashcards
      const existingCards = cardForms.filter(card => card.front && card.back).map(card => ({
        id: card.id,
        front: card.front,
        back: card.back,
        eFactor: 2.5,
        interval: 0,
        repetitions: 0,
        dueDate: Date.now(),
        lastReviewed: 0,
        image: card.image,
        audio: card.audio
      }));

      const newCards = await generateFlashcards(
        title,
        description,
        deckLanguagePair.source,
        deckLanguagePair.target,
        5, // Generate 5 cards
        existingCards // Pass existing cards to avoid duplicates
      );

      // Check if we have only one card and it's empty
      const hasOnlyEmptyCard = cardForms.length === 1 && 
                              !cardForms[0].front.trim() && 
                              !cardForms[0].back.trim();

      // If we have only one empty card, replace it with the AI-generated cards
      // Otherwise, add the new cards to the existing cards
      if (hasOnlyEmptyCard) {
        setCardForms(newCards.map(card => ({
          id: card.id,
          front: card.front,
          back: card.back
        })));
      } else {
        setCardForms(prev => [...prev, ...newCards.map(card => ({
          id: card.id,
          front: card.front,
          back: card.back
        }))]);
      }

      toast.success("Generated 5 new flashcards!");
    } catch (error) {
      console.error("Failed to generate flashcards:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to generate flashcards: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = () => {
    // Validate
    if (!title.trim()) {
      toast.error("Please enter a deck title");
      return;
    }

    const emptyCards = cardForms.findIndex(
      card => !card.front.trim() || !card.back.trim()
    );

    if (emptyCards !== -1) {
      toast.error(`Card ${emptyCards + 1} has empty fields`);
      return;
    }

    if (!deckLanguagePair) {
      toast.error("No language pair found for this deck");
      return;
    }

    if (!deckId) {
      toast.error("No deck ID provided");
      return;
    }

    // Load the original deck to preserve spaced repetition data
    const originalDeck = loadDeck(deckId);
    if (!originalDeck) {
      toast.error("Deck not found");
      return;
    }

    // Process cards - preserve spaced repetition data for existing cards
    const updatedCards = cardForms.map(form => {
      // If it's an existing card (not a new one)
      if (!form.id.startsWith('new-')) {
        // Find the original card to preserve its spaced repetition data
        const originalCard = originalDeck.cards.find(c => c.id === form.id);
        if (originalCard) {
          return {
            ...originalCard,
            front: form.front,
            back: form.back,
            image: form.image,
            audio: form.audio
          };
        }
      }
      
      // It's a new card, create it with default spaced repetition values
      return createCard(
        form.id.startsWith('new-') ? Date.now().toString(36) + Math.random().toString(36).substr(2, 5) : form.id,
        form.front,
        form.back,
        form.image,
        form.audio
      );
    });

    // Update the deck
    const updatedDeck = {
      ...originalDeck,
      title,
      description,
      sourceLang: deckLanguagePair.source,
      targetLang: deckLanguagePair.target,
      cards: updatedCards,
    };

    saveDeck(updatedDeck);
    toast.success("Deck updated successfully");
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
    <div className="container max-w-xl px-4 py-8">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-6" 
        onClick={() => {
          if (currentView === "cards") {
            setCurrentView("details");
          } else {
            navigate("/dashboard");
          }
        }}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {currentView === "details" ? "Back to Dashboard" : "Back to Details"}
      </Button>
      
      <h1 className="text-3xl font-bold mb-6">Edit Deck</h1>
      
      <AnimatePresence mode="wait">
        {currentView === "details" && (
          <motion.div 
            key="details"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Deck Title</Label>
                  <Input 
                    id="title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="e.g., Basic Spanish Phrases"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea 
                    id="description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="What will you learn with this deck?"
                  />
                </div>
                
                <div className="text-sm text-muted-foreground pt-2">
                  <p className="font-medium">Language Pair</p>
                  <p>
                    {deckLanguagePair ? (
                      `${deckLanguagePair.source} → ${deckLanguagePair.target}`
                    ) : (
                      <span className="text-red-500 flex items-center mt-1">
                        <AlertCircle className="h-4 w-4 mr-1" /> No language pair found
                      </span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Button className="w-full" onClick={handleDetailsNext}>
              Next: Edit Cards
            </Button>
          </motion.div>
        )}
        
        {currentView === "cards" && (
          <motion.div 
            key="cards"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-medium">Cards ({cardForms.length})</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateCards}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Auto-Generate
                </Button>
                <Button variant="outline" size="sm" onClick={addCard}>
                  <Plus className="h-4 w-4 mr-2" /> Add Card
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {cardForms.map((card, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <CardContent className="p-6 space-y-4 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Card {index + 1}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7" 
                        onClick={() => removeCard(index)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove card</span>
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor={`card-front-${index}`}>
                        Front ({deckLanguagePair?.source})
                      </Label>
                      <Input 
                        id={`card-front-${index}`} 
                        value={card.front} 
                        onChange={(e) => updateCard(index, "front", e.target.value)} 
                        placeholder={deckLanguagePair 
                          ? `e.g., ${getLanguageExample(deckLanguagePair.source, deckLanguagePair.target).front}` 
                          : "e.g., Front side"}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`card-back-${index}`}>
                        Back ({deckLanguagePair?.target})
                      </Label>
                      <Input 
                        id={`card-back-${index}`} 
                        value={card.back} 
                        onChange={(e) => updateCard(index, "back", e.target.value)} 
                        placeholder={deckLanguagePair 
                          ? `e.g., ${getLanguageExample(deckLanguagePair.source, deckLanguagePair.target).back}` 
                          : "e.g., Back side"}
                      />
                    </div>
                    
                    {/* Media options could be added here in the future */}
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Button className="w-full" onClick={handleSubmit}>
              Save Changes
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AIKeyDialog 
        open={showKeyDialog}
        onOpenChange={setShowKeyDialog}
        onKeySaved={handleGenerateCards}
      />
    </div>
  );
};

export default DeckEdit; 
