import * as XLSX from 'xlsx';

export async function parseExcel(
  file: File
): Promise<{ rows: Record<string, string>[]; headers: string[] }> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('Excel file contains no sheets');
  }

  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
  });

  if (rawRows.length === 0) {
    return { rows: [], headers: [] };
  }

  const headers = Object.keys(rawRows[0]);
  const rows = rawRows.map((row) => {
    const normalized: Record<string, string> = {};
    for (const key of headers) {
      normalized[key] = row[key] != null ? String(row[key]) : '';
    }
    return normalized;
  });

  return { rows, headers };
}
