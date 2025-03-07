import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LanguageSelector from "@/components/LanguageSelector";
import { generateId, saveSettings, loadSettings, loadAllDecks } from "@/utils/storage";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();
  const settings = loadSettings();
  const [selectedLanguagePair, setSelectedLanguagePair] = useState(
    settings.selectedLanguagePair || { 
      id: generateId(), 
      source: 'English', 
      target: 'Spanish' 
    }
  );
  const [isLoading, setIsLoading] = useState(true);

  // Check if any decks exist on component mount
  useEffect(() => {
    const decks = loadAllDecks();
    // If user already has decks, redirect to dashboard
    if (decks.length > 0) {
      navigate('/dashboard');
    }
    setIsLoading(false);
  }, [navigate]);

  const handleLanguageChange = (source: string, target: string) => {
    setSelectedLanguagePair({
      id: generateId(),
      source,
      target
    });
  };

  const handleLanguageSelect = (selectedPair: {
    id: string;
    source: string;
    target: string;
  }) => {
    setSelectedLanguagePair(selectedPair);
    
    // Save language selection to settings
    const settings = loadSettings();
    settings.selectedLanguagePair = {
      id: selectedPair.id,
      source: selectedPair.source,
      target: selectedPair.target
    };
    saveSettings(settings);
  };

  const handleContinue = () => {
    // Save selected language pair to settings
    const settings = loadSettings();
    saveSettings({
      ...settings,
      selectedLanguagePair
    });
    
    // Navigate directly to create deck view with the language pair in state
    navigate('/create', {
      state: { selectedLanguagePair }
    });
  };

  const handleCreateDeck = () => {
    if (selectedLanguagePair) {
      navigate("/create", { state: { selectedLanguagePair } });
    }
  };

  const handleViewDashboard = () => {
    if (selectedLanguagePair) {
      navigate("/dashboard");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-indigo-50 to-blue-100 flex flex-col items-center justify-center p-4 absolute inset-0 m-0">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl font-bold text-indigo-900 mb-3">Cardify Lingo</h1>
        <p className="text-lg text-indigo-700">Master languages with smart flashcards</p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="border border-indigo-200 shadow-lg bg-white">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Choose Your Language Pair:</h2>
            
            <LanguageSelector
              selectedSource={selectedLanguagePair.source}
              selectedTarget={selectedLanguagePair.target}
              onLanguageChange={handleLanguageChange}
              onSelect={handleLanguageSelect}
              initialValue={selectedLanguagePair}
              className="mb-6"
            />
            
            <div className="mt-8 space-y-3">
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 text-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg" 
                onClick={handleCreateDeck}
              >
                Create Your First Deck
              </Button>
              <Button 
                variant="outline"
                className="w-full" 
                onClick={handleViewDashboard}
              >
                View Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Index;
