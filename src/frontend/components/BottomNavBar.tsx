import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useBottomNav } from '../contexts/BottomNavContext';

export const BottomNavBar: React.FC = () => {
  const { isVisible } = useBottomNav();
  const location = useLocation();
  
  const userType = (() => {
    try { return sessionStorage.getItem('jobfair_user_type'); } catch { return null; }
  })();

  const navItems = userType === 'company'
    ? [
        { path: '/company/swipe', icon: 'swipe' },
        { path: '/company/schedule', icon: 'calendar_month' },
        { path: '/company/profile', icon: 'person' },
      ]
    : [
        { path: '/swipe', icon: 'swipe' },
        { path: '/schedule', icon: 'calendar_month' },
        { path: '/profile', icon: 'person' },
      ];

  // Calculate active index for indicator animation
  const activeIndex = navItems.findIndex(item => location.pathname === item.path || location.pathname.startsWith(item.path + '/'));

  return (
    <nav 
      className={`md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
      }`}
    >
      <div className="bottom-nav-bar relative flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full shadow-2xl shadow-black/20">
        {/* Animated background indicator */}
        <div 
          className="absolute h-12 w-12 bg-pink-500 rounded-full shadow-lg shadow-pink-500/40 transition-all duration-300 ease-out"
          style={{ 
            left: `${12 + activeIndex * 56}px`,
            opacity: activeIndex >= 0 ? 1 : 0
          }}
        />
        
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `relative z-10 flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                isActive
                  ? 'text-white scale-110'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/10'
              }`
            }
          >
            <span className="material-symbols-outlined text-2xl">
              {item.icon}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
