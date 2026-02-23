import React, { useMemo, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { api } from '../services/api'; // On importe l'api pour le logout

export const TopNavigation: React.FC = () => {
  const navigate = useNavigate();

const [swipesEnabled, setSwipesEnabled] = useState(true);

useEffect(() => {
  const checkStatus = async () => {
    try {
      const data = await api.getSystemStatus(); 
      setSwipesEnabled(data.swipes_enabled);
    } catch (error) {
      console.error("Erreur statut :", error);
    }
  };
  checkStatus();
  // Optionnel : vérifier toutes les minutes pour un changement en direct
  const interval = setInterval(checkStatus, 60000);
  return () => clearInterval(interval);
}, []);
  
  const userType = useMemo(() => {
    try { return sessionStorage.getItem('jobfair_user_type'); } catch { return null; }
  }, []);

  const handleLogout = async () => {
    await api.logout();
    navigate('/login');
  };

  const navItems = userType === 'company'
    ? [
        { path: '/company/swipe', icon: 'swipe', label: 'Découvrir', disabled: !swipesEnabled },
        { path: '/company/matches', icon: 'calendar_month', label: 'Planning', hasNotification: true },
        { path: '/company/profile', icon: 'business_center', label: 'Mon Profil' },
      ]
    : [
        { path: '/swipe', icon: 'swipe', label: 'Découvrir', disabled: !swipesEnabled },
        { path: '/schedule', icon: 'calendar_month', label: 'Planning', hasNotification: true },
        { path: '/profile', icon: 'person', label: 'Mon Profil' },
      ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/10 z-[100] px-6">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        
        {/* LOGO ADOPTEUNSTAGE */}
        <div 
          className="flex items-center gap-3 cursor-pointer group shrink-0"
          onClick={() => navigate(userType === 'company' ? '/company/swipe' : '/swipe')}
        >
          <div className="h-10 w-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-xl italic">A</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight hidden sm:block uppercase">
            AdopteUn<span className="text-pink-500">Stage</span>
          </span>
        </div>

        {/* NAVIGATION CENTRALE */}
        <div className="flex items-center gap-2 md:gap-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20 shadow-[0_0_20px_rgba(236,72,153,0.1)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`
              }
            >
              <div className="relative flex items-center">
                <span className="material-symbols-outlined text-[22px]">
                  {item.icon}
                </span>
                {item.hasNotification && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-pink-500 animate-pulse"></span>
                )}
              </div>
              <span className="text-sm font-bold tracking-wide hidden md:block">
                {item.label}
              </span>
            </NavLink>
          ))}
        </div>

        {/* ACTIONS DROITE (MODE + LOGOUT) */}
        <div className="flex items-center gap-4 pl-6 border-l border-white/10 shrink-0">
            <span className="hidden lg:block text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                {userType === 'company' ? 'Recruteur' : 'Étudiant'}
            </span>
            
            {/* BOUTON DECONNEXION */}
            <button
              onClick={handleLogout}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-lg group"
              title="Déconnexion"
            >
              <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform">
                logout
              </span>
            </button>
        </div>
      </div>
    </nav>
  );
};