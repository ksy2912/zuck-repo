import type { ColumnMeta, ColumnType } from '../types/dataset';

function isNullValue(value: string): boolean {
  const trimmed = value.trim();
  return trimmed === '' || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined';
}

function inferType(values: string[]): ColumnType {
  const nonNull = values.filter((v) => !isNullValue(v));
  if (nonNull.length === 0) return 'string';

  const allInteger = nonNull.every((v) => /^-?\d+$/.test(v.trim()));
  if (allInteger) return 'integer';

  const allFloat = nonNull.every((v) => /^-?\d+(\.\d+)?$/.test(v.trim()));
  if (allFloat) return 'float';

  const allBoolean = nonNull.every((v) => {
    const lower = v.trim().toLowerCase();
    return lower === 'true' || lower === 'false' || lower === '0' || lower === '1';
  });
  if (allBoolean) return 'boolean';

  return 'string';
}

export function inferColumnTypes(
  headers: string[],
  sampleRows: Record<string, string>[]
): ColumnMeta[] {
  const sample = sampleRows.slice(0, 500);

  return headers.map((name) => {
    const values = sample.map((row) => row[name] ?? '');
    const nullCount = values.filter(isNullValue).length;
    const nonNullSamples = values.filter((v) => !isNullValue(v)).slice(0, 3);

    return {
      name,
      type: inferType(values),
      nullCount,
      sample: nonNullSamples,
    };
  });
}
