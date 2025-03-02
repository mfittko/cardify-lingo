
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, BarChart, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface DeckCardProps {
  id: string;
  title: string;
  description: string;
  cardCount: number;
  dueCount: number;
  lastStudied?: string;
  sourceLang: string;
  targetLang: string;
  className?: string;
}

const DeckCard = ({
  id,
  title,
  description,
  cardCount,
  dueCount,
  lastStudied,
  sourceLang,
  targetLang,
  className,
}: DeckCardProps) => {
  return (
    <Card className={cn("w-full overflow-hidden transition-all duration-300 hover:shadow-md", className)}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <div className="py-1 px-2 rounded-full bg-primary/10 text-primary text-xs">
            {sourceLang} → {targetLang}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <Book className="mr-1 h-4 w-4 text-muted-foreground" />
            <span>{cardCount} cards</span>
          </div>
          {dueCount > 0 && (
            <div className="flex items-center">
              <div className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                {dueCount} due
              </div>
            </div>
          )}
          {lastStudied && (
            <div className="text-muted-foreground text-xs">
              Last studied: {lastStudied}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex gap-2">
        <Button asChild variant="default" className="w-full">
          <Link to={`/study/${id}`}>Study</Link>
        </Button>
        <Button asChild variant="outline" size="icon">
          <Link to={`/stats/${id}`}>
            <BarChart className="h-4 w-4" />
            <span className="sr-only">View statistics</span>
          </Link>
        </Button>
        <Button asChild variant="outline" size="icon">
          <Link to={`/edit/${id}`}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit deck</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DeckCard;
