import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plus, 
  Search, 
  Flame, 
  Bookmark,
  Check,
  ArrowRight
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  loadDecks,
  deleteDeck,
  updateStreak,
  loadSettings,
} from "@/utils/storage";
import { getStudyStats } from "@/utils/spacedRepetition";
import { format } from 'date-fns';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [decks, setDecks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [streak, setStreak] = useState(0);
  const [settings, setSettings] = useState(loadSettings());

  useEffect(() => {
    const loadedDecks = loadDecks();
    setDecks(loadedDecks);
  }, []);

  useEffect(() => {
    const currentStreak = updateStreak();
    setStreak(currentStreak);
    setSettings(loadSettings());
  }, []);

  const handleDeleteDeck = (deckId: string) => {
    deleteDeck(deckId);
    setDecks(decks.filter((deck) => deck.id !== deckId));
    toast({
      title: "Deck deleted",
      description: "The deck has been successfully deleted.",
    });
  };

  const filteredDecks = decks.filter((deck) =>
    deck.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container max-w-5xl px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Review your decks and track your progress.
          </p>
        </div>
        <Button onClick={() => navigate("/create")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Deck
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Flame className="h-4 w-4 mr-2 text-orange-500" />
              <div>
                <h2 className="text-lg font-semibold">Current Streak</h2>
                <p className="text-3xl font-bold">{streak} days</p>
              </div>
            </div>
            <div className="flex items-center">
              <Bookmark className="h-4 w-4 mr-2 text-blue-500" />
              <div>
                <h2 className="text-lg font-semibold">Total Cards Studied</h2>
                <p className="text-3xl font-bold">{settings.totalCardsStudied}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4">
        <Input
          type="search"
          placeholder="Search decks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredDecks.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableCaption>A list of your decks.</TableCaption>
            <TableHead>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="text-right">Cards</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Last Studied</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDecks.map((deck) => {
                const stats = getStudyStats(deck.cards);
                const lastStudiedDate = deck.lastStudied ? new Date(deck.lastStudied) : null;

                return (
                  <TableRow key={deck.id}>
                    <TableCell className="font-medium">{deck.title}</TableCell>
                    <TableCell className="text-right">{stats.totalCount}</TableCell>
                    <TableCell>
                      {stats.dueCount > 0 && (
                        <Badge variant="destructive">
                          {stats.dueCount} Due
                        </Badge>
                      )}
                      {stats.newCount > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {stats.newCount} New
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {lastStudiedDate ? format(lastStudiedDate, 'MMM dd, yyyy') : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/edit/${deck.id}`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => navigate(`/study/${deck.id}`)}
                      >
                        Study <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteDeck(deck.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
            <Search className="h-10 w-10 text-muted-foreground" />
            <h2 className="text-xl font-medium">No decks found</h2>
            <p className="text-muted-foreground">
              Create a new deck to start learning.
            </p>
            <Button onClick={() => navigate("/create")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Deck
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
