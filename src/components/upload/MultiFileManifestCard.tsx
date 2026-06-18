import { FileStack, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { FileManifestEntry, CompletenessReport } from '../../types/fragments';

interface MultiFileManifestCardProps {
  manifest: FileManifestEntry[];
  completeness: CompletenessReport;
  pairingHint?: string | null;
}

const ROLE_COLORS: Record<string, string> = {
  pcpsp_model: 'bg-violet-100 text-violet-800',
  precedence: 'bg-cyan-100 text-cyan-800',
  braid_json: 'bg-purple-100 text-purple-800',
  tabular: 'bg-blue-100 text-blue-800',
  unknown: 'bg-slate-100 text-slate-600',
};

export function MultiFileManifestCard({
  manifest,
  completeness,
  pairingHint,
}: MultiFileManifestCardProps) {
  return (
    <div className="glass-card animate-fade-up rounded-2xl p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
          <FileStack className="h-4 w-4 text-violet-600" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800">Multi-file assembly</h2>
          <p className="text-xs text-slate-400">
            {manifest.length} files merged into BRAID structure
          </p>
        </div>
        {completeness.readyForBraid ? (
          <span className="ml-auto flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Ready for BRAID
          </span>
        ) : (
          <span className="ml-auto flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
            <AlertTriangle className="h-3.5 w-3.5" />
            Incomplete
          </span>
        )}
      </div>

      {pairingHint && (
        <p className="mb-4 rounded-lg bg-violet-50 px-3 py-2 text-xs font-medium text-violet-700">
          {pairingHint}
        </p>
      )}

      <div className="space-y-3">
        {manifest.map((entry) => (
          <div
            key={entry.fileName}
            className="rounded-xl border border-slate-100 bg-white p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-semibold text-slate-800">
                {entry.fileName}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${ROLE_COLORS[entry.role] ?? ROLE_COLORS.unknown}`}
              >
                {entry.role.replace('_', ' ')}
              </span>
            </div>
            <ul className="mt-2 space-y-0.5">
              {entry.contributes.map((c) => (
                <li key={c} className="text-xs text-slate-500">
                  · {c}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {[
          { label: 'Blocks', ok: completeness.hasBlockIds },
          { label: 'Objectives', ok: completeness.hasObjectives },
          { label: 'Precedence', ok: completeness.hasPrecedence },
          { label: 'Capacities', ok: completeness.hasResourceCoeffs },
          { label: 'Res. limits', ok: completeness.hasResourceLimits },
          { label: 'Discount', ok: completeness.hasDiscountRate },
        ].map((item) => (
          <div
            key={item.label}
            className={`rounded-lg px-3 py-2 text-center text-xs font-medium ${
              item.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'
            }`}
          >
            {item.label} {item.ok ? '✓' : '—'}
          </div>
        ))}
      </div>

      {completeness.missing.length > 0 && !completeness.readyForBraid && (
        <p className="mt-3 text-xs text-amber-600">
          Still needed: {completeness.missing.filter((m) => !m.includes('optional')).join(', ')}
        </p>
      )}
    </div>
  );
}
