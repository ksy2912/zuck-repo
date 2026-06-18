import type { ValidationResult } from '../../types/validation';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface ValidationReportProps {
  result: ValidationResult;
}

const STATUS_ICON = {
  pass: { Icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  fail: { Icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  warn: { Icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
};

export function ValidationReport({ result }: ValidationReportProps) {
  const passed = result.checks.filter((c) => c.status === 'pass').length;
  const failed = result.checks.filter((c) => c.status === 'fail').length;
  const warned = result.checks.filter((c) => c.status === 'warn').length;

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="mb-4 text-sm font-bold text-slate-800">Validation report</h3>
      <div className="space-y-3">
        {result.checks.map((check) => {
          const { Icon, color, bg } = STATUS_ICON[check.status];
          return (
            <div key={check.id} className="flex items-start gap-3 rounded-xl border border-slate-100 p-3">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-800">{check.label}</p>
                <p className="mt-0.5 text-sm text-slate-500">{check.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
        <span className="font-semibold text-emerald-600">{passed} passed</span>
        {failed > 0 && <> · <span className="font-semibold text-red-600">{failed} failed</span></>}
        {warned > 0 && <> · <span className="font-semibold text-amber-600">{warned} warning{warned > 1 ? 's' : ''}</span></>}
        <br />
        Total blocks: {result.totalBlocks.toLocaleString()} · Resources: {result.totalResources} · Periods: {result.totalPeriods}
      </p>
    </div>
  );
}
