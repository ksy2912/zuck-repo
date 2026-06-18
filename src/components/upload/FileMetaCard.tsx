import { FileText, HardDrive, Rows3, Tag, CheckCircle2 } from 'lucide-react';
import type { DetectedFormat, ParsedDataset } from '../../types/dataset';

interface FileMetaCardProps {
  dataset: ParsedDataset | null;
  isStreaming: boolean;
  streamedRows: number;
}

const FORMAT_STYLES: Record<DetectedFormat, { badge: string; dot: string }> = {
  BRAID_JSON:  { badge: 'bg-purple-100 text-purple-800 ring-purple-200', dot: 'bg-purple-500' },
  MineLib:     { badge: 'bg-emerald-100 text-emerald-800 ring-emerald-200', dot: 'bg-emerald-500' },
  Generic_CSV: { badge: 'bg-blue-100 text-blue-800 ring-blue-200', dot: 'bg-blue-500' },
  Excel:       { badge: 'bg-amber-100 text-amber-800 ring-amber-200', dot: 'bg-amber-500' },
  PCPSP:       { badge: 'bg-violet-100 text-violet-800 ring-violet-200', dot: 'bg-violet-500' },
  MultiFile:   { badge: 'bg-indigo-100 text-indigo-800 ring-indigo-200', dot: 'bg-indigo-500' },
  Unknown:     { badge: 'bg-slate-100 text-slate-600 ring-slate-200', dot: 'bg-slate-400' },
};

const FORMAT_LABELS: Record<DetectedFormat, string> = {
  BRAID_JSON: 'BRAID JSON',
  MineLib: 'MineLib',
  Generic_CSV: 'Generic CSV',
  Excel: 'Excel',
  PCPSP: 'PCPSP',
  MultiFile: 'Multi-file',
  Unknown: 'Unknown',
};

function truncateName(name: string, max = 28): string {
  if (name.length <= max) return name;
  const ext = name.lastIndexOf('.');
  if (ext > 0) {
    const base = name.slice(0, ext);
    const extension = name.slice(ext);
    if (base.length > max - extension.length - 3) {
      return base.slice(0, max - extension.length - 3) + '…' + extension;
    }
  }
  return name.slice(0, max - 1) + '…';
}

export function FileMetaCard({ dataset, isStreaming, streamedRows }: FileMetaCardProps) {
  if (!dataset && !isStreaming) return null;

  const displayRows = isStreaming ? streamedRows : (dataset?.rowCount ?? 0);
  const fileName = dataset?.fileName ?? 'Processing…';
  const fileSize = dataset?.fileSizeMB ?? 0;
  const format = dataset?.format ?? 'Unknown';
  const fmtStyle = FORMAT_STYLES[format];

  const stats = [
    {
      icon: FileText,
      label: 'File name',
      value: truncateName(fileName),
      accent: 'stat-accent-purple',
      iconBg: 'bg-violet-100 text-violet-600',
    },
    {
      icon: HardDrive,
      label: 'File size',
      value: fileSize > 0 ? `${fileSize.toFixed(1)} MB` : '—',
      accent: 'stat-accent-cyan',
      iconBg: 'bg-cyan-100 text-cyan-600',
    },
    {
      icon: Rows3,
      label: 'Row count',
      value: displayRows.toLocaleString(),
      suffix: 'rows',
      accent: 'stat-accent-violet',
      iconBg: 'bg-purple-100 text-purple-600',
      pulse: isStreaming,
      live: isStreaming,
    },
    {
      icon: Tag,
      label: 'Detected format',
      value: FORMAT_LABELS[format],
      accent: 'stat-accent-amber',
      iconBg: 'bg-amber-100 text-amber-600',
      badge: fmtStyle.badge,
      dot: fmtStyle.dot,
    },
  ];

  return (
    <div className="glass-card animate-fade-up rounded-2xl p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
            <CheckCircle2 className="h-4 w-4 text-violet-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Dataset overview</h2>
            <p className="text-xs text-slate-400">
              {isStreaming ? 'Streaming in progress…' : 'Successfully parsed'}
            </p>
          </div>
        </div>
        {isStreaming && (
          <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600 ring-1 ring-violet-200">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500" />
            Live
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`glass-card-hover rounded-xl bg-white p-4 ${stat.accent}`}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.iconBg}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              {'live' in stat && stat.live && (
                <span className="h-2 w-2 animate-pulse rounded-full bg-violet-500" />
              )}
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {stat.label}
            </p>
            {'badge' in stat && stat.badge ? (
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${stat.dot}`} />
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-sm font-bold ring-1 ring-inset ${stat.badge}`}>
                  {stat.value}
                </span>
              </div>
            ) : (
              <div className="mt-1 flex items-baseline gap-1">
                <p
                  className={`text-2xl font-extrabold tracking-tight text-slate-800 ${
                    stat.pulse ? 'animate-pulse-soft' : ''
                  }`}
                >
                  {stat.value}
                </p>
                {'suffix' in stat && stat.suffix && (
                  <span className="text-xs font-medium text-slate-400">{stat.suffix}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
