import { useState } from "react";
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
  onSelect: (languagePair: { id: string; source: string; target: string }) => void;
  className?: string;
}

const LanguageSelector = ({ onSelect, className }: LanguageSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [selectedLanguagePair, setSelectedLanguagePair] = useState<{
    id: string;
    source: string;
    target: string;
  } | null>(null);

  const handleSelect = (pair: { id: string; source: string; target: string }) => {
    setSelectedLanguagePair(pair);
    setOpen(false);
    onSelect(pair);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between ${className}`}
        >
          {selectedLanguagePair
            ? `${selectedLanguagePair.source} → ${selectedLanguagePair.target}`
            : "Select language pair..."}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search language pair..." />
          <CommandList>
            <CommandEmpty>No language pair found.</CommandEmpty>
            <CommandGroup className="max-h-60 overflow-y-auto">
            {languagePairs.map((pair) => (
              <CommandItem
                key={pair.id}
                value={`${pair.source} ${pair.target}`}
                onSelect={() => handleSelect(pair)}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${selectedLanguagePair?.id === pair.id ? "opacity-100" : "opacity-0"}`}
                />
                {pair.source} → {pair.target}
              </CommandItem>
            ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default LanguageSelector;
