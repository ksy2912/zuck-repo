import { useMemo, useState } from 'react';
import { Download, Copy, Check, Braces } from 'lucide-react';
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
    <div className="panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--navy)] text-white">
            <Braces className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Schedule output JSON</h3>
            <p className="text-xs text-[var(--text-muted)]">
              BRAID format · {output.length.toLocaleString()} scheduled blocks
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={copy}
            className="btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={download}
            className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
        </div>
      </div>
      <pre className="custom-scroll max-h-80 overflow-auto bg-[#0a1628] p-5 font-mono text-xs leading-relaxed text-slate-300">
        {json.slice(0, 8000)}
        {json.length > 8000 && '\n… (truncated preview — download for full file)'}
      </pre>
    </div>
  );
}
