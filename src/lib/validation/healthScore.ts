import type { ValidationCheck } from '../../types/validation';

export function computeHealthScore(checks: ValidationCheck[]): number {
  let score = 100;
  for (const check of checks) {
    if (check.status === 'fail') score -= 20;
    if (check.status === 'warn') score -= 5;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}
