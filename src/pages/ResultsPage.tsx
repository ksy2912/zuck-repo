import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  TrendingUp,
  Layers,
  Calendar,
  Percent,
  Activity,
  Target,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { StepNav } from '../components/layout/StepNav';
import { AnalyticsDashboard } from '../components/results/AnalyticsDashboard';
import { OutputJsonPanel } from '../components/results/OutputJsonPanel';
import { useAppContext } from '../context/AppContext';
import { buildPeriodRows, summaryInsights } from '../lib/analytics/chartData';

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  variant = 'default',
}: {
  label: string;
  value: string;
  sub?: string;
  icon: typeof TrendingUp;
  variant?: 'default' | 'copper' | 'green' | 'slate';
}) {
  return (
    <div className={`kpi-card ${variant !== 'default' ? variant : ''}`}>
      <div className="mb-3 flex items-center justify-between">
        <Icon className="h-4 w-4 text-[var(--text-muted)]" />
      </div>
      <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-[var(--text-primary)]">{value}</p>
      {sub && <p className="mt-1 text-xs text-[var(--text-muted)]">{sub}</p>}
    </div>
  );
}

export function ResultsPage() {
  const navigate = useNavigate();
  const { solverResult, setSolverResult } = useAppContext();

  useEffect(() => {
    if (!solverResult) navigate('/');
  }, [solverResult, navigate]);

  const rows = useMemo(
    () => (solverResult ? buildPeriodRows(solverResult) : []),
    [solverResult]
  );
  const insights = useMemo(
    () => (solverResult ? summaryInsights(rows, solverResult) : null),
    [rows, solverResult]
  );

  if (!solverResult || !insights) return null;

  const {
    name,
    totalNpv,
    blockCount,
    periods,
    discountRate,
    output,
    fileNames,
    engine,
    destinationSplit,
  } = solverResult;

  // -----------------------------------------------------------------
  // DATA PATCH: Align destination values to MineLib Standards
  // -----------------------------------------------------------------
  // Destination 0 is Waste and Destination 1 is Ore.
  // We align the misaligned backend variables here before rendering.
  const correctedDestinationSplit = {
    ore: destinationSplit.waste,   // Maps the smaller 39% number to Ore
    waste: destinationSplit.ore,   // Maps the larger 61% number to Waste
  };

  const correctedInsights = {
    ...insights,
    // Calculate the accurate percentage split using the correct Ore count
    orePct: parseFloat(((correctedDestinationSplit.ore / blockCount) * 100).toFixed(1))
  };

  const correctedSolverResult = {
    ...solverResult,
    destinationSplit: correctedDestinationSplit
  };
  // -----------------------------------------------------------------

  return (
    <div className="min-h-screen bg-app">
      <PageHeader
        title={name || 'Mine schedule'}
        subtitle={`${fileNames.pcpsp} · ${fileNames.prec}`}
        step={2}
        totalSteps={2}
      />
      <StepNav currentStep={2} />

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--text-muted)]">
              Peak load: {insights.peakPeriod} ({insights.peakBlocks.toLocaleString()} blocks)
            </span>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setSolverResult(null); navigate('/'); }} className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm">
              <RotateCcw className="h-4 w-4" /> New run
            </button>
            <button type="button" onClick={() => navigate('/')} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Total NPV"
            value={`$${totalNpv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            sub="Discounted mine value"
            icon={TrendingUp}
          />
          <KpiCard
            label="Blocks scheduled"
            value={blockCount.toLocaleString()}
            sub={`Avg ${insights.avgBlocks.toLocaleString()} per period`}
            icon={Layers}
            variant="copper"
          />
          <KpiCard
            label="Planning horizon"
            value={`${periods} periods`}
            sub={`Best NPV in ${insights.topNpvPeriod}`}
            icon={Calendar}
            variant="slate"
          />
          {/* PATCH INTEGRATION: Renders the true Ore Routing statistics */}
          <KpiCard
            label="Ore routing"
            value={`${correctedInsights.orePct}%`}
            sub={`${correctedDestinationSplit.ore.toLocaleString()} ore · ${correctedDestinationSplit.waste.toLocaleString()} waste`}
            icon={Target}
            variant="green"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="panel flex items-center gap-4 p-4">
            <Activity className="h-8 w-8 text-[var(--navy)]" />
            <div>
              <p className="text-xs text-[var(--text-muted)]">Discount rate</p>
              <p className="text-lg font-semibold">{(discountRate * 100).toFixed(1)}%</p>
            </div>
          </div>
          <div className="panel flex items-center gap-4 p-4">
            <Percent className="h-8 w-8 text-[var(--copper)]" />
            <div>
              <p className="text-xs text-[var(--text-muted)]">Output records</p>
              <p className="text-lg font-semibold">{output.length.toLocaleString()}</p>
            </div>
          </div>
          <div className="panel flex items-center gap-4 p-4">
            <TrendingUp className="h-8 w-8 text-[var(--green)]" />
            <div>
              <p className="text-xs text-[var(--text-muted)]">Peak throughput</p>
              <p className="text-lg font-semibold">{insights.peakBlocks.toLocaleString()} blocks</p>
            </div>
          </div>
        </div>

        {/* PATCH INTEGRATION: Passes down the corrected result to fix all internal layout charts */}
        <AnalyticsDashboard result={correctedSolverResult} rows={rows} />

        <OutputJsonPanel output={output} fileName={`${name || 'schedule'}_output.json`} />
      </main>
    </div>
  );
}