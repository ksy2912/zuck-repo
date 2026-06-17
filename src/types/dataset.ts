export type DetectedFormat =
  | 'BRAID_JSON'
  | 'MineLib'
  | 'Generic_CSV'
  | 'Excel'
  | 'Unknown';

export type ColumnType = 'integer' | 'float' | 'string' | 'boolean';

export interface ColumnMeta {
  name: string;
  type: ColumnType;
  nullCount: number;
  sample: string[];
}

export interface ParsedDataset {
  fileName: string;
  fileSizeMB: number;
  format: DetectedFormat;
  rowCount: number;
  columns: ColumnMeta[];
  rows: Record<string, string>[];
  rawHeaders: string[];
}
