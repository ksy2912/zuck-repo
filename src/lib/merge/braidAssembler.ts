import type { BraidBlock, BraidJSON, BraidDestination } from '../../types/braid';
import type { CompletenessReport, DataFragment, MultiFileResult, ResourceCoeff } from '../../types/fragments';

function mergePrecedence(fragments: DataFragment[]): Map<number, number[]> {
  const merged = new Map<number, number[]>();
  for (const f of fragments) {
    if (!f.precedence) continue;
    for (const [id, preds] of f.precedence) {
      merged.set(id, preds);
    }
  }
  return merged;
}

function mergeObjectives(fragments: DataFragment[]): Map<number, number[]> {
  const merged = new Map<number, number[]>();
  for (const f of fragments) {
    if (!f.objectives) continue;
    for (const [id, objs] of f.objectives) {
      merged.set(id, objs);
    }
  }
  return merged;
}

function mergeResourceCoeffs(fragments: DataFragment[]): ResourceCoeff[] {
  const all: ResourceCoeff[] = [];
  for (const f of fragments) {
    if (f.resourceCoeffs) all.push(...f.resourceCoeffs);
  }
  return all;
}

function coeffsForBlockDest(
  coeffs: ResourceCoeff[],
  blockId: number,
  destId: number
): ResourceCoeff[] {
  return coeffs.filter((c) => c.blockId === blockId && c.destinationId === destId);
}

function resourcesForDestination(
  coeffs: ResourceCoeff[],
  blockId: number,
  destId: number,
  nResources: number
): BraidDestination['resources'] {
  const destCoeffs = coeffsForBlockDest(coeffs, blockId, destId);
  if (destCoeffs.length > 0) {
    return destCoeffs.map((c) => ({ id: c.resourceId, capacity_used: c.capacityUsed }));
  }

  if (nResources > 0) {
    return Array.from({ length: nResources }, (_, id) => ({ id, capacity_used: 0 }));
  }

  return [{ id: 0, capacity_used: 0 }];
}

function buildBlocks(
  blockIds: number[],
  precedence: Map<number, number[]>,
  objectives: Map<number, number[]>,
  coeffs: ResourceCoeff[],
  nDestinations: number,
  nResources: number
): BraidBlock[] {
  return blockIds.map((id) => {
    const objs = objectives.get(id) ?? [0];
    const destinations: BraidDestination[] = [];

    for (let d = 0; d < Math.max(nDestinations, objs.length); d++) {
      destinations.push({
        id: d,
        objective: objs[d] ?? objs[0] ?? 0,
        resources: resourcesForDestination(coeffs, id, d, nResources),
      });
    }

    return {
      id,
      precedence: precedence.get(id) ?? [],
      destinations,
    };
  });
}

function blocksToPreviewRows(blocks: BraidBlock[]): {
  rows: Record<string, string>[];
  headers: string[];
} {
  const headers = ['block_id', 'objective', 'precedence', 'destinations'];
  const rows = blocks.map((b) => ({
    block_id: String(b.id),
    objective: String(b.destinations[0]?.objective ?? 0),
    precedence: b.precedence.join(','),
    destinations: String(b.destinations.length),
  }));
  return { rows, headers };
}

function assessCompleteness(
  blocks: BraidBlock[],
  braid: Partial<BraidJSON>
): CompletenessReport {
  const missing: string[] = [];
  const hasBlockIds = blocks.length > 0;
  const hasObjectives = blocks.some((b) =>
    b.destinations.some((d) => typeof d.objective === 'number' && !isNaN(d.objective))
  );
  const hasPrecedence = blocks.some((b) => b.precedence.length > 0);
  const hasResourceCoeffs = blocks.some((b) =>
    b.destinations.some((d) => d.resources.some((r) => r.capacity_used > 0))
  );
  const hasResourceLimits = (braid.resources?.length ?? 0) > 0;
  const hasDiscountRate = braid.parameters?.discount_rate != null;

  if (!hasBlockIds) missing.push('Block IDs / objectives');
  if (!hasObjectives) missing.push('Objective values per block');
  if (!hasPrecedence) missing.push('Precedence (optional — using empty for all blocks)');
  if (!hasResourceCoeffs) missing.push('Resource capacity coefficients (optional)');
  if (!hasResourceLimits) missing.push('Resource period limits (optional)');
  if (!hasDiscountRate) missing.push('Discount rate (optional)');

  const readyForBraid = hasBlockIds && hasObjectives;

  return {
    hasBlockIds,
    hasObjectives,
    hasPrecedence,
    hasResourceCoeffs,
    hasResourceLimits,
    hasDiscountRate,
    blockCount: blocks.length,
    readyForBraid,
    missing,
  };
}

const ROLE_LABELS: Record<string, string> = {
  pcpsp_model: 'Model (objectives, resources, limits)',
  precedence: 'Precedence graph',
  braid_json: 'BRAID JSON',
  tabular: 'Tabular block data',
  unknown: 'Unrecognized format',
};

export function assembleBraidFromFragments(fragments: DataFragment[]): MultiFileResult {
  // If any fragment is a complete BRAID JSON, start from that
  const fullJson = fragments.find((f) => f.braidJson)?.braidJson;

  if (fullJson && fragments.length === 1) {
    const { rows, headers } = blocksToPreviewRows(fullJson.blocks);
    const completeness = assessCompleteness(fullJson.blocks, fullJson);
    return {
      braidJson: fullJson,
      fragments,
      manifest: fragments.map((f) => ({
        fileName: f.sourceFile,
        role: f.role,
        contributes: [ROLE_LABELS[f.role] ?? f.role],
      })),
      completeness,
      previewRows: rows,
      previewHeaders: headers,
      fileNames: fragments.map((f) => f.sourceFile),
      totalSizeMB: 0,
    };
  }

  const precedence = mergePrecedence(fragments);
  const objectives = mergeObjectives(fragments);
  const coeffs = mergeResourceCoeffs(fragments);

  let nDestinations = 1;
  let nPeriods = 0;
  let nResources = 0;
  for (const f of fragments) {
    if (f.nDestinations) nDestinations = Math.max(nDestinations, f.nDestinations);
    if (f.nPeriods) nPeriods = Math.max(nPeriods, f.nPeriods);
    if (f.nResources) nResources = Math.max(nResources, f.nResources);
  }
  for (const objs of objectives.values()) {
    nDestinations = Math.max(nDestinations, objs.length);
  }
  for (const c of coeffs) {
    nResources = Math.max(nResources, c.resourceId + 1);
  }

  const blockIdSet = new Set<number>();
  for (const id of objectives.keys()) blockIdSet.add(id);
  for (const id of precedence.keys()) blockIdSet.add(id);
  for (const c of coeffs) blockIdSet.add(c.blockId);
  if (fullJson) fullJson.blocks.forEach((b) => blockIdSet.add(b.id));

  const blockIds = [...blockIdSet].sort((a, b) => a - b);
  let blocks = buildBlocks(blockIds, precedence, objectives, coeffs, nDestinations, nResources);

  // Overlay precedence/objectives from full JSON if present
  if (fullJson) {
    const jsonBlockMap = new Map(fullJson.blocks.map((b) => [b.id, b]));
    blocks = blocks.map((b) => {
      const fromJson = jsonBlockMap.get(b.id);
      if (!fromJson) return b;
      return {
        ...b,
        precedence: precedence.has(b.id) ? b.precedence : fromJson.precedence,
        destinations:
          objectives.has(b.id) && (objectives.get(b.id)?.length ?? 0) > 0
            ? b.destinations
            : fromJson.destinations,
      };
    });
    for (const jb of fullJson.blocks) {
      if (!blockIds.includes(jb.id)) blocks.push(jb);
    }
    blocks.sort((a, b) => a.id - b.id);
  }

  let resourceDefs = fragments.find((f) => f.resourceDefs?.length)?.resourceDefs;
  if (!resourceDefs && fullJson?.resources) resourceDefs = fullJson.resources;
  if (!resourceDefs && (nResources > 0 || nPeriods > 0)) {
    const resCount = Math.max(nResources, fullJson?.resources.length ?? 0, 1);
    const periodCount = Math.max(
      nPeriods,
      fullJson?.resources[0]?.upper_capacity.length ?? 0
    );
    resourceDefs = Array.from({ length: resCount }, (_, id) => ({
      id,
      lower_capacity: Array(periodCount).fill(0),
      upper_capacity: Array(periodCount).fill(0),
    }));
  }

  const discountRate =
    fragments.find((f) => f.discountRate != null)?.discountRate ??
    fullJson?.parameters.discount_rate ??
    0;

  const braidJson: BraidJSON = {
    blocks,
    resources: resourceDefs ?? [],
    parameters: { discount_rate: discountRate },
  };
  const completeness = assessCompleteness(blocks, braidJson);
  const { rows, headers } = blocksToPreviewRows(blocks);

  const manifest = fragments.map((f) => {
    const contributes: string[] = [ROLE_LABELS[f.role] ?? f.role];
    if (f.precedence?.size) contributes.push(`${f.precedence.size.toLocaleString()} precedence rows`);
    if (f.objectives?.size) contributes.push(`${f.objectives.size.toLocaleString()} block objectives`);
    if (f.resourceCoeffs?.length) contributes.push(`${f.resourceCoeffs.length.toLocaleString()} capacity coeffs`);
    if (f.resourceDefs?.length) contributes.push(`${f.resourceDefs.length} resource limits`);
    if (f.discountRate != null) contributes.push(`discount ${(f.discountRate * 100).toFixed(0)}%`);
    return { fileName: f.sourceFile, role: f.role, contributes };
  });

  return {
    braidJson: completeness.readyForBraid ? braidJson : null,
    fragments,
    manifest,
    completeness,
    previewRows: rows,
    previewHeaders: headers,
    fileNames: fragments.map((f) => f.sourceFile),
    totalSizeMB: 0,
  };
}
