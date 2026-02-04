import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface AppHeaderProps {
  showSettings?: boolean;
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ showSettings = true, rightElement, leftElement }) => {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('app_theme') as 'dark' | 'light') || 'dark';
  });
  const modalRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);

  const userType = (() => {
    try { return sessionStorage.getItem('jobfair_user_type'); } catch { return null; }
  })();

  // Focus modal when opened and lock body scroll
  useEffect(() => {
    if (settingsOpen) {
      document.body.style.overflow = 'hidden';
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [settingsOpen]);

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
  }, []);

  const handleLogout = async () => {
    await api.logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('app_theme', newTheme);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(newTheme);
  };

  // Swipe down to close
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    if (diff > 0 && modalRef.current) {
      modalRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = () => {
    const diff = currentY.current - startY.current;
    if (diff > 100) {
      setSettingsOpen(false);
    }
    if (modalRef.current) {
      modalRef.current.style.transform = '';
    }
    startY.current = 0;
    currentY.current = 0;
  };

  return (
    <>
      <div className="shrink-0 pt-6 pb-4 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {leftElement}
          <h1 className="text-white font-bold text-lg">
            Adopte<span className="text-pink-500">UnStagiaire</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {rightElement}
          {showSettings && (
            <button
              onClick={() => setSettingsOpen(true)}
              className="h-11 w-11 flex items-center justify-center rounded-xl bg-white/10 text-slate-400 hover:text-white hover:bg-white/20 transition-all"
              title="Paramètres"
            >
              <span className="material-symbols-outlined text-xl">settings</span>
            </button>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {settingsOpen && createPortal(
        <div 
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSettingsOpen(false)}
        >
          <div 
            ref={modalRef}
            tabIndex={-1}
            className="w-full max-w-md bg-slate-900/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl p-6 pb-10 animate-slide-up outline-none transition-transform"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Handle bar - drag indicator */}
            <div className="w-12 h-1 bg-white/30 rounded-full mx-auto mb-2 cursor-grab"></div>
            <p className="text-center text-slate-500 text-[10px] mb-4">Glisser vers le bas pour fermer</p>
            
            <h3 className="text-lg font-bold text-white mb-6">Paramètres</h3>
            
            <div className="space-y-4">
              {/* Theme toggle */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-pink-400">
                    {theme === 'dark' ? 'dark_mode' : 'light_mode'}
                  </span>
                  <div>
                    <p className="text-white font-medium">Thème</p>
                    <p className="text-slate-400 text-xs">{theme === 'dark' ? 'Sombre' : 'Clair'}</p>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    theme === 'dark' ? 'bg-pink-500' : 'bg-slate-600'
                  }`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                    theme === 'dark' ? 'left-7' : 'left-1'
                  }`}></div>
                </button>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-pink-400">notifications</span>
                  <div>
                    <p className="text-white font-medium">Notifications</p>
                    <p className="text-slate-400 text-xs">Nouveaux matchs</p>
                  </div>
                </div>
                <button className="relative w-14 h-8 rounded-full bg-pink-500 transition-colors">
                  <div className="absolute top-1 left-7 w-6 h-6 bg-white rounded-full shadow"></div>
                </button>
              </div>

              {/* User type badge */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-pink-400">
                    {userType === 'company' ? 'business' : 'school'}
                  </span>
                  <div>
                    <p className="text-white font-medium">Type de compte</p>
                    <p className="text-slate-400 text-xs">{userType === 'company' ? 'Entreprise' : 'Étudiant'}</p>
                  </div>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-2xl text-red-400 font-medium transition-colors"
              >
                <span className="material-symbols-outlined">logout</span>
                Se déconnecter
              </button>
            </div>

            {/* App version */}
            <p className="text-center text-slate-500 text-xs mt-6">
              AdopteUnStagiaire v1.0 • Polytech Lyon
            </p>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};
