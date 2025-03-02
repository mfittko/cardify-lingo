import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Settings as SettingsIcon, BookOpen, Calendar, BarChart, Clock, Trash2, Edit, Search } from "lucide-react";
import { loadAllDecks, loadSettings, deleteDecks, getDueCardsCount, type Deck } from "@/utils/storage";
import { getDueCards } from "@/utils/spacedRepetition";
import { formatDistanceToNow } from "date-fns";
import { SettingsDialog } from "@/components/SettingsDialog";
import { Input } from "@/components/ui/input";

const Dashboard = () => {
  const navigate = useNavigate();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [streakCount, setStreakCount] = useState(0);
  const [totalStudied, setTotalStudied] = useState(0);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    setIsLoading(true);
    
    // Load decks
    const allDecks = loadAllDecks();
    
    // Sort decks by last studied date (most recent first)
    allDecks.sort((a, b) => {
      if (!a.lastStudied) return 1;
      if (!b.lastStudied) return -1;
      return b.lastStudied - a.lastStudied;
    });
    
    setDecks(allDecks);
    
    // Load user stats
    const settings = loadSettings();
    setStreakCount(settings.streak || 0);
    setTotalStudied(settings.totalCardsStudied || 0);
    
    setIsLoading(false);
  };

  const handleCreateDeck = () => {
    const settings = loadSettings();
    navigate("/create", { 
      state: { 
        selectedLanguagePair: settings.selectedLanguagePair 
      } 
    });
  };

  const handleEditDeck = (deckId: string) => {
    navigate(`/edit/${deckId}`);
  };

  const handleStudyDeck = (deckId: string) => {
    navigate(`/study/${deckId}`);
  };

  const handleViewStats = (deckId: string) => {
    navigate(`/stats/${deckId}`);
  };

  const handleDeleteDeck = (deckId: string) => {
    if (window.confirm("Are you sure you want to delete this deck? This action cannot be undone.")) {
      deleteDecks([deckId]);
      loadDashboardData();
    }
  };

  // Filter decks based on active tab and search query
  const filteredDecks = decks.filter(deck => {
    // First filter by tab
    if (activeTab === "all") {
      // Then filter by search query if present
      return searchQuery ? deck.title.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    }
    if (activeTab === "due") {
      const isDue = getDueCardsCount(deck.cards) > 0;
      // Then filter by search query if present
      return isDue && (searchQuery ? deck.title.toLowerCase().includes(searchQuery.toLowerCase()) : true);
    }
    return false;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowSettingsDialog(true)} variant="outline" size="icon">
            <SettingsIcon className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
          <Button onClick={handleCreateDeck}>
            <Plus className="mr-2 h-4 w-4" /> Create Deck
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">{streakCount} days</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cards Due Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">
                {decks.reduce((total, deck) => total + getDueCardsCount(deck.cards), 0)}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cards Studied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">{totalStudied}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search decks..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs 
        defaultValue="all" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-8"
      >
        <TabsList>
          <TabsTrigger value="all">All Decks</TabsTrigger>
          <TabsTrigger value="due">Due for Review</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          {filteredDecks.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground mb-4">You don't have any decks yet</p>
                <Button onClick={handleCreateDeck}>
                  <Plus className="mr-2 h-4 w-4" /> Create Your First Deck
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Cards</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Last Studied</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDecks.map(deck => {
                    const dueCount = getDueCardsCount(deck.cards);
                    return (
                      <TableRow key={deck.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{deck.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {deck.sourceLang} → {deck.targetLang}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{deck.cards.length}</TableCell>
                        <TableCell>
                          {dueCount > 0 ? (
                            <Badge variant="secondary">{dueCount}</Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {deck.lastStudied ? formatDistanceToNow(deck.lastStudied, { addSuffix: true }) : 'Never'}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleStudyDeck(deck.id)}
                              disabled={dueCount === 0}
                            >
                              <BookOpen className="h-4 w-4" />
                              <span className="sr-only">Study</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleEditDeck(deck.id)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleViewStats(deck.id)}
                            >
                              <BarChart className="h-4 w-4" />
                              <span className="sr-only">Stats</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleDeleteDeck(deck.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="due" className="mt-6">
          {filteredDecks.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">No decks due for review</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Cards</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Last Studied</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDecks.map(deck => {
                    const dueCount = getDueCardsCount(deck.cards);
                    return (
                      <TableRow key={deck.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{deck.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {deck.sourceLang} → {deck.targetLang}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{deck.cards.length}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{dueCount}</Badge>
                        </TableCell>
                        <TableCell>
                          {deck.lastStudied ? formatDistanceToNow(deck.lastStudied, { addSuffix: true }) : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStudyDeck(deck.id)}
                          >
                            <BookOpen className="mr-2 h-4 w-4" />
                            Study Now
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      <SettingsDialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog} />
    </div>
  );
};

export default Dashboard;
