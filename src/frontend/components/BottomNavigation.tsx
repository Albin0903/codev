import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';

export const BottomNavigation: React.FC = () => {
  const userType = useMemo(() => {
    try { return sessionStorage.getItem('jobfair_user_type'); } catch { return null; }
  }, []);

  const navItems = userType === 'company'
    ? [
        { path: '/company/profile', icon: 'business_center', label: 'Profil' },
        { path: '/company/swipe', icon: 'swipe', label: 'Swipe', isMain: true },
        { path: '/company/matches', icon: 'calendar_month', label: 'Planning', hasNotification: true },
      ]
    : [
        { path: '/profile', icon: 'person', label: 'Profil' },
        { path: '/swipe', icon: 'swipe', label: 'Swipe', isMain: true },
        { path: '/schedule', icon: 'calendar_month', label: 'Planning', hasNotification: true },
      ];

  return (
    <div className="mx-auto max-w-[20rem] bottom-nav">
      <div className="bg-[#182334]/50 backdrop-blur-3xl rounded-full flex justify-between items-center px-6 py-3 shadow-glass border border-white/10 ring-1 ring-white/5 relative z-50">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center gap-0.5 w-14 h-12 transition-all duration-300 ${
                isActive
                  ? item.isMain
                    ? 'text-primary dark:text-white scale-110'
                    : 'text-primary dark:text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                    <span className={`material-symbols-outlined text-[28px] ${isActive ? 'fill' : ''}`}>
                    {item.icon}
                    </span>
                    {item.hasNotification && !isActive && (
                        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-[#182334] animate-pulse"></span>
                    )}
                </div>
                {isActive && <div className="h-1 w-1 bg-primary rounded-full mt-1"></div>}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};