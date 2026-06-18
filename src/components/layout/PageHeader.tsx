import { Layers } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  step?: number;
  totalSteps?: number;
}

export function PageHeader({ title, subtitle, step = 1, totalSteps = 4 }: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -right-16 top-0 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-lg shadow-violet-900/40">
            <Layers className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white">BRAID</span>
              <span className="hidden rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-violet-300 sm:inline">
                Decisions 360
              </span>
            </div>
            <p className="text-xs text-slate-400">Mine Optimization Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-1.5 sm:flex">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i + 1 === step
                    ? 'w-8 bg-violet-400'
                    : i + 1 < step
                      ? 'w-4 bg-violet-600'
                      : 'w-4 bg-slate-700'
                }`}
              />
            ))}
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium text-slate-300">DECISIONS 360 Pty Ltd</p>
            <p className="text-[10px] text-slate-500">ABN 53 667 344 014</p>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/20 text-xs font-bold text-violet-300 ring-1 ring-violet-500/30">
              {step}
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-violet-400">
              of {totalSteps} steps
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 max-w-xl text-base text-slate-400">{subtitle}</p>
          )}
        </div>
      </div>
    </header>
  );
}
