import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import type { PeriodStat } from '../../types/solver';

const COLORS = ['#7c3aed', '#06b6d4'];

interface PeriodChartsProps {
  periodStats: PeriodStat[];
}

export function PeriodCharts({ periodStats }: PeriodChartsProps) {
  const chartData = periodStats.map((p) => ({
    period: `P${p.period}`,
    blocks: p.blockCount,
    npv: Math.round(p.npv),
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="glass-card rounded-2xl p-6">
        <h3 className="mb-4 text-sm font-bold text-slate-800">Blocks per period</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="period" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="blocks" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="mb-4 text-sm font-bold text-slate-800">NPV per period</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="period" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1e6).toFixed(1)}M`} />
            <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'NPV']} />
            <Bar dataKey="npv" fill="#06b6d4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface DestinationChartProps {
  ore: number;
  waste: number;
}

export function DestinationChart({ ore, waste }: DestinationChartProps) {
  const data = [
    { name: 'Ore (dest 0)', value: ore },
    { name: 'Waste (dest 1)', value: waste },
  ];

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="mb-4 text-sm font-bold text-slate-800">Destination split</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
