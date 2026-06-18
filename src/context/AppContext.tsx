import { createContext, useContext, useState, type ReactNode } from 'react';
import type { BraidJSON } from '../types/braid';
import type { ParsedDataset } from '../types/dataset';
import type { ValidationResult } from '../types/validation';

interface AppContextValue {
  dataset: ParsedDataset | null;
  setDataset: (d: ParsedDataset | null) => void;
  braidOutput: BraidJSON | null;
  setBraidOutput: (b: BraidJSON | null) => void;
  validationResult: ValidationResult | null;
  setValidationResult: (r: ValidationResult | null) => void;
  rawBraidJson: BraidJSON | null;
  setRawBraidJson: (b: BraidJSON | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [dataset, setDataset] = useState<ParsedDataset | null>(null);
  const [braidOutput, setBraidOutput] = useState<BraidJSON | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [rawBraidJson, setRawBraidJson] = useState<BraidJSON | null>(null);

  return (
    <AppContext.Provider
      value={{
        dataset,
        setDataset,
        braidOutput,
        setBraidOutput,
        validationResult,
        setValidationResult,
        rawBraidJson,
        setRawBraidJson,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
