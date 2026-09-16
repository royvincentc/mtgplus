import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { TopNavigation } from './components/TopNavigation';

// Page placeholders
import { WelcomePage } from './pages/WelcomePage';
import { DashboardPage } from './pages/DashboardPage';
import { RoomsPage } from './pages/RoomsPage';
import { DecksPage } from './pages/DecksPage';
import { DeckEditorPage } from './pages/DeckEditorPage';
import { ProfilePage } from './pages/ProfilePage';
import { CardsPage } from './pages/CardsPage';
import { CommunityPage } from './pages/CommunityPage';
import { AssistantPage } from './pages/AssistantPage';
import { PlayRoom } from './pages/PlayRoom';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-[#121212] text-[#b8860b]">Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

export const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-screen w-screen bg-[#121212] overflow-hidden text-white">
      {/* Show Top Nav on all pages except the actual game room (so it doesn't waste space) */}
      <Routes>
        <Route path="/play/:roomId" element={null} />
        <Route path="*" element={<TopNavigation />} />
      </Routes>

      <div className="flex-1 relative overflow-auto">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <WelcomePage />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/rooms" element={<ProtectedRoute><RoomsPage /></ProtectedRoute>} />
          <Route path="/decks" element={<ProtectedRoute><DecksPage /></ProtectedRoute>} />
          <Route path="/decks/:deckId" element={<ProtectedRoute><DeckEditorPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/cards" element={<ProtectedRoute><CardsPage /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
          <Route path="/assistant" element={<ProtectedRoute><AssistantPage /></ProtectedRoute>} />
          
          {/* The actual Game Board */}
          <Route path="/play/:roomId" element={<ProtectedRoute><PlayRoom /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};
