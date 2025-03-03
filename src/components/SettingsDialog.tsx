
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, loadSettings, saveSettings } from '@/utils/storage';
import { Settings as SettingsIcon } from 'lucide-react';
import { NotificationSettings } from './NotificationSettings';

interface SettingsDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SettingsDialog({ children, open, onOpenChange }: SettingsDialogProps) {
  const [openAIKey, setOpenAIKey] = useState('');
  const [elevenLabsKey, setElevenLabsKey] = useState('');
  const [elevenLabsVoiceId, setElevenLabsVoiceId] = useState('');
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = open !== undefined && onOpenChange !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // Load settings when dialog opens
      const settings = loadSettings();
      setOpenAIKey(settings.openAIKey || '');
      setElevenLabsKey(settings.elevenLabsKey || '');
      setElevenLabsVoiceId(settings.elevenLabsVoiceId || '');
    }
    
    if (isControlled) {
      onOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  const saveApiKeys = () => {
    const settings = loadSettings();
    const updatedSettings: Settings = {
      ...settings,
      openAIKey,
      elevenLabsKey,
      elevenLabsVoiceId,
    };
    saveSettings(updatedSettings);
    if (isControlled) {
      onOpenChange(false);
    } else {
      setInternalOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="icon">
            <SettingsIcon className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your application settings and API keys.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="api-keys" className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="api-keys" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="openai-key">OpenAI API Key</Label>
                <Input
                  id="openai-key"
                  type="password"
                  placeholder="sk-..."
                  value={openAIKey}
                  onChange={(e) => setOpenAIKey(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Used for AI-assisted card generation
                </p>
              </div>
              <div className="grid w-full gap-1.5">
                <Label htmlFor="elevenlabs-key">ElevenLabs API Key</Label>
                <Input
                  id="elevenlabs-key"
                  type="password"
                  placeholder="Enter your ElevenLabs API key"
                  value={elevenLabsKey}
                  onChange={(e) => setElevenLabsKey(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Used for text-to-speech pronunciation
                </p>
              </div>
              <div className="grid w-full gap-1.5">
                <Label htmlFor="elevenlabs-voice">ElevenLabs Voice ID</Label>
                <Input
                  id="elevenlabs-voice"
                  placeholder="Enter a voice ID (optional)"
                  value={elevenLabsVoiceId}
                  onChange={(e) => setElevenLabsVoiceId(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Optional: Specify a particular voice to use
                </p>
              </div>
              <Button onClick={saveApiKeys} className="w-full">
                Save API Keys
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="notifications" className="py-4">
            <NotificationSettings />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
