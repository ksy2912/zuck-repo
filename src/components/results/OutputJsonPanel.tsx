import { useMemo, useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import type { BraidOutput } from '../../types/braid';

interface OutputJsonPanelProps {
  output: BraidOutput;
  fileName?: string;
}

export function OutputJsonPanel({ output, fileName = 'schedule_output.json' }: OutputJsonPanelProps) {
  const [copied, setCopied] = useState(false);
  const json = useMemo(() => JSON.stringify(output, null, 2), [output]);

  const download = () => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Schedule output JSON</h3>
          <p className="text-xs text-slate-400">
            BRAID format — {output.length.toLocaleString()} scheduled blocks
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={download}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
        </div>
      </div>
      <pre className="max-h-80 overflow-auto rounded-xl bg-slate-900 p-4 text-xs leading-relaxed text-emerald-300">
        {json.slice(0, 8000)}
        {json.length > 8000 && '\n… (truncated preview — download for full file)'}
      </pre>
    </div>
  );
}
