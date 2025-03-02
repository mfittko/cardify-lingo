import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Image as ImageIcon,
  Sparkles,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { saveDeck, generateId, loadSettings } from "@/utils/storage";
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
  const settings = loadSettings();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cardForms, setCardForms] = useState<CardForm[]>([
    { front: "", back: "" }
  ]);
  const [currentView, setCurrentView] = useState<"details" | "cards">("details");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showKeyDialog, setShowKeyDialog] = useState(false);

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

    if (!settings.selectedLanguagePair) {
      toast.error("No language pair selected. Please go back to the home screen and select a language pair.");
      return;
    }

    setCurrentView("cards");
  };

  const handleGenerateCards = async () => {
    if (!settings.selectedLanguagePair) {
      toast.error("No language pair selected");
      return;
    }

    if (!hasOpenAIKey()) {
      setShowKeyDialog(true);
      return;
    }

    setIsGenerating(true);

    try {
      const newCards = await generateFlashcards(
        title,
        description,
        settings.selectedLanguagePair.source,
        settings.selectedLanguagePair.target,
        5 // Generate 5 cards
      );

      // Add the new cards to the existing cards
      setCardForms(prev => [...prev, ...newCards.map(card => ({
        front: card.front,
        back: card.back
      }))]);

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

    if (!settings.selectedLanguagePair) {
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
      sourceLang: settings.selectedLanguagePair.source,
      targetLang: settings.selectedLanguagePair.target,
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
      
      <h1 className="text-3xl font-bold mb-6">Create New Deck</h1>
      
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
                    {settings.selectedLanguagePair ? (
                      `${settings.selectedLanguagePair.source} → ${settings.selectedLanguagePair.target}`
                    ) : (
                      <span className="text-red-500 flex items-center mt-1">
                        <AlertCircle className="h-4 w-4 mr-1" /> No language pair selected
                      </span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Button className="w-full" onClick={handleDetailsNext}>
              Next: Add Cards
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
                        Front ({settings.selectedLanguagePair?.source})
                      </Label>
                      <Input 
                        id={`card-front-${index}`} 
                        value={card.front} 
                        onChange={(e) => updateCard(index, "front", e.target.value)} 
                        placeholder="e.g., Hello"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`card-back-${index}`}>
                        Back ({settings.selectedLanguagePair?.target})
                      </Label>
                      <Input 
                        id={`card-back-${index}`} 
                        value={card.back} 
                        onChange={(e) => updateCard(index, "back", e.target.value)} 
                        placeholder="e.g., Hola"
                      />
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" disabled className="text-muted-foreground">
                        <ImageIcon className="h-4 w-4 mr-2" /> Add Image
                      </Button>
                      <Button variant="outline" size="sm" disabled className="text-muted-foreground">
                        <Volume className="h-4 w-4 mr-2" /> Add Audio
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="space-y-4 pt-4">
              <Button className="w-full" onClick={handleSubmit}>
                Create Deck
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                You can add more cards or edit this deck later
              </p>
            </div>
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

export default DeckCreation;
