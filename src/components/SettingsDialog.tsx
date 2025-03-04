import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { KeyRound, Trash2, Database, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import { Settings, loadSettings, saveSettings } from "@/utils/storage";
import { NotificationSettings } from './NotificationSettings';
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
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
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

export function SettingsDialog({ children, open, onOpenChange }: SettingsDialogProps) {
  const settings = loadSettings();
  const [openAIKey, setOpenAIKey] = useState(settings.openAIKey || '');
  const [elevenLabsKey, setElevenLabsKey] = useState(settings.elevenLabsKey || "");
  const [selectedVoiceId, setSelectedVoiceId] = useState(settings.elevenLabsVoiceId || "EXAVITQu4vr4xnSDxMaL");
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("api-keys");
  const [cacheStats, setCacheStats] = useState<{
    entryCount: number;
    totalSize: number;
    oldestEntry: number | null;
  }>({ entryCount: 0, totalSize: 0, oldestEntry: null });

  // Load cache stats when dialog opens
  useEffect(() => {
    if (open || internalOpen) {
      const stats = getAudioCacheStats();
      setCacheStats(stats);
    }
  }, [open, internalOpen]);

  const isControlled = open !== undefined && onOpenChange !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // Load settings when dialog opens
      const settings = loadSettings();
      setOpenAIKey(settings.openAIKey || '');
      setElevenLabsKey(settings.elevenLabsKey || '');
      setSelectedVoiceId(settings.elevenLabsVoiceId || 'EXAVITQu4vr4xnSDxMaL');
      
      // Load cache stats
      const stats = getAudioCacheStats();
      setCacheStats(stats);
    }
    
    if (isControlled) {
      onOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  const saveApiKeys = () => {
    setIsLoading(true);
    
    try {
      // Update settings with the API keys and voice ID
      const updatedSettings: Settings = {
        ...settings,
        openAIKey: openAIKey.trim(),
        elevenLabsKey: elevenLabsKey.trim(),
        elevenLabsVoiceId: selectedVoiceId
      };
      
      saveSettings(updatedSettings);
      toast.success("Settings saved successfully");
      
      if (isControlled) {
        onOpenChange(false);
      } else {
        setInternalOpen(false);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
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
    } finally {
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
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {children ? (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <SettingsIcon className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your API keys and application preferences
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="api-keys" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openai-key" className="flex items-center">
                  <KeyRound className="h-4 w-4 mr-2" />
                  OpenAI API Key
                </Label>
                <Input
                  id="openai-key"
                  type="password"
                  placeholder="sk-..."
                  value={openAIKey}
                  onChange={(e) => setOpenAIKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Required for AI-generated flashcards. Get your key at{" "}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    platform.openai.com
                  </a>
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="elevenlabs-key" className="flex items-center">
                  <KeyRound className="h-4 w-4 mr-2" />
                  ElevenLabs API Key
                </Label>
                <Input
                  id="elevenlabs-key"
                  type="password"
                  placeholder="..."
                  value={elevenLabsKey}
                  onChange={(e) => setElevenLabsKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Required for text-to-speech. Get your key at{" "}
                  <a
                    href="https://elevenlabs.io/app/api-key"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    elevenlabs.io
                  </a>
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="voice-id" className="flex items-center">
                  Voice
                </Label>
                <Select
                  value={selectedVoiceId}
                  onValueChange={setSelectedVoiceId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {VOICE_OPTIONS.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        {voice.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testVoice}
                    disabled={isTestingVoice || !elevenLabsKey}
                  >
                    {isTestingVoice ? "Testing..." : "Test Voice"}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="audio" className="space-y-4 mt-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="cache">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    Audio Cache
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Cached Items</p>
                        <p className="text-2xl font-bold">{cacheStats.entryCount}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Total Size</p>
                        <p className="text-2xl font-bold">{formatBytes(cacheStats.totalSize)}</p>
                      </div>
                    </div>
                    
                    {cacheStats.oldestEntry && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Oldest Item</p>
                        <p className="text-sm">{formatRelativeTime(cacheStats.oldestEntry)}</p>
                      </div>
                    )}
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={handleClearCache}
                      disabled={isClearingCache || cacheStats.entryCount === 0}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isClearingCache ? "Clearing..." : "Clear Cache"}
                    </Button>
                    
                    <p className="text-xs text-muted-foreground">
                      Clearing the cache will remove all saved audio files. You'll need to
                      regenerate them when studying.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-4">
            <NotificationSettings />
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button onClick={saveApiKeys} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
