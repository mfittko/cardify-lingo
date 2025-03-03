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
  selectedSource: string;
  selectedTarget: string;
  onLanguageChange: (source: string, target: string) => void;
  className?: string;
  initialValue?: { id: string; source: string; target: string } | null;
}

const LanguageSelector = ({ 
  selectedSource, 
  selectedTarget, 
  onLanguageChange, 
  className,
  initialValue
}: LanguageSelectorProps) => {
  const [open, setOpen] = useState(false);

  // Use initialValue if provided
  useEffect(() => {
    if (initialValue && initialValue.source && initialValue.target) {
      // Only call onLanguageChange if the values are different from current selection
      // This prevents the infinite update loop
      if (initialValue.source !== selectedSource || initialValue.target !== selectedTarget) {
        onLanguageChange(initialValue.source, initialValue.target);
      }
    }
  }, [initialValue, onLanguageChange, selectedSource, selectedTarget]);

  const handleSelect = (pair: { id: string; source: string; target: string }) => {
    setOpen(false);
    onLanguageChange(pair.source, pair.target);
  };

  // Find the current pair ID based on source and target
  const getCurrentPairId = () => {
    const pair = languagePairs.find(
      p => p.source === selectedSource && p.target === selectedTarget
    );
    return pair ? pair.id : null;
  };

  const currentPairId = getCurrentPairId();

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
            {selectedSource && selectedTarget
              ? `${selectedSource} → ${selectedTarget}`
              : "Select language pair..."}
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
