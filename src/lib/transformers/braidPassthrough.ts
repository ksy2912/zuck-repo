import type { BraidJSON } from '../../types/braid';

export function parseBraidJSON(raw: string): BraidJSON {
  return JSON.parse(raw) as BraidJSON;
}
