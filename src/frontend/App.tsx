import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { BottomNavigation } from './components/BottomNavigation';
import { BackgroundBlobs } from './components/BackgroundBlobs';
import SwipeScreen from './pages/SwipeScreen';
import ProfileScreen from './pages/ProfileScreen';
import CompanyProfileScreen from './pages/CompanyProfileScreen';
import CompanySwipeScreen from './pages/CompanySwipeScreen';
import CompanyScheduleScreen from './pages/CompanyScheduleScreen';
import ScheduleScreen from './pages/ScheduleScreen';
import MatchScreen from './pages/MatchScreen';
import LoginScreen from './pages/LoginScreen';
import PriorityScreen from './pages/PriorityScreen';

// Composant pour protéger les routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = sessionStorage.getItem('jobfair_token');
  
  if (!token) {
    // Redirection immédiate vers le login si pas de token
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  // Masquer la barre de navigation sur certains écrans
  const hideNav = ['/match', '/login'].includes(location.pathname);
  const showNav = !hideNav;

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#edf2f8' }}>
      <div
        className="min-h-screen w-full flex flex-col relative  max-h-[900px] overflow-hidden font-display shadow-2xl"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-color)',
        }}
      >
      {/* iPhone Notch / Dynamic Island */}
      {/* <div className="absolute top-0 left-0 right-0 h-16 z-50 pointer-events-none">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgb(16,23,34), transparent)' }}></div>
            <div className="absolute top-0 left-0 right-0 flex justify-center pt-2">
              <div className="w-32 h-8 rounded-full flex items-center justify-end px-3 gap-2" style={{ backgroundColor: 'rgb(20,30,48)' }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}></div>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.35)' }}></div>
              </div>
            </div>
      </div> */}

      <BackgroundBlobs />
      
      <main
        className="flex-1 relative z-10 overflow-y-auto no-scrollbar w-full pt-12 flex flex-col"
        style={{ background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 40%)' }}
      >
        <div className="flex-1 w-full">
          {children}
        </div>
      </main>

      {/* Portal Target for Modals (keeps them inside the phone frame) */}
      <div id="app-modal-container" className="absolute inset-0 z-[60] pointer-events-none"></div>

      {showNav && (
        <div className="bottom-nav-wrapper">
            {/* Gradient Blur Mask for Bottom Nav */}
            <div
              className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-40"
              style={{ background: 'linear-gradient(to top, var(--bg-primary), transparent)' }}
            />
            
            <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
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
  // Initialize theme from localStorage or default to dark
  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme') || 'dark';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(savedTheme);
  }, []);

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
          <Route
            path="/priorities"
            element={
              <ProtectedRoute>
                <PriorityScreen />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;