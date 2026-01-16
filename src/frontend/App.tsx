import React, { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { BackgroundBlobs } from './components/BackgroundBlobs';
import { BottomNavigation } from './components/BottomNavigation';
import CompanyProfileScreen from './pages/CompanyProfileScreen';
import CompanyScheduleScreen from './pages/CompanyScheduleScreen';
import CompanySwipeScreen from './pages/CompanySwipeScreen';
import LoginScreen from './pages/LoginScreen';
import MatchScreen from './pages/MatchScreen';
import ProfileScreen from './pages/ProfileScreen';
import RegisterScreen from './pages/RegisterScreen';
import ScheduleScreen from './pages/ScheduleScreen';
import SwipeScreen from './pages/SwipeScreen';

// Composant pour protéger les routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = sessionStorage.getItem('jobfair_token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  
  // 2. AJOUT DE '/register' ICI POUR CACHER LE MENU
  const hideNav = ['/match', '/login', '/register'].includes(location.pathname);
  const showNav = !hideNav;

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#edf2f8' }}>
      <div
        className="relative flex flex-col h-[96vh] max-h-[900px] w-full max-w-[450px] overflow-hidden font-display shadow-2xl rounded-[40px] border-[8px]"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-color)',
        }}
      >
      {/* iPhone Notch / Dynamic Island */}
      <div className="absolute top-0 left-0 right-0 h-16 z-50 pointer-events-none">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgb(16,23,34), transparent)' }}></div>
            <div className="absolute top-0 left-0 right-0 flex justify-center pt-2">
              <div className="w-32 h-8 rounded-full flex items-center justify-end px-3 gap-2" style={{ backgroundColor: 'rgb(20,30,48)' }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}></div>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.35)' }}></div>
              </div>
            </div>
      </div>

      <BackgroundBlobs />
      
      <main
        className="flex-1 relative z-10 overflow-y-auto no-scrollbar w-full pt-12"
        style={{ background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 40%)' }}
      >
        {children}
      </main>

      {/* Portal Target for Modals */}
      <div id="app-modal-container" className="absolute inset-0 z-[60] pointer-events-none"></div>

      {showNav && (
        <div className="bottom-nav-wrapper">
            <div
              className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-40"
              style={{ background: 'linear-gradient(to top, var(--bg-primary), transparent)' }}
            />
            
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
  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme') || 'dark';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(savedTheme);
  }, []);

  return (
    <HashRouter>
      <Layout>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} /> {/* Route publique ajoutée proprement */}

          {/* Redirection racine */}
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
          <Route
            path="/company/profile"
            element={
              <ProtectedRoute>
                <CompanyProfileScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/swipe"
            element={
              <ProtectedRoute>
                <CompanySwipeScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/matches"
            element={
              <ProtectedRoute>
                <CompanyScheduleScreen />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;