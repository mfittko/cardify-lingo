
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Volume } from "lucide-react";

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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Skip animation on initial render
    if (isInitialRender) {
      setIsInitialRender(false);
    }
    
    // Reset flip state when card changes
    setIsFlipped(false);
    setHasBeenFlipped(false);
  }, [front, back]);

  const playAudio = () => {
    if (audio && audioRef.current) {
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
      });
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
          {audio && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-2 right-2"
              onClick={(e) => {
                e.stopPropagation();
                playAudio();
              }}
            >
              <Volume className="h-5 w-5" />
              <span className="sr-only">Play pronunciation</span>
            </Button>
          )}
        </div>

        {/* Back of card */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center p-6 rounded-xl bg-card border border-border shadow-sm backface-hidden rotateY-180",
            isFlipped ? "opacity-100" : "opacity-0"
          )}
        >
          <h3 className="text-2xl font-medium text-center mb-6">{back}</h3>
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
