import type { BraidOutput } from '../../types/braid';
import type { SolverResult } from '../../types/solver';

export interface PeriodRow {
  period: string;
  periodNum: number;
  blocks: number;
  npv: number;
  cumulativeNpv: number;
  ore: number;
  waste: number;
  npvShare: number;
  utilization: number;
}

export function buildPeriodRows(result: SolverResult): PeriodRow[] {
  const destByPeriod = new Map<number, { ore: number; waste: number }>();

  for (const row of result.output) {
    const bucket = destByPeriod.get(row.time_period) ?? { ore: 0, waste: 0 };
    
    // -------------------------------------------------------------
    // FIXED MAPPING: Destination 0 is Waste, Destination 1 is Ore
    // -------------------------------------------------------------
    if (row.destination === 0) {
      bucket.waste += 1; // Destination 0 goes to Waste counter
    } else {
      bucket.ore += 1;   // Destination 1 goes to Ore counter
    }
    // -------------------------------------------------------------
    
    destByPeriod.set(row.time_period, bucket);
  }

  const maxBlocks = Math.max(...result.periodStats.map((p) => p.blockCount), 1);
  let cumulative = 0;

  return result.periodStats.map((p) => {
    cumulative += p.npv;
    const dest = destByPeriod.get(p.period) ?? { ore: 0, waste: 0 };
    return {
      period: `P${p.period}`,
      periodNum: p.period,
      blocks: p.blockCount,
      npv: p.npv,
      cumulativeNpv: cumulative,
      ore: dest.ore,
      waste: dest.waste,
      npvShare: result.totalNpv ? (p.npv / result.totalNpv) * 100 : 0,
      utilization: Math.round((p.blockCount / maxBlocks) * 100),
    };
  });
}

export function periodDistribution(output: BraidOutput, periods: number) {
  const counts = Array.from({ length: periods }, (_, i) => ({
    period: `P${i}`,
    count: 0,
  }));
  for (const row of output) {
    if (row.time_period < counts.length) counts[row.time_period].count += 1;
  }
  return counts;
}

export function summaryInsights(rows: PeriodRow[], result: SolverResult) {
  const peak = rows.reduce((a, b) => (b.blocks > a.blocks ? b : a), rows[0]);
  const topNpv = rows.reduce((a, b) => (b.npv > a.npv ? b : a), rows[0]);
  
  // Calculate total ore across all rows for global tracking
  const totalOre = rows.reduce((sum, row) => sum + row.ore, 0);
  
  const orePct = result.blockCount
    ? ((totalOre / result.blockCount) * 100).toFixed(1)
    : '0';

  return {
    peakPeriod: peak?.period ?? '—',
    peakBlocks: peak?.blocks ?? 0,
    topNpvPeriod: topNpv?.period ?? '—',
    orePct,
    avgBlocks: rows.length ? Math.round(result.blockCount / rows.length) : 0,
  };
}