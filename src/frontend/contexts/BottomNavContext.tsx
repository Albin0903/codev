import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface BottomNavContextType {
  isVisible: boolean;
  hideNav: () => void;
  showNav: () => void;
}

const BottomNavContext = createContext<BottomNavContextType | undefined>(undefined);

export const BottomNavProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(true);

  const hideNav = useCallback(() => setIsVisible(false), []);
  const showNav = useCallback(() => setIsVisible(true), []);

  return (
    <BottomNavContext.Provider value={{ isVisible, hideNav, showNav }}>
      {children}
    </BottomNavContext.Provider>
  );
};

export const useBottomNav = (): BottomNavContextType => {
  const context = useContext(BottomNavContext);
  if (!context) {
    throw new Error('useBottomNav must be used within a BottomNavProvider');
  }
  return context;
};
