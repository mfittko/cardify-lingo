
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LanguageSelector from "@/components/LanguageSelector";
import { loadSettings, saveSettings } from "@/utils/storage";
import { motion } from "framer-motion";

const Index = () => {
  const [languagePair, setLanguagePair] = useState<{
    id: string;
    source: string;
    target: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Load user's previous language selection
    const settings = loadSettings();
    if (settings.selectedLanguagePair) {
      setLanguagePair(settings.selectedLanguagePair);
    }
    setIsLoading(false);
  }, []);

  const handleLanguageSelect = (selectedPair: {
    id: string;
    source: string;
    target: string;
  }) => {
    setLanguagePair(selectedPair);
    
    // Save language selection to settings
    const settings = loadSettings();
    settings.selectedLanguagePair = selectedPair;
    saveSettings(settings);
  };

  const handleContinue = () => {
    if (languagePair) {
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-background to-background/80">
      <motion.div 
        className="w-full max-w-md mx-auto space-y-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div>
          <motion.h1 
            className="text-4xl font-bold mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            Linguo
          </motion.h1>
          <motion.p 
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            Master languages through the power of flashcards
          </motion.p>
        </div>

        <motion.div 
          className="space-y-6 p-8 bg-card border border-border rounded-xl shadow-sm"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="space-y-2 text-left">
            <h2 className="text-xl font-semibold text-center">Get Started</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Select the language pair you want to practice
            </p>
            <LanguageSelector onSelect={handleLanguageSelect} />
          </div>

          <Button 
            onClick={handleContinue} 
            disabled={!languagePair} 
            className="w-full"
          >
            Continue
          </Button>
        </motion.div>

        <motion.div 
          className="flex justify-center items-center space-x-4 pt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-medium">1</span>
            </div>
            <span className="text-sm font-medium">Choose a language</span>
          </div>
          <div className="h-px w-6 bg-muted"></div>
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground font-medium">2</span>
            </div>
            <span className="text-sm text-muted-foreground">Create flashcards</span>
          </div>
          <div className="h-px w-6 bg-muted"></div>
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground font-medium">3</span>
            </div>
            <span className="text-sm text-muted-foreground">Start learning</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
