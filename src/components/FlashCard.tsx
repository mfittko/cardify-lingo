import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Volume } from "lucide-react";
import { toast } from "sonner";
import { loadSettings } from "@/utils/storage";
import { generateCacheKey, getCachedAudio, cacheAudio } from "@/utils/audioCache";

interface FlashCardProps {
  front: string;
  back: string;
  image?: string;
  audio?: string;
  language: string;
  onResult: (difficulty: "easy" | "medium" | "hard") => void;
  showButtons?: boolean;
}

const FlashCard = ({
  front,
  back,
  image,
  audio,
  language,
  onResult,
  showButtons = true,
}: FlashCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasBeenFlipped, setHasBeenFlipped] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Skip animation on initial render
    if (isInitialRender) {
      setIsInitialRender(false);
    }
    
    // Reset flip state when card changes
    setIsFlipped(false);
    setHasBeenFlipped(false);
  }, [front, back, isInitialRender]);

  const playAudio = async () => {
    if (audio && audioRef.current) {
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
      });
    } else {
      // Use ElevenLabs for text-to-speech
      const settings = loadSettings();
      const elevenLabsKey = settings.elevenLabsKey;
      const voiceId = settings.elevenLabsVoiceId || "EXAVITQu4vr4xnSDxMaL"; // Use default if not set
      
      if (!elevenLabsKey) {
        toast.error("Please add your ElevenLabs API key in settings");
        return;
      }
      
      setIsSpeaking(true);
      
      // Text to be spoken
      const textToSpeak = isFlipped ? back : front;
      
      // Generate a cache key for this audio
      const cacheKey = generateCacheKey(
        textToSpeak,
        voiceId,
        "eleven_multilingual_v2",
        language
      );
      
      // Check if we have this audio in cache
      const cachedBlob = getCachedAudio(cacheKey);
      
      if (cachedBlob) {
        // Use cached audio
        const url = URL.createObjectURL(cachedBlob);
        const audio = new Audio(url);
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
        };
        audio.play();
        return;
      }
      
      // Not in cache, fetch from ElevenLabs API
      try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": elevenLabsKey
          },
          body: JSON.stringify({
            text: textToSpeak,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
            },
            pronunciation_dictionary_locators: [],
            text_language: language
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
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
        };
        audio.play();
      } catch (error) {
        console.error("Error generating speech:", error);
        toast.error("Failed to generate speech. Please check your API key.");
        setIsSpeaking(false);
      }
    }
  };

  const handleFlip = () => {
    if (!isFlipped && !hasBeenFlipped) {
      setHasBeenFlipped(true);
    }
    setIsFlipped(!isFlipped);
  };

  const handleDifficultySelect = (difficulty: "easy" | "medium" | "hard") => {
    onResult(difficulty);
  };

  return (
    <div className="w-full max-w-md mx-auto perspective">
      <div
        className={cn(
          "relative w-full h-64 cursor-pointer preserve-3d transition-flip",
          isFlipped ? "rotateY-180" : "",
          isInitialRender ? "" : "animate-scale-in"
        )}
        onClick={handleFlip}
      >
        {/* Front of card */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center p-6 rounded-xl bg-card border border-border shadow-sm backface-hidden",
            isFlipped ? "opacity-0" : "opacity-100"
          )}
        >
          {image && (
            <div className="w-full max-h-24 overflow-hidden mb-4">
              <img 
                src={image} 
                alt="" 
                className="w-full h-full object-contain" 
                loading="lazy"
              />
            </div>
          )}
          <h3 className="text-2xl font-medium text-center">{front}</h3>
          <div className="text-xs text-muted-foreground mt-1">{language}</div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-2 right-2"
            onClick={(e) => {
              e.stopPropagation();
              playAudio();
            }}
            disabled={isSpeaking}
          >
            <Volume className={cn("h-5 w-5", isSpeaking ? "text-primary animate-pulse" : "")} />
            <span className="sr-only">Listen to pronunciation</span>
          </Button>
        </div>

        {/* Back of card */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center p-6 rounded-xl bg-card border border-border shadow-sm backface-hidden rotateY-180",
            isFlipped ? "opacity-100" : "opacity-0"
          )}
        >
          <h3 className="text-2xl font-medium text-center mb-6">{back}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-2 right-2"
            onClick={(e) => {
              e.stopPropagation();
              playAudio();
            }}
            disabled={isSpeaking}
          >
            <Volume className={cn("h-5 w-5", isSpeaking ? "text-primary animate-pulse" : "")} />
            <span className="sr-only">Listen to pronunciation</span>
          </Button>
          {showButtons && hasBeenFlipped && (
            <div className="flex items-center justify-center gap-3 mt-auto">
              <Button
                variant="outline"
                className="border-[hsl(var(--hard))] text-[hsl(var(--hard))] hover:bg-[hsl(var(--hard)/0.1)]"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDifficultySelect("hard");
                }}
              >
                Hard
              </Button>
              <Button
                variant="outline"
                className="border-[hsl(var(--medium))] text-[hsl(var(--medium))] hover:bg-[hsl(var(--medium)/0.1)]"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDifficultySelect("medium");
                }}
              >
                Medium
              </Button>
              <Button
                variant="outline"
                className="border-[hsl(var(--easy))] text-[hsl(var(--easy))] hover:bg-[hsl(var(--easy)/0.1)]"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDifficultySelect("easy");
                }}
              >
                Easy
              </Button>
            </div>
          )}
        </div>
      </div>
      {audio && (
        <audio ref={audioRef} src={audio} preload="none" />
      )}
    </div>
  );
};

export default FlashCard;
