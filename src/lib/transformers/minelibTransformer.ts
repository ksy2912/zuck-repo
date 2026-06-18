import type { BraidBlock } from '../../types/braid';
import type { FieldMapping } from '../../types/mapping';
import { applyMapping } from '../mapping/mappingEngine';

export function transformMineLib(
  rows: Record<string, string>[],
  mapping: FieldMapping[]
): BraidBlock[] {
  return applyMapping(rows, mapping);
}
