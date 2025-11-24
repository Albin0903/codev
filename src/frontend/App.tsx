import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { BottomNavigation } from './components/BottomNavigation';
import { BackgroundBlobs } from './components/BackgroundBlobs';
import SwipeScreen from './pages/SwipeScreen';
import ProfileScreen from './pages/ProfileScreen';
import ScheduleScreen from './pages/ScheduleScreen';
import MatchScreen from './pages/MatchScreen';
import LoginScreen from './pages/LoginScreen';

// Composant pour protéger les routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('jobfair_token');
  
  if (!token) {
    // Redirection immédiate vers le login si pas de token
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  // Masquer la barre de navigation sur l'écran de Match et de Login
  const showNav = location.pathname !== '/match' && location.pathname !== '/login';

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-950">
      <div className="relative flex flex-col h-[96vh] max-h-[900px] w-full max-w-[450px] overflow-hidden bg-background-light dark:bg-background-dark font-display shadow-2xl rounded-[40px] border-[8px] border-[#1e293b]">
      {/* iPhone Notch / Dynamic Island */}
      <div className="absolute top-0 left-0 right-0 h-16 z-50 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-[#101722] via-[#101722]/80 to-transparent"></div>
          <div className="absolute top-0 left-0 right-0 flex justify-center pt-2">
              <div className="w-32 h-8 bg-black rounded-full flex items-center justify-end px-3 gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1e293b]/50"></div>
                  <div className="w-2 h-2 rounded-full bg-[#0f172a]/80"></div>
              </div>
          </div>
      </div>

      <BackgroundBlobs />
      
      <main className="flex-1 relative z-10 overflow-y-auto no-scrollbar w-full pt-12">
        {children}
      </main>

      {/* Portal Target for Modals (keeps them inside the phone frame) */}
      <div id="app-modal-container" className="absolute inset-0 z-[60] pointer-events-none"></div>

      {showNav && (
        <div className="bottom-nav-wrapper">
            {/* Gradient Blur Mask for Bottom Nav */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#101722] via-[#101722]/80 to-transparent pointer-events-none z-40" />
            
            <div className="absolute bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
                <div className="pointer-events-auto">
                    <BottomNavigation />
                </div>
            </div>
        </div>
      )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          {/* Route publique */}
          <Route path="/login" element={<LoginScreen />} />

          {/* Redirection de la racine vers /profile (qui est protégé) */}
          <Route path="/" element={<Navigate to="/profile" replace />} />

          {/* Routes protégées */}
          <Route 
            path="/swipe" 
            element={
              <ProtectedRoute>
                <SwipeScreen />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfileScreen />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/schedule" 
            element={
              <ProtectedRoute>
                <ScheduleScreen />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/match" 
            element={
              <ProtectedRoute>
                <MatchScreen />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;