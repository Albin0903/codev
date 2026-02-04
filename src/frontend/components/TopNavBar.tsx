import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { api } from '../services/api';

export const TopNavBar: React.FC = () => {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('app_theme') as 'dark' | 'light') || 'dark';
  });
  const modalRef = useRef<HTMLDivElement>(null);
  
  const userType = (() => {
    try { return sessionStorage.getItem('jobfair_user_type'); } catch { return null; }
  })();

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

  // Lock body scroll when modal open
  useEffect(() => {
    if (settingsOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [settingsOpen]);

  const navItems = userType === 'company'
    ? [
        { path: '/company/swipe', icon: 'swipe', label: 'Découvrir' },
        { path: '/company/schedule', icon: 'calendar_month', label: 'Planning' },
        { path: '/company/profile', icon: 'business_center', label: 'Mon Profil' },
      ]
    : [
        { path: '/swipe', icon: 'swipe', label: 'Découvrir' },
        { path: '/schedule', icon: 'calendar_month', label: 'Planning' },
        { path: '/profile', icon: 'person', label: 'Mon Profil' },
      ];

  return (
    <>
      <nav className="top-nav-bar hidden md:block fixed top-0 left-0 right-0 h-20 bg-[#0f172a]/80 backdrop-blur-2xl border-b border-white/10 z-[100] px-8">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">

          {/* Logo */}
          <div
            className="flex items-center gap-4 cursor-pointer group shrink-0"
            onClick={() => navigate(userType === 'company' ? '/company/swipe' : '/swipe')}
          >
            <div className="h-12 w-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-2xl italic">A</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight hidden lg:block">
              Adopte<span className="text-pink-500">UnStagiaire</span>
            </span>
          </div>

          {/* Navigation centrale */}
          <div className="flex items-center gap-1 bg-white/5 rounded-2xl p-1.5 border border-white/5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-5 py-2.5 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <span className="material-symbols-outlined text-xl">
                  {item.icon}
                </span>
                <span className="text-sm font-semibold">
                  {item.label}
                </span>
              </NavLink>
            ))}
          </div>

          {/* Actions droite */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden xl:block text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
              {userType === 'company' ? 'Recruteur' : 'Étudiant'}
            </span>

            {/* Bouton paramètres */}
            <button
              onClick={() => setSettingsOpen(true)}
              className="h-11 w-11 flex items-center justify-center rounded-xl bg-white/10 text-slate-400 hover:text-white hover:bg-white/20 transition-all"
              title="Paramètres"
            >
              <span className="material-symbols-outlined text-xl">settings</span>
            </button>

            {/* Bouton déconnexion */}
            <button
              onClick={handleLogout}
              className="h-11 w-11 flex items-center justify-center rounded-xl bg-white/10 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all"
              title="Déconnexion"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Settings Modal */}
      {settingsOpen && createPortal(
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSettingsOpen(false)}
        >
          <div 
            ref={modalRef}
            className="w-full max-w-md bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-8 animate-modal-in outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Paramètres</h3>
              <button 
                onClick={() => setSettingsOpen(false)}
                className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
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
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-modal-in {
          animation: modal-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
};
