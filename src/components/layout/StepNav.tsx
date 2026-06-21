import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface StepNavProps {
  currentStep: 1 | 2;
}

const STEPS = [
  { num: 1, label: 'Upload dataset', path: '/' },
  { num: 2, label: 'Review results', path: '/results' },
] as const;

export function StepNav({ currentStep }: StepNavProps) {
  const navigate = useNavigate();
  const { solverResult } = useAppContext();

  return (
    <nav className="border-b border-[var(--border)] bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-6 py-3">
        {STEPS.map((step, i) => {
          const isComplete = step.num < currentStep;
          const isCurrent = step.num === currentStep;
          const isLocked = step.num === 2 && !solverResult;
          const isClickable = step.num === 1 || !!solverResult;

          return (
            <div key={step.num} className="flex items-center">
              <button
                type="button"
                disabled={!isClickable || isCurrent}
                onClick={() => isClickable && navigate(step.path)}
                className={`flex items-center gap-2.5 rounded-lg px-4 py-2 text-sm transition-colors ${
                  isCurrent
                    ? 'bg-[var(--navy)] text-white'
                    : isComplete
                      ? 'text-[var(--text-primary)] hover:bg-slate-50'
                      : isLocked
                        ? 'cursor-not-allowed text-slate-300'
                        : 'text-[var(--text-muted)] hover:bg-slate-50'
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    isCurrent
                      ? 'bg-white/20 text-white'
                      : isComplete
                        ? 'bg-[var(--green)] text-white'
                        : 'border border-slate-300 text-slate-400'
                  }`}
                >
                  {isComplete ? <Check className="h-3.5 w-3.5" /> : step.num}
                </span>
                <span className={isCurrent ? 'font-semibold' : 'font-medium'}>{step.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`mx-3 h-px w-12 ${step.num < currentStep ? 'bg-[var(--copper)]' : 'bg-slate-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
