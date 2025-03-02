
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LanguageSelector from '@/components/LanguageSelector';
import { languageExamples, generateId, saveSettings, loadSettings } from '@/utils/storage';
import { motion } from 'framer-motion';

export default function Index() {
  const navigate = useNavigate();
  const settings = loadSettings();
  const [selectedLanguagePair, setSelectedLanguagePair] = useState(
    settings.selectedLanguagePair || { 
      id: generateId(), 
      source: 'English', 
      target: 'Spanish' 
    }
  );

  const handleLanguageChange = (source: string, target: string) => {
    setSelectedLanguagePair({
      id: generateId(),
      source,
      target
    });
  };

  const handleContinue = () => {
    // Save selected language pair to settings
    const settings = loadSettings();
    saveSettings({
      ...settings,
      selectedLanguagePair
    });
    
    // Navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-indigo-900 mb-2">Cardify Lingo</h1>
        <p className="text-lg text-indigo-700">Master languages with smart flashcards</p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 border-indigo-200 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Choose Your Language Pair:</h2>
            
            <LanguageSelector
              selectedSource={selectedLanguagePair.source}
              selectedTarget={selectedLanguagePair.target}
              onLanguageChange={handleLanguageChange}
            />
            
            <div className="mt-8">
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700" 
                onClick={handleContinue}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-8 text-sm text-indigo-600"
      >
        Optimized for both desktop and mobile devices
      </motion.div>
    </div>
  );
}
