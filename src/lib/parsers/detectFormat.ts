import type { DetectedFormat } from '../../types/dataset';

const MINELIB_HEADERS = [
  'block_id', 'profit', 'tonnes', 'parent',
  'BlockID', 'Value', 'Parent', 'parent_id',
];

export function detectFormat(
  headers: string[],
  context: { extension: string; isBraidJson?: boolean }
): DetectedFormat {
  if (context.isBraidJson) return 'BRAID_JSON';

  const normalizedHeaders = headers.map((h) => h.toLowerCase());
  const hasMineLibColumn = MINELIB_HEADERS.some((col) =>
    normalizedHeaders.includes(col.toLowerCase())
  );
  if (hasMineLibColumn) return 'MineLib';

  const ext = context.extension.toLowerCase();
  if (ext === '.xlsx' || ext === '.xls') return 'Excel';
  if (headers.length > 0 && ext === '.csv') return 'Generic_CSV';

  return 'Unknown';
}
