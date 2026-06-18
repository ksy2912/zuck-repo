import type { BraidBlock } from '../../types/braid';

interface TransformPreviewProps {
  blocks: BraidBlock[];
}

function highlightJson(json: string): string {
  return json
    .replace(/"([^"]+)":/g, '<span class="text-violet-400">"$1"</span>:')
    .replace(/: (-?\d+\.?\d*)/g, ': <span class="text-amber-400">$1</span>')
    .replace(/: "([^"]*)"/g, ': <span class="text-emerald-400">"$1"</span>')
    .replace(/\[|\]/g, '<span class="text-slate-400">$&</span>')
    .replace(/\{|\}/g, '<span class="text-slate-400">$&</span>');
}

export function TransformPreview({ blocks }: TransformPreviewProps) {
  const preview = blocks.slice(0, 3);
  const json = JSON.stringify(preview, null, 2);

  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="mb-3 text-sm font-bold text-slate-800">Preview — first 3 blocks</h3>
      <pre
        className="custom-scroll max-h-64 overflow-auto rounded-xl bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-300"
        dangerouslySetInnerHTML={{ __html: highlightJson(json) }}
      />
    </div>
  );
}
