import Papa from 'papaparse';

export function parseCSVStream(
  file: File,
  onChunk: (totalSoFar: number) => void,
  onComplete: (allRows: Record<string, string>[], headers: string[]) => void,
  onError: (error: string) => void
): void {
  const allRows: Record<string, string>[] = [];
  let headers: string[] = [];
  const CHUNK_SIZE = 10_000;

  Papa.parse<Record<string, string>>(file, {
    header: true,
    skipEmptyLines: true,
    step(results, parser) {
      if (results.errors.length > 0) {
        parser.abort();
        onError(results.errors[0]?.message ?? 'CSV parsing error');
        return;
      }

      const row = results.data;
      if (!row || Object.keys(row).length === 0) return;

      if (headers.length === 0) {
        headers = Object.keys(row);
      }

      const normalized: Record<string, string> = {};
      for (const key of headers) {
        normalized[key] = row[key] != null ? String(row[key]) : '';
      }

      allRows.push(normalized);

      if (allRows.length % CHUNK_SIZE === 0) {
        onChunk(allRows.length);
      }
    },
    complete() {
      if (allRows.length % CHUNK_SIZE !== 0) {
        onChunk(allRows.length);
      }
      onComplete(allRows, headers);
    },
    error(err) {
      onError(err.message ?? 'Failed to parse CSV file');
    },
  });
}
