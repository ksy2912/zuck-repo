interface SchemaReferenceProps {
  compact?: boolean;
}

export function SchemaReference({ compact }: SchemaReferenceProps) {
  if (compact) {
    return (
      <p className="text-xs text-slate-400">
        Output format:{' '}
        <code className="rounded bg-slate-100 px-1 font-mono text-slate-600">
          {'{ block_id, destination, time_period }[]'}
        </code>
      </p>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="mb-1 text-sm font-bold text-slate-800">Decisions 360 — BRAID JSON schemas</h3>
      <p className="mb-4 text-xs text-slate-400">
        DECISIONS 360 Pty Ltd · ABN 53 667 344 014 · UAE Lic No 47008614
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4">
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-violet-700">Input JSON</h4>
          <ul className="space-y-1 text-xs text-slate-600">
            <li><strong>blocks[]</strong> — id, precedence[], destinations[]</li>
            <li><strong>destinations[]</strong> — id, objective, resources[]</li>
            <li><strong>resources[]</strong> — id, capacity_used per destination</li>
            <li><strong>resources[]</strong> — id, lower/upper_capacity per period</li>
            <li><strong>parameters</strong> — discount_rate</li>
          </ul>
        </div>
        <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-4">
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-cyan-700">Output JSON</h4>
          <ul className="space-y-1 text-xs text-slate-600">
            <li><strong>block_id</strong> — source block mined</li>
            <li><strong>destination</strong> — target destination</li>
            <li><strong>time_period</strong> — period block is scheduled</li>
          </ul>
          <p className="mt-2 text-[11px] text-slate-400">
            One row per scheduled block. Unscheduled blocks are omitted.
          </p>
        </div>
      </div>
    </div>
  );
}
