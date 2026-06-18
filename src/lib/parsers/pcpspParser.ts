import type { BraidResourceDef } from '../../types/braid';
import type { ResourceCoeff } from '../../types/fragments';

export interface PcpspModel {
  name: string;
  nBlocks: number;
  nPeriods: number;
  nDestinations: number;
  nResources: number;
  discountRate: number;
  objectives: Map<number, number[]>;
  resourceCoeffs: ResourceCoeff[];
  resourceDefs: BraidResourceDef[];
}

/** Read data lines until the next section header or EOF. Skips blank lines within a section. */
function parseSectionLines(text: string, sectionName: string): string[] {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((l) => l.trim() === sectionName);
  if (start < 0) return [];

  const result: string[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === 'EOF') break;
    if (!line) continue;
    if (line.endsWith(':') && !line.includes(' ')) break;
    result.push(line);
  }
  return result;
}

function parseHeader(text: string): Record<string, string> {
  const header: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.endsWith(':') && !trimmed.includes(' ')) break;
    const match = trimmed.match(/^([A-Z_]+):\s*(.+)$/);
    if (match) header[match[1]] = match[2].trim();
  }
  return header;
}

function parseIntHeader(header: Record<string, string>, key: string, fallback: number): number {
  const value = parseInt(header[key] ?? '', 10);
  return Number.isFinite(value) ? value : fallback;
}

function parseFloatHeader(header: Record<string, string>, key: string): number | undefined {
  const value = parseFloat(header[key] ?? '');
  return Number.isFinite(value) ? value : undefined;
}

export function parsePcpspFile(text: string): PcpspModel {
  const header = parseHeader(text);
  const nBlocks = parseIntHeader(header, 'NBLOCKS', 0);
  const nPeriods = parseIntHeader(header, 'NPERIODS', 0);
  const nDestinations = parseIntHeader(header, 'NDESTINATIONS', 1);
  const nResources = parseIntHeader(header, 'NRESOURCE_SIDE_CONSTRAINTS', 0);
  const discountRate = parseFloatHeader(header, 'DISCOUNT_RATE') ?? 0;

  const objectives = new Map<number, number[]>();
  for (const line of parseSectionLines(text, 'OBJECTIVE_FUNCTION:')) {
    const parts = line.split(/\s+/).map(Number);
    if (parts.length < 2 || isNaN(parts[0])) continue;
    objectives.set(parts[0], parts.slice(1, 1 + nDestinations));
  }

  const resourceCoeffs: ResourceCoeff[] = [];
  for (const line of parseSectionLines(text, 'RESOURCE_CONSTRAINT_COEFFICIENTS:')) {
    const parts = line.split(/\s+/).map(Number);
    if (parts.length < 4 || isNaN(parts[0])) continue;

    resourceCoeffs.push({
      blockId: parts[0],
      destinationId: parts[1],
      resourceId: parts[2],
      capacityUsed: parts[3],
    });
  }

  const limitsByResource = new Map<number, number[]>();
  for (const line of parseSectionLines(text, 'RESOURCE_CONSTRAINT_LIMITS:')) {
    const parts = line.split(/\s+/);
    if (parts.length < 4) continue;
    const resId = parseInt(parts[0], 10);
    const period = parseInt(parts[1], 10);
    const limit = parseFloat(parts[3]);
    if (isNaN(resId) || isNaN(period) || isNaN(limit)) continue;

    if (!limitsByResource.has(resId)) {
      limitsByResource.set(resId, Array(Math.max(nPeriods, period + 1)).fill(0));
    }
    const arr = limitsByResource.get(resId)!;
    if (period >= arr.length) {
      arr.push(...Array(period - arr.length + 1).fill(0));
    }
    arr[period] = limit;
  }

  const resourceIdSet = new Set<number>();
  for (let r = 0; r < nResources; r++) resourceIdSet.add(r);
  for (const resId of limitsByResource.keys()) resourceIdSet.add(resId);
  for (const c of resourceCoeffs) resourceIdSet.add(c.resourceId);

  const resourceIds = [...resourceIdSet].sort((a, b) => a - b);
  const periodsFromLimits = Math.max(
    nPeriods,
    ...[...limitsByResource.values()].map((arr) => arr.length),
    0
  );

  const resourceDefs: BraidResourceDef[] = resourceIds.map((id) => ({
    id,
    lower_capacity: Array(periodsFromLimits).fill(0),
    upper_capacity: limitsByResource.get(id) ?? Array(periodsFromLimits).fill(0),
  }));

  return {
    name: header.NAME ?? 'unknown',
    nBlocks,
    nPeriods: periodsFromLimits,
    nDestinations,
    nResources: resourceIds.length,
    discountRate,
    objectives,
    resourceCoeffs,
    resourceDefs,
  };
}

export function isPcpspContent(text: string): boolean {
  return text.includes('TYPE: PCPSP') || text.includes('OBJECTIVE_FUNCTION:');
}
