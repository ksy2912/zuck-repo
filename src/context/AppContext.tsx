import { createContext, useContext, useState, type ReactNode } from 'react';
import type { SolverResult } from '../types/solver';

interface AppContextValue {
  solverResult: SolverResult | null;
  setSolverResult: (r: SolverResult | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [solverResult, setSolverResult] = useState<SolverResult | null>(null);

  return (
    <AppContext.Provider value={{ solverResult, setSolverResult }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
