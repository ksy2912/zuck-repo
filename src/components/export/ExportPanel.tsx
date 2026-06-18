import { useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import type { BraidJSON } from '../../types/braid';

interface ExportPanelProps {
  braid: BraidJSON;
  score: number;
  fileName: string;
}

export function ExportPanel({ braid, score, fileName }: ExportPanelProps) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(braid, null, 2);
  const baseName = fileName.replace(/\.[^.]+$/, '');

  const download = () => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}_braid.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="mb-4 text-sm font-bold text-slate-800">Export BRAID JSON</h3>
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Blocks', value: braid.blocks.length.toLocaleString() },
          { label: 'Resources', value: braid.resources.length.toString() },
          { label: 'Periods', value: braid.resources[0]?.upper_capacity.length.toString() ?? '6' },
          { label: 'Health', value: `${score}%` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-slate-50 p-3 text-center">
            <p className="text-lg font-bold text-slate-800">{stat.value}</p>
            <p className="text-xs text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={download}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800"
        >
          <Download className="h-4 w-4" />
          Download BRAID JSON
        </button>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy JSON'}
        </button>
      </div>
      <p className="mt-4 text-[11px] text-slate-400">
        Conforms to Decisions 360 BRAID input schema. Solver returns{' '}
        <code className="font-mono text-slate-500">block_id</code>,{' '}
        <code className="font-mono text-slate-500">destination</code>,{' '}
        <code className="font-mono text-slate-500">time_period</code> per scheduled block.
      </p>
    </div>
  );
}
