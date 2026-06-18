import type { BraidJSON } from '../../types/braid';

function isBraidJson(data: unknown): data is BraidJSON {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return 'blocks' in obj && 'resources' in obj && 'parameters' in obj;
}

function flattenBraidJson(data: BraidJSON): {
  rows: Record<string, string>[];
  headers: string[];
} {
  const headers = ['block_id', 'objective', 'precedence', 'destination_id'];
  const rows = data.blocks.map((block) => {
    const dest = block.destinations?.[0];
    return {
      block_id: String(block.id),
      objective: dest?.objective != null ? String(dest.objective) : '',
      precedence: (block.precedence ?? []).join(','),
      destination_id: dest?.id != null ? String(dest.id) : '0',
    };
  });
  return { rows, headers };
}

export function parseRawBraidJSON(text: string): BraidJSON {
  const parsed: unknown = JSON.parse(text);
  if (!isBraidJson(parsed)) throw new Error('Not a valid BRAID JSON file');
  return parsed;
}

export async function parseJSON(
  file: File
): Promise<{
  rows: Record<string, string>[];
  headers: string[];
  isBraidJson: boolean;
  braidJson?: BraidJSON;
}> {
  const text = await file.text();
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON file');
  }

  if (isBraidJson(parsed)) {
    const { rows, headers } = flattenBraidJson(parsed);
    return { rows, headers, isBraidJson: true, braidJson: parsed };
  }

  if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
    const headers = Object.keys(parsed[0] as Record<string, unknown>);
    const rows = parsed.map((item) => {
      const obj = item as Record<string, unknown>;
      const normalized: Record<string, string> = {};
      for (const key of headers) {
        normalized[key] = obj[key] != null ? String(obj[key]) : '';
      }
      return normalized;
    });
    return { rows, headers, isBraidJson: false };
  }

  throw new Error('Unsupported JSON structure — expected BRAID format or array of objects');
}
