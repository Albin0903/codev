import React, { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { BackgroundBlobs } from './components/BackgroundBlobs';
// On importe TopNavigation à la place (ou en plus) de BottomNavigation
import { TopNavigation } from './components/TopNavigation';
import CompanyProfileScreen from './pages/CompanyProfileScreen';
import CompanyScheduleScreen from './pages/CompanyScheduleScreen';
import CompanySwipeScreen from './pages/CompanySwipeScreen';
import LoginScreen from './pages/LoginScreen';
import MatchScreen from './pages/MatchScreen';
import ProfileScreen from './pages/ProfileScreen';
import RegisterScreen from './pages/RegisterScreen';
import ScheduleScreen from './pages/ScheduleScreen';
import SwipeScreen from './pages/SwipeScreen';
import PriorityScreen from './pages/PriorityScreen';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = sessionStorage.getItem('jobfair_token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  
  const hideNav = ['/match', '/login', '/register'].includes(location.pathname);
  const showNav = !hideNav;

  return (
    /* 1. On retire le centrage forcé et la hauteur max pour un vrai look Web */
    <div className="min-h-screen w-full flex flex-col relative font-display bg-[#0f172a]">
      
      <BackgroundBlobs />
      
      {/* 2. Barre de navigation fixée en HAUT */}
      {showNav && <TopNavigation />}
      
      {/* 3. On ajoute un padding-top (pt-20) pour que le contenu ne soit pas caché sous la barre */}
      <main
        className={`flex-1 relative z-10 w-full flex flex-col ${showNav ? 'pt-20' : ''}`}
        style={{ background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 40%)' }}
      >
        <div className="flex-1 w-full">
          {children}
        </div>
      </main>

      {/* Portal Target for Modals - Passé en fixed z-[150] pour être au dessus de tout */}
      <div id="app-modal-container" className="fixed inset-0 z-[150] pointer-events-none"></div>

      {/* 4. On a supprimé toute la div "bottom-nav-wrapper" qui était ici */}
    </div>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme') || 'dark';
    document.documentElement.classList.add(savedTheme);
  }, []);

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/" element={<Navigate to="/profile" replace />} />

          {/* Routes protégées */}
          <Route path="/swipe" element={<ProtectedRoute><SwipeScreen /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute><ScheduleScreen /></ProtectedRoute>} />
          <Route path="/match" element={<ProtectedRoute><MatchScreen /></ProtectedRoute>} />
          <Route path="/company/profile" element={<ProtectedRoute><CompanyProfileScreen /></ProtectedRoute>} />
          <Route path="/company/swipe" element={<ProtectedRoute><CompanySwipeScreen /></ProtectedRoute>} />
          <Route path="/company/matches" element={<ProtectedRoute><CompanyScheduleScreen /></ProtectedRoute>} />
          <Route path="/priorities" element={<ProtectedRoute><PriorityScreen /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;