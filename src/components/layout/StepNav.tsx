import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface StepNavProps {
  currentStep: 1 | 2 | 3 | 4;
}

const STEPS = [
  { num: 1, label: 'Upload', path: '/' },
  { num: 2, label: 'Map & Validate', path: '/map' },
  { num: 3, label: 'Optimize', path: '/optimize' },
  { num: 4, label: 'Results', path: '/results' },
] as const;

export function StepNav({ currentStep }: StepNavProps) {
  const navigate = useNavigate();
  const { braidOutput } = useAppContext();

  return (
    <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-0 px-6 py-4">
        {STEPS.map((step, i) => {
          const isComplete = step.num < currentStep;
          const isCurrent = step.num === currentStep;
          const isLocked = step.num === 4 && !braidOutput;
          const isClickable = step.num <= 3 || !!braidOutput;

          return (
            <div key={step.num} className="flex items-center">
              <button
                type="button"
                disabled={!isClickable || isCurrent}
                onClick={() => isClickable && navigate(step.path)}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  isCurrent
                    ? 'bg-violet-100 text-violet-700'
                    : isComplete
                      ? 'text-slate-700 hover:bg-slate-100'
                      : isLocked
                        ? 'cursor-not-allowed text-slate-300'
                        : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    isCurrent
                      ? 'bg-violet-600 text-white'
                      : isComplete
                        ? 'bg-slate-800 text-white'
                        : 'border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isComplete ? <Check className="h-3.5 w-3.5" /> : step.num}
                </span>
                <span className={isCurrent ? 'font-bold' : ''}>{step.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-2 h-px w-8 sm:w-16 ${
                    step.num < currentStep ? 'bg-violet-400' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
