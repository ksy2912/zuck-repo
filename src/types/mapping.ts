export type BraidFieldKey =
  | 'block_id'
  | 'objective'
  | 'precedence'
  | 'destination_id'
  | 'resource_id'
  | 'capacity_used';

export interface FieldMapping {
  braidField: BraidFieldKey;
  userColumn: string | null;
  required: boolean;
  description: string;
}

export interface MappingTemplate {
  name: string;
  mappings: FieldMapping[];
}

export const BRAID_FIELD_DESCRIPTIONS: Record<BraidFieldKey, { description: string; required: boolean }> = {
  block_id: { description: 'Unique integer ID for each block', required: true },
  objective: { description: 'Numeric profit/NPV value for the block', required: true },
  precedence: { description: 'Parent block ID(s), comma-separated or single', required: false },
  destination_id: { description: 'Which destination this row belongs to', required: false },
  resource_id: { description: 'Which resource this row uses', required: false },
  capacity_used: { description: 'How much capacity this block uses (e.g. tonnes)', required: false },
};
