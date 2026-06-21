interface PageHeaderProps {
  title: string;
  subtitle?: string;
  step?: number;
  totalSteps?: number;
}

export function PageHeader({ title, subtitle, step = 1, totalSteps = 2 }: PageHeaderProps) {
  return (
    <header className="border-b border-[#0a1f35] bg-[var(--navy)] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--copper)] text-sm font-bold tracking-tight text-white">
            B
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-white">BRAID</p>
            <p className="text-[11px] text-slate-400">Decisions 360 · Mine Optimization</p>
          </div>
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-xs text-slate-300">DECISIONS 360 Pty Ltd</p>
          <p className="text-[10px] text-slate-500">ABN 53 667 344 014</p>
        </div>
      </div>

      <div className="border-t border-white/10 bg-[var(--navy-mid)]">
        <div className="mx-auto max-w-7xl px-6 py-7">
          <p className="text-[11px] font-medium uppercase tracking-widest text-[var(--copper-light)]">
            Step {step} of {totalSteps}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">{subtitle}</p>
          )}
        </div>
      </div>
    </header>
  );
}
