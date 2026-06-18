export type CheckStatus = 'pass' | 'fail' | 'warn';

export interface ValidationCheck {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
  affectedCount?: number;
}

export interface ValidationResult {
  checks: ValidationCheck[];
  totalBlocks: number;
  totalResources: number;
  totalPeriods: number;
  isValid: boolean;
  score: number;
}
