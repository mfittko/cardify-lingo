import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { KeyRound, Trash2, Database } from "lucide-react";
import { toast } from "sonner";
import { loadSettings, saveSettings } from "@/utils/storage";
import { 
  clearAudioCache, 
  getAudioCacheStats, 
  generateCacheKey, 
  getCachedAudio, 
  cacheAudio 
} from "@/utils/audioCache";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ElevenLabs voice options
const VOICE_OPTIONS = [
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella (Female)" },
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel (Female)" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi (Female)" },
  { id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli (Female)" },
  { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh (Male)" },
  { id: "VR6AewLTigWG4xSOukaG", name: "Arnold (Male)" },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam (Male)" },
  { id: "yoZ06aMxZJJ28mfd3POQ", name: "Sam (Male)" },
];

// Format bytes to human-readable size
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Format timestamp to relative time
const formatRelativeTime = (timestamp: number | null) => {
  if (!timestamp) return 'N/A';
  
  const now = Date.now();
  const diff = now - timestamp;
  
  // Convert to appropriate units
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
};

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const settings = loadSettings();
  const [elevenLabsKey, setElevenLabsKey] = useState(settings.elevenLabsKey || "");
  const [selectedVoiceId, setSelectedVoiceId] = useState(settings.elevenLabsVoiceId || "EXAVITQu4vr4xnSDxMaL");
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [cacheStats, setCacheStats] = useState<{
    entryCount: number;
    totalSize: number;
    oldestEntry: number | null;
  }>({ entryCount: 0, totalSize: 0, oldestEntry: null });

  // Load cache stats when dialog opens
  useEffect(() => {
    if (open) {
      const stats = getAudioCacheStats();
      setCacheStats(stats);
    }
  }, [open]);

  const handleSaveKey = () => {
    if (!elevenLabsKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    setIsLoading(true);
    
    try {
      // Update settings with the ElevenLabs API key and voice ID
      const updatedSettings = {
        ...settings,
        elevenLabsKey: elevenLabsKey.trim(),
        elevenLabsVoiceId: selectedVoiceId
      };
      
      saveSettings(updatedSettings);
      toast.success("Settings saved successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to save settings");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const testVoice = async () => {
    if (!elevenLabsKey.trim()) {
      toast.error("Please enter an API key first");
      return;
    }

    setIsTestingVoice(true);
    
    // Sample text for testing
    const testText = "This is a test of the ElevenLabs voice.";
    
    // Generate a cache key for this test audio
    const cacheKey = generateCacheKey(
      testText,
      selectedVoiceId,
      "eleven_multilingual_v2",
      "en" // Default to English for test
    );
    
    // Check if we have this audio in cache
    const cachedBlob = getCachedAudio(cacheKey);
    
    if (cachedBlob) {
      // Use cached audio
      const url = URL.createObjectURL(cachedBlob);
      const audio = new Audio(url);
      audio.onended = () => {
        setIsTestingVoice(false);
        URL.revokeObjectURL(url);
      };
      audio.play();
      return;
    }
    
    // Not in cache, fetch from ElevenLabs API
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": elevenLabsKey
        },
        body: JSON.stringify({
          text: testText,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate speech");
      }
      
      const blob = await response.blob();
      
      // Cache the audio for future use
      await cacheAudio(cacheKey, blob);
      
      // Play the audio
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => {
        setIsTestingVoice(false);
        URL.revokeObjectURL(url);
      };
      audio.play();
      
      // Update cache stats after adding new item
      setCacheStats(getAudioCacheStats());
    } catch (error) {
      console.error("Error testing voice:", error);
      toast.error("Failed to test voice. Please check your API key.");
      setIsTestingVoice(false);
    }
  };

  const handleClearCache = () => {
    setIsClearingCache(true);
    
    try {
      clearAudioCache();
      setCacheStats({ entryCount: 0, totalSize: 0, oldestEntry: null });
      toast.success("Audio cache cleared successfully");
    } catch (error) {
      console.error("Error clearing cache:", error);
      toast.error("Failed to clear audio cache");
    } finally {
      setIsClearingCache(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Application Settings</DialogTitle>
          <DialogDescription>
            Configure your application settings here. Your API keys are stored
            locally on your device and never sent to our servers.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="elevenLabsKey">ElevenLabs API Key</Label>
            <Input
              id="elevenLabsKey"
              type="password"
              placeholder="Enter your ElevenLabs API key"
              value={elevenLabsKey}
              onChange={(e) => setElevenLabsKey(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              <KeyRound className="h-3 w-3 inline mr-1" />
              Get your API key from <a href="https://elevenlabs.io/app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ElevenLabs</a>
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="voiceSelect">Voice</Label>
            <div className="flex gap-2">
              <Select 
                value={selectedVoiceId} 
                onValueChange={setSelectedVoiceId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {VOICE_OPTIONS.map(voice => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={testVoice} 
                disabled={isTestingVoice || !elevenLabsKey}
                className={isTestingVoice ? "animate-pulse" : ""}
              >
                {isTestingVoice ? "Playing..." : "Test"}
              </Button>
            </div>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="cache">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Audio Cache Management
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Cached items:</div>
                    <div>{cacheStats.entryCount}</div>
                    
                    <div className="text-muted-foreground">Total size:</div>
                    <div>{formatBytes(cacheStats.totalSize)}</div>
                    
                    <div className="text-muted-foreground">Oldest item:</div>
                    <div>{formatRelativeTime(cacheStats.oldestEntry)}</div>
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={handleClearCache}
                    disabled={isClearingCache || cacheStats.entryCount === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isClearingCache ? "Clearing..." : "Clear Audio Cache"}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground">
                    Clearing the cache will remove all stored audio files. You'll need to regenerate them when needed.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveKey} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
