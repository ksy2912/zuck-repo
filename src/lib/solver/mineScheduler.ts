/**
 * TypeScript port of backend/main.py — SimpleMineScheduler
 * Upload .pcpsp + .prec → schedule blocks → BRAID output JSON + NPV analytics
 */
import type { BraidOutput, BraidOutputRow } from '../../types/braid';
import type { PeriodStat, SolverResult } from '../../types/solver';

interface BlockData {
  id: number;
  profitOre: number;
  profitWaste: number;
}

function parsePrecText(text: string): Map<number, number[]> {
  const predecessors = new Map<number, Set<number>>();

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('%')) continue;

    const parts = trimmed.split(/\s+/).map(Number);
    if (parts.length < 2 || isNaN(parts[0])) continue;

    const blockId = parts[0];
    const nPreds = parts[1];
    const preds = parts.slice(2, 2 + nPreds).filter((p) => !isNaN(p));

    if (!predecessors.has(blockId)) predecessors.set(blockId, new Set());
    for (const p of preds) predecessors.get(blockId)!.add(p);
  }

  const result = new Map<number, number[]>();
  for (const [id, set] of predecessors) {
    result.set(id, [...set]);
  }
  return result;
}

function parsePcpspText(text: string): {
  name: string;
  periods: number;
  destinations: number;
  discountRate: number;
  blocks: Map<number, BlockData>;
} {
  let name = '';
  let periods = 0;
  let destinations = 0;
  let discountRate = 0.1;
  const blocks = new Map<number, BlockData>();
  let readingObj = false;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim().replace(/:/g, ' ');
    const parts = line.split(/\s+/);
    if (!parts.length || line.startsWith('%')) continue;

    const key = parts[0].toUpperCase();

    if (key === 'NAME') name = parts[1] ?? '';
    else if (key === 'NPERIODS') periods = parseInt(parts[1], 10) || 0;
    else if (key === 'NDESTINATIONS') destinations = parseInt(parts[1], 10) || 0;
    else if (key === 'DISCOUNT_RATE') discountRate = parseFloat(parts[1]) || 0;
    else if (key.includes('OBJECTIVE_FUNCTION')) {
      readingObj = true;
      continue;
    }

    if (readingObj) {
      if (['RESOURCE', 'CONSTRAINTS', 'CAPACITY'].some((k) => key.includes(k))) break;
      if (parts.length >= 3) {
        const id = parseInt(parts[0], 10);
        if (!isNaN(id)) {
          blocks.set(id, {
            id,
            profitOre: parseFloat(parts[1]) || 0,
            profitWaste: parseFloat(parts[2]) || 0,
          });
        }
      }
    }
  }

  return { name, periods, destinations, discountRate, blocks };
}

function topologicalSort(
  blockIds: number[],
  predecessors: Map<number, number[]>
): number[] {
  const inDegree = new Map<number, number>();
  const adj = new Map<number, number[]>();

  for (const id of blockIds) {
    inDegree.set(id, 0);
    adj.set(id, []);
  }

  for (const [blockId, preds] of predecessors) {
    if (!inDegree.has(blockId)) {
      inDegree.set(blockId, 0);
      adj.set(blockId, []);
    }
    for (const p of preds) {
      if (!adj.has(p)) {
        adj.set(p, []);
        inDegree.set(p, inDegree.get(p) ?? 0);
      }
      adj.get(p)!.push(blockId);
      inDegree.set(blockId, (inDegree.get(blockId) ?? 0) + 1);
    }
  }

  const queue: number[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }
  queue.sort((a, b) => a - b);

  const order: number[] = [];
  while (queue.length > 0) {
    const node = queue.shift()!;
    order.push(node);
    for (const next of adj.get(node) ?? []) {
      const deg = (inDegree.get(next) ?? 1) - 1;
      inDegree.set(next, deg);
      if (deg === 0) {
        queue.push(next);
        queue.sort((a, b) => a - b);
      }
    }
  }

  for (const id of blockIds) {
    if (!order.includes(id)) order.push(id);
  }
  return order;
}

export function runMineScheduler(
  pcpspText: string,
  precText: string,
  fileNames: { pcpsp: string; prec: string }
): SolverResult {
  const model = parsePcpspText(pcpspText);
  const predecessors = parsePrecText(precText);

  const T = model.periods;
  const discount = model.discountRate;
  const blocks = model.blocks;

  const allNodes = new Set<number>();
  for (const id of blocks.keys()) allNodes.add(id);
  for (const [id, preds] of predecessors) {
    allNodes.add(id);
    for (const p of preds) allNodes.add(p);
  }

  const topoOrder = topologicalSort([...allNodes], predecessors);
  const blocksPerPeriod = Math.max(50, Math.floor(blocks.size / T) + 1);

  const minedTime = new Map<number, number>();
  const schedule = new Map<number, number[]>();

  for (const b of topoOrder) {
    if (!blocks.has(b)) continue;

    let tMin = 0;
    for (const p of predecessors.get(b) ?? []) {
      if (minedTime.has(p)) tMin = Math.max(tMin, minedTime.get(p)!);
    }

    let scheduled = false;
    for (let t = tMin; t < T; t++) {
      const periodBlocks = schedule.get(t) ?? [];
      if (periodBlocks.length < blocksPerPeriod) {
        minedTime.set(b, t);
        schedule.set(t, [...periodBlocks, b]);
        scheduled = true;
        break;
      }
    }

    if (!scheduled) {
      const finalPeriod = T - 1;
      minedTime.set(b, finalPeriod);
      schedule.set(finalPeriod, [...(schedule.get(finalPeriod) ?? []), b]);
    }
  }

  const output: BraidOutputRow[] = [];
  let oreCount = 0;
  let wasteCount = 0;

  for (const [b, t] of minedTime) {
    const block = blocks.get(b)!;
    const dest = block.profitOre >= block.profitWaste ? 0 : 1;
    if (dest === 0) oreCount++;
    else wasteCount++;
    output.push({ block_id: b, destination: dest, time_period: t });
  }
  output.sort((a, b) => a.time_period - b.time_period || a.block_id - b.block_id);

  const periodStats: PeriodStat[] = [];
  let totalNpv = 0;

  for (let t = 0; t < T; t++) {
    const periodBlocks = schedule.get(t) ?? [];
    let periodNpv = 0;

    for (const b of periodBlocks) {
      const block = blocks.get(b);
      if (!block) continue;
      const profit = Math.max(block.profitOre, block.profitWaste);
      periodNpv += profit / Math.pow(1 + discount, t + 1);
    }

    totalNpv += periodNpv;
    periodStats.push({ period: t, blockCount: periodBlocks.length, npv: periodNpv });
  }

  return {
    name: model.name,
    periods: T,
    destinations: model.destinations,
    discountRate: discount,
    blockCount: blocks.size,
    output,
    totalNpv,
    periodStats,
    destinationSplit: { ore: oreCount, waste: wasteCount },
    fileNames,
  };
}

export async function runSolverFromFiles(
  pcpspFile: File,
  precFile: File
): Promise<SolverResult> {
  const [pcpspText, precText] = await Promise.all([
    pcpspFile.text(),
    precFile.text(),
  ]);
  return runMineScheduler(pcpspText, precText, {
    pcpsp: pcpspFile.name,
    prec: precFile.name,
  });
}
