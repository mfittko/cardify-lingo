import { useState, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { loadSettings } from "@/utils/storage";

// Supported language pairs
const languagePairs = [
  { id: "en-es", source: "English", target: "Spanish" },
  { id: "en-fr", source: "English", target: "French" },
  { id: "en-de", source: "English", target: "German" },
  { id: "en-it", source: "English", target: "Italian" },
  { id: "en-pt", source: "English", target: "Portuguese" },
  { id: "en-ja", source: "English", target: "Japanese" },
  { id: "en-zh", source: "English", target: "Chinese" },
  { id: "en-ko", source: "English", target: "Korean" },
  { id: "es-en", source: "Spanish", target: "English" },
  { id: "fr-en", source: "French", target: "English" },
  { id: "de-en", source: "German", target: "English" },
  { id: "it-en", source: "Italian", target: "English" },
  { id: "pt-en", source: "Portuguese", target: "English" },
  { id: "ja-en", source: "Japanese", target: "English" },
  { id: "zh-en", source: "Chinese", target: "English" },
  { id: "ko-en", source: "Korean", target: "English" },
  { id: "de-es", source: "German", target: "Spanish" },
];

interface LanguageSelectorProps {
  selectedSource?: string;
  selectedTarget?: string;
  onLanguageChange?: (source: string, target: string) => void;
  onSelect?: (pair: { id: string; source: string; target: string }) => void;
  className?: string;
  initialValue?: { id: string; source: string; target: string } | null;
}

const LanguageSelector = ({ 
  selectedSource, 
  selectedTarget, 
  onLanguageChange, 
  onSelect,
  className,
  initialValue
}: LanguageSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [selectedLanguagePair, setSelectedLanguagePair] = useState<{
    id: string;
    source: string;
    target: string;
  } | null>(initialValue || null);

  // Initialize from settings if no initialValue is provided
  useEffect(() => {
    if (!selectedLanguagePair && !selectedSource && !selectedTarget) {
      const settings = loadSettings();
      if (settings.selectedLanguagePair) {
        setSelectedLanguagePair(settings.selectedLanguagePair);
        // Also notify parent component
        if (onSelect) {
          onSelect(settings.selectedLanguagePair);
        }
        if (onLanguageChange) {
          onLanguageChange(settings.selectedLanguagePair.source, settings.selectedLanguagePair.target);
        }
      }
    }
  }, [selectedLanguagePair, onSelect, onLanguageChange, selectedSource, selectedTarget]);

  // Use initialValue if provided
  useEffect(() => {
    if (initialValue && initialValue.source && initialValue.target) {
      setSelectedLanguagePair(initialValue);
      // Only call callbacks if the values are different from current selection
      if (onLanguageChange && (initialValue.source !== selectedSource || initialValue.target !== selectedTarget)) {
        onLanguageChange(initialValue.source, initialValue.target);
      }
      if (onSelect) {
        onSelect(initialValue);
      }
    }
  }, [initialValue, onLanguageChange, onSelect, selectedSource, selectedTarget]);

  const handleSelect = (pair: { id: string; source: string; target: string }) => {
    setOpen(false);
    setSelectedLanguagePair(pair);
    
    if (onLanguageChange) {
      onLanguageChange(pair.source, pair.target);
    }
    
    if (onSelect) {
      onSelect(pair);
    }
  };

  // Find the current pair ID based on source and target
  const getCurrentPairId = () => {
    if (selectedLanguagePair) {
      return selectedLanguagePair.id;
    }
    
    if (selectedSource && selectedTarget) {
      const pair = languagePairs.find(
        p => p.source === selectedSource && p.target === selectedTarget
      );
      return pair ? pair.id : null;
    }
    
    return null;
  };

  const currentPairId = getCurrentPairId();
  
  // Determine what to display in the button
  const getDisplayText = () => {
    if (selectedLanguagePair) {
      return `${selectedLanguagePair.source} → ${selectedLanguagePair.target}`;
    }
    
    if (selectedSource && selectedTarget) {
      return `${selectedSource} → ${selectedTarget}`;
    }
    
    return "Select language pair...";
  };

  return (
    <div className={`language-selector ${className || ''}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between border-indigo-200 bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 h-12"
          >
            {getDisplayText()}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 border-indigo-200 shadow-md">
          <Command>
            <CommandInput placeholder="Search language pair..." className="border-b border-indigo-100" />
            <CommandList>
              <CommandEmpty>No language pair found.</CommandEmpty>
              <CommandGroup className="max-h-60 overflow-y-auto">
              {languagePairs.map((pair) => (
                <CommandItem
                  key={pair.id}
                  value={`${pair.source} ${pair.target}`}
                  onSelect={() => handleSelect(pair)}
                  className="hover:bg-indigo-50"
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${currentPairId === pair.id ? "opacity-100 text-indigo-600" : "opacity-0"}`}
                  />
                  {pair.source} → {pair.target}
                </CommandItem>
              ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default LanguageSelector;
