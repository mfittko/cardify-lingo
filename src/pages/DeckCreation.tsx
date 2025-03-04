import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import LanguageSelector from "@/components/LanguageSelector";
import { 
  ArrowLeft, 
  Plus, 
  X, 
  AlertCircle, 
  Volume,
  Image as ImageIcon,
  Sparkles,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { saveDeck, generateId, loadSettings, saveSettings, getLanguageExample } from "@/utils/storage";
import { createCard } from "@/utils/spacedRepetition";
import { motion, AnimatePresence } from "framer-motion";
import { AIKeyDialog } from "@/components/AIKeyDialog";
import { hasOpenAIKey, generateFlashcards } from "@/utils/aiService";

interface CardForm {
  front: string;
  back: string;
  image?: string;
  audio?: string;
}

const DeckCreation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [settings, setSettings] = useState(loadSettings());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [languagePair, setLanguagePair] = useState<{
    id: string;
    source: string;
    target: string;
  } | null>(() => {
    // First try to get language pair from navigation state
    const stateLanguagePair = location.state?.selectedLanguagePair;
    if (stateLanguagePair) {
      // If language pair was passed via navigation, also update settings
      const updatedSettings = loadSettings();
      updatedSettings.selectedLanguagePair = stateLanguagePair;
      saveSettings(updatedSettings);
      return stateLanguagePair;
    }
    // Fall back to settings if no language pair in navigation state
    return settings.selectedLanguagePair || null;
  });
  const [cardForms, setCardForms] = useState<CardForm[]>([
    { front: "", back: "" }
  ]);
  const [currentView, setCurrentView] = useState<"details" | "cards">("details");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showKeyDialog, setShowKeyDialog] = useState(false);

  const handleLanguageChange = (source: string, target: string) => {
    setLanguagePair({
      id: `${source.toLowerCase()}-${target.toLowerCase()}`,
      source,
      target
    });
    
    // Save language selection to settings
    const updatedSettings = loadSettings();
    updatedSettings.selectedLanguagePair = {
      id: `${source.toLowerCase()}-${target.toLowerCase()}`,
      source,
      target
    };
    saveSettings(updatedSettings);
    setSettings(updatedSettings);
  };

  const handleLanguageSelect = (selectedPair: {
    id: string;
    source: string;
    target: string;
  }) => {
    setLanguagePair(selectedPair);
    
    // Save language selection to settings
    const updatedSettings = loadSettings();
    updatedSettings.selectedLanguagePair = {
      id: selectedPair.id,
      source: selectedPair.source,
      target: selectedPair.target
    };
    saveSettings(updatedSettings);
    setSettings(updatedSettings);
  };

  const addCard = () => {
    setCardForms([...cardForms, { front: "", back: "" }]);
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

    if (!languagePair) {
      toast.error("Please select a language pair");
      return;
    }

    setCurrentView("cards");
  };

  const handleGenerateCards = async () => {
    if (!languagePair) {
      toast.error("No language pair selected");
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
        id: generateId(),
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
        languagePair.source,
        languagePair.target,
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
          front: card.front,
          back: card.back
        })));
      } else {
        setCardForms(prev => [...prev, ...newCards.map(card => ({
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

    if (!languagePair) {
      toast.error("No language pair selected");
      return;
    }

    // Create deck
    const deckId = generateId();
    const cards = cardForms.map(form => {
      return createCard(
        generateId(),
        form.front,
        form.back,
        form.image,
        form.audio
      );
    });

    const newDeck = {
      id: deckId,
      title,
      description,
      sourceLang: languagePair.source,
      targetLang: languagePair.target,
      cards,
      createdAt: Date.now(),
    };

    saveDeck(newDeck);
    toast.success("Deck created successfully");
    navigate("/dashboard");
  };

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
      
      <h2 className="text-3xl font-bold mb-6">Create New Deck</h2>
      
      {currentView === "details" ? (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Deck Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Spanish Vocabulary"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="What is this deck about?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Language Pair</Label>
                  <LanguageSelector
                    selectedSource={languagePair?.source}
                    selectedTarget={languagePair?.target}
                    onLanguageChange={handleLanguageChange}
                    onSelect={handleLanguageSelect}
                    initialValue={languagePair}
                  />
                </div>
                
                <Button 
                  type="button" 
                  className="w-full" 
                  onClick={handleDetailsNext}
                >
                  Next: Add Cards
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Add Flashcards</h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGenerateCards}
                disabled={isGenerating || !languagePair}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Cards
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addCard}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Card
              </Button>
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <AnimatePresence>
              {cardForms.map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">Card {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCard(index)}
                          disabled={cardForms.length === 1}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`front-${index}`}>
                            {languagePair ? languagePair.source : "Front"}
                          </Label>
                          <Input
                            id={`front-${index}`}
                            placeholder={`Term in ${languagePair?.source || "source language"}`}
                            value={card.front}
                            onChange={(e) => updateCard(index, "front", e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`back-${index}`}>
                            {languagePair ? languagePair.target : "Back"}
                          </Label>
                          <Input
                            id={`back-${index}`}
                            placeholder={`Translation in ${languagePair?.target || "target language"}`}
                            value={card.back}
                            onChange={(e) => updateCard(index, "back", e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setCurrentView("details")}
            >
              Back
            </Button>
            <Button onClick={handleSubmit}>
              Create Deck
            </Button>
          </div>
        </motion.div>
      )}
      
      <AIKeyDialog 
        open={showKeyDialog} 
        onOpenChange={setShowKeyDialog} 
        onKeySaved={() => {
          setShowKeyDialog(false);
          handleGenerateCards();
        }}
      />
    </div>
  );
};

export default DeckCreation;
