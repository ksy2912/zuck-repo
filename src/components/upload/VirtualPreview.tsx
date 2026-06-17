import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Table2 } from 'lucide-react';

interface VirtualPreviewProps {
  rows: Record<string, string>[];
  headers: string[];
}

const MAX_ROWS = 50_000;
const ROW_HEIGHT = 36;
const COL_WIDTH = 148;
const ROW_NUM_WIDTH = 52;

export function VirtualPreview({ rows, headers }: VirtualPreviewProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const displayRows = rows.slice(0, MAX_ROWS);
  const totalRows = rows.length;
  const totalWidth = ROW_NUM_WIDTH + headers.length * COL_WIDTH;

  const rowVirtualizer = useVirtualizer({
    count: displayRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  return (
    <div className="glass-card animate-fade-up rounded-2xl p-6" style={{ animationDelay: '0.15s' }}>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
            <Table2 className="h-4 w-4 text-violet-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Data preview</h2>
            <p className="text-xs text-slate-400">Virtualized — only visible rows rendered</p>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-[11px] font-medium text-slate-500">
          {headers.length} cols
        </span>
      </div>

      <div
        ref={parentRef}
        className="custom-scroll overflow-auto rounded-xl border border-slate-200/80 shadow-inner"
        style={{ maxHeight: 440 }}
      >
        <div style={{ width: totalWidth, minWidth: '100%' }}>
          {/* Header */}
          <div
            className="sticky top-0 z-10 flex border-b border-violet-900/20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"
            style={{ height: ROW_HEIGHT }}
          >
            <div
              className="flex shrink-0 items-center justify-center text-[10px] font-bold uppercase tracking-widest text-slate-500"
              style={{ width: ROW_NUM_WIDTH }}
            >
              #
            </div>
            {headers.map((header, i) => (
              <div
                key={header}
                className="flex shrink-0 items-center truncate px-3 text-[11px] font-bold uppercase tracking-wide text-slate-300"
                style={{ width: COL_WIDTH }}
                title={header}
              >
                <span className="mr-1.5 text-violet-400 opacity-60">{i + 1}</span>
                {header}
              </div>
            ))}
          </div>

          {/* Body */}
          <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
            {virtualRows.map((virtualRow) => {
              const row = displayRows[virtualRow.index];
              const isEven = virtualRow.index % 2 === 0;

              return (
                <div
                  key={virtualRow.key}
                  className={`absolute left-0 flex w-full border-b border-slate-100/80 text-sm transition-colors hover:bg-violet-50/50 ${
                    isEven ? 'bg-white' : 'bg-slate-50/60'
                  }`}
                  style={{
                    height: ROW_HEIGHT,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div
                    className="flex shrink-0 items-center justify-center font-mono text-[10px] text-slate-300"
                    style={{ width: ROW_NUM_WIDTH }}
                  >
                    {virtualRow.index + 1}
                  </div>
                  {headers.map((header) => (
                    <div
                      key={header}
                      className="flex shrink-0 items-center truncate px-3 font-mono text-[11px] text-slate-600"
                      style={{ width: COL_WIDTH }}
                      title={row[header] ?? ''}
                    >
                      {row[header] ?? (
                        <span className="text-slate-300">null</span>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>
          Showing{' '}
          <span className="font-semibold text-slate-600">
            {Math.min(MAX_ROWS, totalRows).toLocaleString()}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-slate-600">{totalRows.toLocaleString()}</span>{' '}
          rows
        </span>
        {totalRows > MAX_ROWS && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-600 ring-1 ring-amber-200">
            Capped at 50,000
          </span>
        )}
      </div>
    </div>
  );
}
