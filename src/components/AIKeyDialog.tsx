
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
import { setOpenAIKey } from "@/utils/aiService";

interface AIKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onKeySaved: () => void;
}

export function AIKeyDialog({ open, onOpenChange, onKeySaved }: AIKeyDialogProps) {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    setIsLoading(true);
    
    // Simple validation - check if it's a reasonable length and format
    if (apiKey.trim().length < 20 || !apiKey.startsWith("sk-")) {
      toast.error("This doesn't look like a valid OpenAI API key");
      setIsLoading(false);
      return;
    }

    try {
      setOpenAIKey(apiKey.trim());
      toast.success("API key saved successfully");
      setApiKey("");
      onKeySaved();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to save API key");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>OpenAI API Key</DialogTitle>
          <DialogDescription>
            Enter your OpenAI API key to use AI-powered features. Your key is stored
            locally on your device and never sent to our servers.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 py-4">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="apiKey" className="sr-only">
              OpenAI API Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              <KeyRound className="h-3 w-3 inline mr-1" />
              Your key will be stored securely in your browser's local storage.
            </p>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button
            variant="secondary"
            onClick={() => {
              setApiKey("");
              onOpenChange(false);
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveKey} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Key"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
