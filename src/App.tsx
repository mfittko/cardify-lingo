
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import DeckCreation from './pages/DeckCreation';
import DeckEdit from './pages/DeckEdit';
import StudyMode from './pages/StudyMode';
import NotFound from './pages/NotFound';
import DeckStats from './pages/DeckStats';
import { initNotifications } from './utils/notifications';
import { Toaster } from './components/ui/toaster';

function App() {
  useEffect(() => {
    // Initialize notifications when app starts
    initNotifications().catch(console.error);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create" element={<DeckCreation />} />
        <Route path="/edit/:deckId" element={<DeckEdit />} />
        <Route path="/study/:deckId" element={<StudyMode />} />
        <Route path="/stats/:deckId" element={<DeckStats />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
