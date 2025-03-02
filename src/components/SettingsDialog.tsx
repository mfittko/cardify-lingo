
import { useState } from "react";
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

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const settings = loadSettings();
  const [elevenLabsKey, setElevenLabsKey] = useState(settings.elevenLabsKey || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveKey = () => {
    if (!elevenLabsKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    setIsLoading(true);
    
    try {
      // Update settings with the ElevenLabs API key
      const updatedSettings = {
        ...settings,
        elevenLabsKey: elevenLabsKey.trim()
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
        <div className="flex items-center space-x-2 py-4">
          <div className="grid flex-1 gap-2">
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
