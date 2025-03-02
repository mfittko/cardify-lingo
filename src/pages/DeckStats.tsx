import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, BookOpen, Brain, Clock, Award, Calendar } from "lucide-react";
import { toast } from "sonner";
import { loadDeck } from "@/utils/storage";
import { getStudyStats } from "@/utils/spacedRepetition";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

const DeckStats = () => {
  const navigate = useNavigate();
  const { deckId } = useParams<{ deckId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [deckTitle, setDeckTitle] = useState("");
  const [stats, setStats] = useState<{
    dueCount: number;
    newCount: number;
    learningCount: number;
    masteredCount: number;
    totalCount: number;
    next7Days: number[];
  } | null>(null);

  useEffect(() => {
    if (!deckId) {
      toast.error("No deck ID provided");
      navigate("/dashboard");
      return;
    }

    const deck = loadDeck(deckId);
    if (!deck) {
      toast.error("Deck not found");
      navigate("/dashboard");
      return;
    }

    setDeckTitle(deck.title);
    setStats(getStudyStats(deck.cards));
    setIsLoading(false);
  }, [deckId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container max-w-4xl px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Error loading statistics</h2>
          <p className="text-muted-foreground mt-2">Unable to load deck statistics</p>
          <Button asChild className="mt-4">
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Calculate mastery percentage
  const masteryPercentage = stats.totalCount > 0 
    ? Math.round((stats.masteredCount / stats.totalCount) * 100) 
    : 0;

  // Get day names for the next 7 days
  const getDayNames = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    return Array(7).fill(0).map((_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i + 1);
      return days[date.getDay()];
    });
  };

  const dayNames = getDayNames();

  return (
    <div className="container max-w-4xl px-4 py-8">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-6" 
        onClick={() => navigate("/dashboard")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{deckTitle} - Statistics</h1>
        <Button asChild>
          <Link to={`/study/${deckId}`}>Study Now</Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Card Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mastery Progress</span>
                    <span className="font-medium">{masteryPercentage}%</span>
                  </div>
                  <Progress value={masteryPercentage} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <div className="mr-3 h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">New</p>
                      <p className="text-lg font-semibold">{stats.newCount}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="mr-3 h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Learning</p>
                      <p className="text-lg font-semibold">{stats.learningCount}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="mr-3 h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
                      <Award className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Mastered</p>
                      <p className="text-lg font-semibold">{stats.masteredCount}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="mr-3 h-9 w-9 rounded-full bg-red-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Due Now</p>
                      <p className="text-lg font-semibold">{stats.dueCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Upcoming Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Next 7 days</span>
                  </div>
                  <span className="text-sm font-medium">
                    {stats.next7Days.reduce((a, b) => a + b, 0)} cards
                  </span>
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {stats.next7Days.map((count, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="text-xs text-muted-foreground mb-1">{dayNames[i]}</div>
                      <div 
                        className="w-full bg-muted rounded-sm" 
                        style={{ 
                          height: `${Math.max(4, Math.min(60, count * 6))}px`,
                          minHeight: '4px'
                        }}
                      >
                        <div 
                          className="h-full bg-primary rounded-sm" 
                          style={{ 
                            width: '100%',
                            opacity: count > 0 ? 1 : 0.2
                          }}
                        />
                      </div>
                      <div className="text-xs font-medium mt-1">{count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Deck Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Cards</p>
                <p className="text-2xl font-bold">{stats.totalCount}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Mastery Rate</p>
                <p className="text-2xl font-bold">{masteryPercentage}%</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Cards to Review</p>
                <p className="text-2xl font-bold">{stats.dueCount}</p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between">
              <Button asChild variant="outline">
                <Link to={`/edit/${deckId}`}>Edit Deck</Link>
              </Button>
              
              <Button asChild>
                <Link to={`/study/${deckId}`}>Study Now</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DeckStats; 