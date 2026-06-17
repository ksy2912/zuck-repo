import { Columns3 } from 'lucide-react';
import type { ColumnMeta, ColumnType } from '../../types/dataset';

interface ColumnInspectorProps {
  columns: ColumnMeta[];
  isLoading?: boolean;
}

const TYPE_STYLES: Record<ColumnType, string> = {
  integer: 'bg-blue-50 text-blue-700 ring-blue-200',
  float:   'bg-amber-50 text-amber-700 ring-amber-200',
  string:  'bg-slate-100 text-slate-600 ring-slate-200',
  boolean: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: 4 }).map((__, j) => (
            <td key={j} className="px-4 py-3">
              <div className="skeleton-shimmer h-4 rounded-md" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function ColumnInspector({ columns, isLoading }: ColumnInspectorProps) {
  return (
    <div className="glass-card animate-fade-up rounded-2xl p-6" style={{ animationDelay: '0.1s' }}>
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100">
          <Columns3 className="h-4 w-4 text-cyan-600" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800">Column inspector</h2>
          <p className="text-xs text-slate-400">
            {isLoading ? 'Analyzing…' : `${columns.length} columns detected`}
          </p>
        </div>
      </div>

      <div className="custom-scroll max-h-[340px] overflow-auto rounded-xl border border-slate-100">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              {['Column', 'Type', 'Nulls', 'Samples'].map((h) => (
                <th
                  key={h}
                  className="sticky top-0 bg-slate-50/95 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 backdrop-blur-sm"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              <SkeletonRows />
            ) : columns.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-400">
                  No columns detected
                </td>
              </tr>
            ) : (
              columns.map((col) => (
                <tr
                  key={col.name}
                  className="transition-colors hover:bg-violet-50/40"
                >
                  <td className="px-4 py-2.5">
                    <span className="font-semibold text-slate-800">{col.name}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset ${TYPE_STYLES[col.type]}`}
                    >
                      {col.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`font-mono text-xs tabular-nums ${col.nullCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                      {col.nullCount.toLocaleString()}
                    </span>
                  </td>
                  <td className="max-w-[160px] truncate px-4 py-2.5 font-mono text-[11px] text-slate-400">
                    {col.sample.length > 0 ? col.sample.join(' · ') : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
