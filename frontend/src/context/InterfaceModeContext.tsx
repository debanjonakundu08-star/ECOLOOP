import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export type InterfaceMode = 'buyer' | 'seller';

interface InterfaceModeContextType {
  mode: InterfaceMode;
  setMode: (mode: InterfaceMode) => void;
  toggleMode: () => void;
  switchToBuyer: () => void;
  switchToSeller: () => void;
}

const InterfaceModeContext = createContext<InterfaceModeContextType | undefined>(undefined);

export const InterfaceModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [mode, setModeState] = useState<InterfaceMode>(() => {
    try {
      const saved = localStorage.getItem('ecoloop_interface_mode');
      if (saved === 'buyer' || saved === 'seller') return saved;
    } catch {}
    return 'buyer';
  });

  const setMode = (newMode: InterfaceMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem('ecoloop_interface_mode', newMode);
    } catch {}
  };

  const toggleMode = () => {
    const next = mode === 'buyer' ? 'seller' : 'buyer';
    setMode(next);
  };

  const switchToBuyer = () => {
    setMode('buyer');
    navigate('/buyer/dashboard');
  };

  const switchToSeller = () => {
    setMode('seller');
    navigate('/seller/dashboard');
  };

  // Synchronize mode based on route context when user navigates
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/seller') || path === '/list-waste') {
      if (mode !== 'seller') {
        setModeState('seller');
        try { localStorage.setItem('ecoloop_interface_mode', 'seller'); } catch {}
      }
    } else if (path.startsWith('/buyer') || path.startsWith('/request/')) {
      if (mode !== 'buyer') {
        setModeState('buyer');
        try { localStorage.setItem('ecoloop_interface_mode', 'buyer'); } catch {}
      }
    }
  }, [location.pathname]);

  return (
    <InterfaceModeContext.Provider
      value={{
        mode,
        setMode,
        toggleMode,
        switchToBuyer,
        switchToSeller,
      }}
    >
      {children}
    </InterfaceModeContext.Provider>
  );
};

export const useInterfaceMode = () => {
  const context = useContext(InterfaceModeContext);
  if (!context) {
    throw new Error('useInterfaceMode must be used within an InterfaceModeProvider');
  }
  return context;
};
