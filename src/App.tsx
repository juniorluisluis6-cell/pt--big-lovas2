import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import PremiumUpgrade from './pages/PremiumUpgrade';
import Chat from './pages/Chat';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import FashionTools from './pages/FashionTools';
import Ranking from './pages/Ranking';
import LiveEvents from './pages/LiveEvents';
import Settings from './pages/Settings';
import ErrorBoundary from './components/ErrorBoundary';

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-premium-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Home /> : <Welcome />} />
      <Route path="/premium-upgrade" element={user ? <PremiumUpgrade /> : <Navigate to="/" />} />
      <Route path="/chat" element={user ? <Chat /> : <Navigate to="/" />} />
      <Route path="/admin" element={user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
      <Route path="/profile" element={user ? <Profile /> : <Navigate to="/" />} />
      <Route path="/profile/:id" element={user ? <Profile /> : <Navigate to="/" />} />
      <Route path="/tools" element={user ? <FashionTools /> : <Navigate to="/" />} />
      <Route path="/ranking" element={user ? <Ranking /> : <Navigate to="/" />} />
      <Route path="/live" element={user ? <LiveEvents /> : <Navigate to="/" />} />
      <Route path="/settings" element={user ? <Settings /> : <Navigate to="/" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
