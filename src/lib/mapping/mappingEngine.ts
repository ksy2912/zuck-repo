import type { BraidBlock, BraidJSON } from '../../types/braid';
import type { FieldMapping } from '../../types/mapping';

function getColumn(row: Record<string, string>, mapping: FieldMapping[], key: FieldMapping['braidField']): string {
  const field = mapping.find((m) => m.braidField === key);
  return field?.userColumn ? (row[field.userColumn] ?? '') : '';
}

function parsePrecedence(value: string): number[] {
  if (!value.trim()) return [];
  return value
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n));
}

export function applyMapping(
  rows: Record<string, string>[],
  mapping: FieldMapping[]
): BraidBlock[] {
  return rows.map((row) => {
    const blockId = parseInt(getColumn(row, mapping, 'block_id'), 10) || 0;
    const objective = parseFloat(getColumn(row, mapping, 'objective')) || 0;
    const precedence = parsePrecedence(getColumn(row, mapping, 'precedence'));
    const destId = parseInt(getColumn(row, mapping, 'destination_id'), 10);
    const resourceId = parseInt(getColumn(row, mapping, 'resource_id'), 10);
    const capacityUsed = parseFloat(getColumn(row, mapping, 'capacity_used')) || 0;

    return {
      id: blockId,
      precedence,
      destinations: [
        {
          id: isNaN(destId) ? 0 : destId,
          objective,
          resources: [{ id: isNaN(resourceId) ? 0 : resourceId, capacity_used: capacityUsed }],
        },
      ],
    };
  });
}

function collectResourceIds(blocks: BraidBlock[]): number[] {
  const ids = new Set<number>();
  for (const block of blocks) {
    for (const dest of block.destinations) {
      for (const res of dest.resources) {
        ids.add(res.id);
      }
    }
  }
  if (ids.size === 0) ids.add(0);
  return [...ids].sort((a, b) => a - b);
}

function inferPeriods(existing?: BraidJSON['resources']): number {
  if (existing?.[0]?.upper_capacity.length) {
    return existing[0].upper_capacity.length;
  }
  return 0;
}

/** Build BRAID JSON from mapped blocks, preserving resource limits from uploaded data when present. */
export function buildBraidJSON(
  blocks: BraidBlock[],
  discountRate = 0,
  existingResources?: BraidJSON['resources']
): BraidJSON {
  const resourceIds = collectResourceIds(blocks);
  const periods = inferPeriods(existingResources);

  const resources = existingResources?.length
    ? existingResources
    : resourceIds.map((id) => ({
        id,
        lower_capacity: Array(periods).fill(0),
        upper_capacity: Array(periods).fill(0),
      }));

  return {
    blocks,
    resources,
    parameters: { discount_rate: discountRate },
  };
}

/** Merge transformed blocks with resources/parameters from an uploaded BRAID JSON file */
export function mergeWithPassthrough(
  blocks: BraidBlock[],
  passthrough: BraidJSON,
  discountRate?: number
): BraidJSON {
  return {
    blocks: passthrough.blocks.length > 0 && blocks.length === 0 ? passthrough.blocks : blocks,
    resources: passthrough.resources,
    parameters: {
      discount_rate: discountRate ?? passthrough.parameters.discount_rate,
    },
  };
}
