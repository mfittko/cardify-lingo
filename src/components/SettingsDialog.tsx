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
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { loadSettings, saveSettings } from "@/utils/storage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const settings = loadSettings();
  const [elevenLabsKey, setElevenLabsKey] = useState(settings.elevenLabsKey || "");
  const [selectedVoiceId, setSelectedVoiceId] = useState(settings.elevenLabsVoiceId || "EXAVITQu4vr4xnSDxMaL");
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

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

  const testVoice = () => {
    if (!elevenLabsKey.trim()) {
      toast.error("Please enter an API key first");
      return;
    }

    setIsTestingVoice(true);
    
    // Test the selected voice with a sample text
    fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": elevenLabsKey
      },
      body: JSON.stringify({
        text: "This is a test of the ElevenLabs voice.",
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to generate speech");
      }
      return response.blob();
    })
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => {
        setIsTestingVoice(false);
        URL.revokeObjectURL(url);
      };
      audio.play();
    })
    .catch(error => {
      console.error("Error testing voice:", error);
      toast.error("Failed to test voice. Please check your API key.");
      setIsTestingVoice(false);
    });
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
