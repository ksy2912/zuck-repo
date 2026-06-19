import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, TrendingUp, Layers, Calendar, Percent } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { StepNav } from '../components/layout/StepNav';
import { PeriodCharts, DestinationChart } from '../components/results/AnalyticsCharts';
import { OutputJsonPanel } from '../components/results/OutputJsonPanel';
import { useAppContext } from '../context/AppContext';
import { useEffect } from 'react';

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: typeof TrendingUp;
  accent: string;
}) {
  return (
    <div className={`glass-card rounded-2xl p-5 ${accent}`}>
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/80">
        <Icon className="h-4 w-4 text-violet-600" />
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-slate-800">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export function ResultsPage() {
  const navigate = useNavigate();
  const { solverResult, setSolverResult } = useAppContext();

  useEffect(() => {
    if (!solverResult) navigate('/');
  }, [solverResult, navigate]);

  if (!solverResult) return null;

  const { name, totalNpv, blockCount, periods, discountRate, periodStats, destinationSplit, output, fileNames } =
    solverResult;

  return (
    <div className="min-h-screen bg-mesh">
      <PageHeader
        title={`Results — ${name || 'Mine Schedule'}`}
        subtitle={`${fileNames.pcpsp} + ${fileNames.prec}`}
        step={2}
        totalSteps={2}
      />
      <StepNav currentStep={2} />

      <main className="relative mx-auto max-w-7xl space-y-6 px-6 py-10">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => { setSolverResult(null); navigate('/'); }}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" />
            New upload
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Total NPV"
            value={`$${totalNpv.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            sub="Discounted across all periods"
            icon={TrendingUp}
            accent="stat-accent-violet"
          />
          <KpiCard
            label="Blocks scheduled"
            value={blockCount.toLocaleString()}
            sub={`${output.length.toLocaleString()} in output`}
            icon={Layers}
            accent="stat-accent-purple"
          />
          <KpiCard
            label="Time periods"
            value={String(periods)}
            icon={Calendar}
            accent="stat-accent-cyan"
          />
          <KpiCard
            label="Discount rate"
            value={`${(discountRate * 100).toFixed(0)}%`}
            icon={Percent}
            accent="stat-accent-amber"
          />
        </div>

        <PeriodCharts periodStats={periodStats} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <DestinationChart ore={destinationSplit.ore} waste={destinationSplit.waste} />
          </div>
          <div className="lg:col-span-2">
            <OutputJsonPanel
              output={output}
              fileName={`${name || 'schedule'}_output.json`}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
