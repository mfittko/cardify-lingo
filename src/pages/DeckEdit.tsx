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
  Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { saveDeck, loadDeck, loadSettings } from "@/utils/storage";
import { createCard } from "@/utils/spacedRepetition";
import { motion, AnimatePresence } from "framer-motion";

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

    if (!settings.selectedLanguagePair) {
      toast.error("No language pair selected. Please go back to the home screen and select a language pair.");
      return;
    }

    setCurrentView("cards");
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
      sourceLang: settings.selectedLanguagePair.source,
      targetLang: settings.selectedLanguagePair.target,
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
              <Button variant="outline" size="sm" onClick={addCard}>
                <Plus className="h-4 w-4 mr-2" /> Add Card
              </Button>
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
    </div>
  );
};

export default DeckEdit; 