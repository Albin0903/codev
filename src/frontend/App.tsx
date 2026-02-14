import React, { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { BackgroundBlobs } from './components/BackgroundBlobs';
import { BottomNavBar } from './components/BottomNavBar';
import { TopNavBar } from './components/TopNavBar';
import { BottomNavProvider } from './contexts/BottomNavContext';
import CompanyMatchesScreen from './pages/CompanyMatchesScreen';
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
import AdminScreen from './pages/AdminScreen';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = sessionStorage.getItem('jobfair_token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Scroll to top on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();

  const hideNav = ['/match', '/login', '/register'].includes(location.pathname);
  const showNav = !hideNav;

  return (
    <div className="min-h-screen w-full flex flex-col relative font-display bg-[#0f172a]">

      <BackgroundBlobs />
      <ScrollToTop />

      {/* Top Navigation - Desktop only */}
      {showNav && <TopNavBar />}

      {/* Main content - padding for nav bars */}
      <main
        className={`flex-1 relative z-10 w-full flex flex-col ${showNav ? 'pb-28 md:pb-0 md:pt-20' : ''}`}
        style={{ background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 40%)' }}
      >
        <div className="flex-1 w-full">
          {children}
        </div>
      </main>

      {/* Bottom Navigation Bar - Mobile only */}
      {showNav && <BottomNavBar />}

      {/* Portal Target for Modals */}
      <div id="app-modal-container" className="fixed inset-0 z-[150] pointer-events-none"></div>
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
      <BottomNavProvider>
        <Layout>
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/" element={<Navigate to="/swipe" replace />} />

            {/* Routes protégées */}
            <Route path="/swipe" element={<ProtectedRoute><SwipeScreen /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
            <Route path="/schedule" element={<ProtectedRoute><ScheduleScreen /></ProtectedRoute>} />
            <Route path="/match" element={<ProtectedRoute><MatchScreen /></ProtectedRoute>} />
            <Route path="/company/profile" element={<ProtectedRoute><CompanyProfileScreen /></ProtectedRoute>} />
            <Route path="/company/swipe" element={<ProtectedRoute><CompanySwipeScreen /></ProtectedRoute>} />
            <Route path="/company/schedule" element={<ProtectedRoute><CompanyScheduleScreen /></ProtectedRoute>} />
            <Route path="/company/matches" element={<ProtectedRoute><CompanyMatchesScreen /></ProtectedRoute>} />
            <Route path="/priorities" element={<ProtectedRoute><PriorityScreen /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminScreen /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </BottomNavProvider>
    </HashRouter>
  );
};

export default App;