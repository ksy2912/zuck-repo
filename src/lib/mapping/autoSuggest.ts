import Fuse from 'fuse.js';
import type { BraidFieldKey, FieldMapping } from '../../types/mapping';
import { BRAID_FIELD_DESCRIPTIONS } from '../../types/mapping';

const BRAID_FIELD_ALIASES: Record<BraidFieldKey, string[]> = {
  block_id: ['block_id', 'blockid', 'id', 'block', 'blk_id', 'BlockID', 'BLOCK', 'BlkID'],
  objective: ['objective', 'profit', 'value', 'npv', 'revenue', 'obj', 'Profit', 'Value', 'NPV_Value'],
  precedence: ['precedence', 'parent', 'parent_id', 'pred', 'ParentID', 'predecessor', 'ParentBlk', 'parentblk'],
  destination_id: ['destination', 'dest', 'dest_id', 'destination_id'],
  resource_id: ['resource', 'resource_id', 'res_id'],
  capacity_used: ['capacity_used', 'capacity', 'tonnes', 'tons', 'mass', 'weight', 'Tonnes'],
};

const ALL_FIELDS: BraidFieldKey[] = [
  'block_id', 'objective', 'precedence', 'destination_id', 'resource_id', 'capacity_used',
];

export function autoSuggestMappings(userColumns: string[]): FieldMapping[] {
  const usedColumns = new Set<string>();

  return ALL_FIELDS.map((braidField) => {
    const aliases = BRAID_FIELD_ALIASES[braidField];
    const fuse = new Fuse(aliases, { includeScore: true, threshold: 0.4 });

    let bestColumn: string | null = null;
    let bestScore = 1;

    for (const col of userColumns) {
      if (usedColumns.has(col)) continue;
      const results = fuse.search(col);
      if (results.length > 0 && results[0].score != null && results[0].score < bestScore) {
        bestScore = results[0].score;
        bestColumn = col;
      }
    }

    if (bestColumn && bestScore < 0.4) {
      usedColumns.add(bestColumn);
    } else {
      bestColumn = null;
    }

    const meta = BRAID_FIELD_DESCRIPTIONS[braidField];
    return {
      braidField,
      userColumn: bestColumn,
      required: meta.required,
      description: meta.description,
    };
  });
}
