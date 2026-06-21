import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PeriodRow } from '../../lib/analytics/chartData';
import type { SolverResult } from '../../types/solver';
import { ChartCard, chartTheme, tooltipStyle } from './ChartCard';

const fmtUsdFull = (v: number) =>
  `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface AnalyticsDashboardProps {
  result: SolverResult;
  rows: PeriodRow[];
}

export function AnalyticsDashboard({ result, rows }: AnalyticsDashboardProps) {
  const radialData = rows.map((r) => ({
    name: r.period,
    value: r.utilization,
    fill: chartTheme.accent,
  }));

  // -----------------------------------------------------------------
  // FIXED VISUAL CHART MAPPING
  // -----------------------------------------------------------------
  // Destination 0 is Waste and Destination 1 is Ore.
  // We point the labels and color fills to the correct variables here.
  const destData = [
    { name: 'Waste (dest 0)', value: result.destinationSplit.waste, fill: chartTheme.waste },
    { name: 'Ore (dest 1)', value: result.destinationSplit.ore, fill: chartTheme.ore },
  ];
  // -----------------------------------------------------------------

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Schedule analytics</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Eight views of throughput, value, and destination mix across {result.periods} periods
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* 1 — Mining throughput */}
        <ChartCard title="Mining throughput" subtitle="Blocks scheduled per period">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={rows} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: chartTheme.axis }} />
              <YAxis tick={{ fontSize: 11, fill: chartTheme.axis }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="blocks" fill={chartTheme.ore} radius={[4, 4, 0, 0]} name="Blocks" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2 — NPV trend */}
        <ChartCard title="NPV by period" subtitle="Discounted value generated each period">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: chartTheme.axis }} />
              <YAxis tick={{ fontSize: 11, fill: chartTheme.axis }} tickFormatter={(v) => `$${(v / 1e6).toFixed(1)}M`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [fmtUsdFull(v), 'NPV']} />
              <Line type="monotone" dataKey="npv" stroke={chartTheme.npv} strokeWidth={2.5} dot={{ r: 3, fill: chartTheme.npv }} name="NPV" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 3 — Cumulative NPV */}
        <ChartCard title="Cumulative NPV" subtitle="Running total discounted value">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={rows}>
              <defs>
                <linearGradient id="npvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartTheme.npv} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={chartTheme.npv} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: chartTheme.axis }} />
              <YAxis tick={{ fontSize: 11, fill: chartTheme.axis }} tickFormatter={(v) => `$${(v / 1e6).toFixed(0)}M`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [fmtUsdFull(v), 'Cumulative']} />
              <Area type="monotone" dataKey="cumulativeNpv" stroke={chartTheme.npv} fill="url(#npvGrad)" strokeWidth={2} name="Cumulative NPV" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 4 — Destination donut */}
        <ChartCard title="Destination allocation" subtitle="Ore vs waste routing across all blocks">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={destData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {destData.map((d, i) => (
                  <Cell key={i} fill={d.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 5 — Stacked destination by period */}
        <ChartCard title="Destination by period" subtitle="Ore and waste blocks scheduled each period">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={rows} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: chartTheme.axis }} />
              <YAxis tick={{ fontSize: 11, fill: chartTheme.axis }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              
              {/* FIXED BAR ORDER AND COLORS: Waste on bottom, Ore stacked on top */}
              <Bar dataKey="waste" stackId="d" fill={chartTheme.waste} name="Waste" radius={[0, 0, 0, 0]} />
              <Bar dataKey="ore" stackId="d" fill={chartTheme.ore} name="Ore" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 6 — NPV share horizontal */}
        <ChartCard title="NPV contribution" subtitle="Each period's share of total mine NPV (%)">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={rows} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: chartTheme.axis }} unit="%" />
              <YAxis type="category" dataKey="period" tick={{ fontSize: 11, fill: chartTheme.axis }} width={36} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toFixed(1)}%`, 'Share']} />
              <Bar dataKey="npvShare" fill={chartTheme.accent} radius={[0, 4, 4, 0]} name="NPV share %" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 7 — Composed dual metric */}
        <ChartCard title="Throughput vs value" subtitle="Block volume and NPV on the same timeline">
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: chartTheme.axis }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: chartTheme.axis }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: chartTheme.axis }} tickFormatter={(v) => `$${(v / 1e6).toFixed(0)}M`} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar yAxisId="left" dataKey="blocks" fill={chartTheme.fill} stroke={chartTheme.ore} strokeWidth={1} name="Blocks" barSize={20} />
              <Line yAxisId="right" type="monotone" dataKey="npv" stroke={chartTheme.npv} strokeWidth={2} dot={false} name="NPV" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 8 — Period intensity radial */}
        <ChartCard title="Period intensity" subtitle="Relative mining load vs peak period (%)">
          <ResponsiveContainer width="100%" height={240}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={radialData}>
              <PolarGrid stroke={chartTheme.grid} />
              <PolarAngleAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: chartTheme.axis }} />
              <RadialBar background dataKey="value" cornerRadius={4} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number, _n, p) => [`${v}%`, (p as { payload?: { name?: string } })?.payload?.name ?? 'Period']} />
            </RadialBarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}