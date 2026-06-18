import Papa from 'papaparse';

export function parseCSVToRows(
  file: File
): Promise<{ rows: Record<string, string>[]; headers: string[] }> {
  return new Promise((resolve, reject) => {
    const allRows: Record<string, string>[] = [];
    let headers: string[] = [];

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      step(results) {
        const row = results.data;
        if (!row || Object.keys(row).length === 0) return;
        if (headers.length === 0) headers = Object.keys(row);
        const normalized: Record<string, string> = {};
        for (const key of headers) {
          normalized[key] = row[key] != null ? String(row[key]) : '';
        }
        allRows.push(normalized);
      },
      complete() {
        resolve({ rows: allRows, headers });
      },
      error(err) {
        reject(new Error(err.message ?? 'CSV parse error'));
      },
    });
  });
}
