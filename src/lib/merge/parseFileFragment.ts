import type { DataFragment, FileRole } from '../../types/fragments';
import { parsePcpspFile, isPcpspContent } from '../parsers/pcpspParser';
import { parsePrecFile } from '../parsers/precParser';
import { parseJSON, parseRawBraidJSON } from '../parsers/jsonParser';
import { parseExcel } from '../parsers/excelParser';
import { parseCSVToRows } from '../parsers/csvToRows';

function getExt(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot).toLowerCase() : '';
}

function tabularToObjectives(
  rows: Record<string, string>[],
  headers: string[]
): Map<number, number[]> | undefined {
  const blockCol = headers.find((h) =>
    /block.?id|^id$|blockid/i.test(h)
  );
  const objCol = headers.find((h) =>
    /objective|profit|value|npv/i.test(h)
  );
  if (!blockCol) return undefined;

  const objectives = new Map<number, number[]>();
  for (const row of rows) {
    const id = parseInt(row[blockCol], 10);
    if (isNaN(id)) continue;
    const obj = objCol ? parseFloat(row[objCol]) : 0;
    objectives.set(id, [isNaN(obj) ? 0 : obj]);
  }
  return objectives.size > 0 ? objectives : undefined;
}

function tabularToPrecedence(
  rows: Record<string, string>[],
  headers: string[]
): Map<number, number[]> | undefined {
  const blockCol = headers.find((h) => /block.?id|^id$/i.test(h));
  const precCol = headers.find((h) =>
    /precedence|parent|pred|predecessor/i.test(h)
  );
  if (!blockCol || !precCol) return undefined;

  const precedence = new Map<number, number[]>();
  for (const row of rows) {
    const id = parseInt(row[blockCol], 10);
    if (isNaN(id)) continue;
    const raw = row[precCol] ?? '';
    const preds = raw
      .split(/[,;\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((p) => !isNaN(p) && p !== id);
    if (preds.length > 0 || raw.trim()) precedence.set(id, preds);
  }
  return precedence.size > 0 ? precedence : undefined;
}

export async function parseFileToFragment(file: File): Promise<DataFragment> {
  const ext = getExt(file.name);
  const base: DataFragment = { sourceFile: file.name, role: 'unknown' };

  if (ext === '.prec') {
    const text = await file.text();
    return {
      ...base,
      role: 'precedence',
      precedence: parsePrecFile(text),
    };
  }

  if (ext === '.pcpsp' || ext === '.pcps') {
    const text = await file.text();
    const model = parsePcpspFile(text);
    return {
      ...base,
      role: 'pcpsp_model',
      objectives: model.objectives,
      resourceCoeffs: model.resourceCoeffs,
      resourceDefs: model.resourceDefs,
      discountRate: model.discountRate,
      nDestinations: model.nDestinations,
      nPeriods: model.nPeriods,
      nResources: model.nResources,
    };
  }

  if (ext === '.json') {
    const text = await file.text();
    try {
      const braid = parseRawBraidJSON(text);
      return { ...base, role: 'braid_json', braidJson: braid, discountRate: braid.parameters.discount_rate };
    } catch {
      const parsed = await parseJSON(file);
      return {
        ...base,
        role: 'tabular',
        rows: parsed.rows,
        headers: parsed.headers,
        objectives: tabularToObjectives(parsed.rows, parsed.headers),
        precedence: tabularToPrecedence(parsed.rows, parsed.headers),
      };
    }
  }

  if (ext === '.csv') {
    const { rows, headers } = await parseCSVToRows(file);
    const text = await file.text();
    if (isPcpspContent(text)) {
      const model = parsePcpspFile(text);
      return {
        ...base,
        role: 'pcpsp_model',
        objectives: model.objectives,
        resourceCoeffs: model.resourceCoeffs,
        resourceDefs: model.resourceDefs,
        discountRate: model.discountRate,
        nDestinations: model.nDestinations,
      };
    }
    return {
      ...base,
      role: 'tabular',
      rows,
      headers,
      objectives: tabularToObjectives(rows, headers),
      precedence: tabularToPrecedence(rows, headers),
    };
  }

  if (ext === '.xlsx' || ext === '.xls') {
    const { rows, headers } = await parseExcel(file);
    return {
      ...base,
      role: 'tabular',
      rows,
      headers,
      objectives: tabularToObjectives(rows, headers),
      precedence: tabularToPrecedence(rows, headers),
    };
  }

  // Sniff content for extensionless or unknown
  const text = await file.text();
  if (isPcpspContent(text)) {
    const model = parsePcpspFile(text);
    return {
      ...base,
      role: 'pcpsp_model',
      objectives: model.objectives,
      resourceCoeffs: model.resourceCoeffs,
      resourceDefs: model.resourceDefs,
      discountRate: model.discountRate,
      nDestinations: model.nDestinations,
      nPeriods: model.nPeriods,
      nResources: model.nResources,
    };
  }

  const lines = text.trim().split(/\r?\n/).slice(0, 5);
  if (lines.every((l) => /^\d+(\s+\d+)*$/.test(l.trim()))) {
    return { ...base, role: 'precedence', precedence: parsePrecFile(text) };
  }

  return base;
}

export function detectFileRole(_fileName: string, fragment: DataFragment): FileRole {
  return fragment.role;
}
