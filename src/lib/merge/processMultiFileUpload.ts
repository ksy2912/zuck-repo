import type { MultiFileResult } from '../../types/fragments';
import { assembleBraidFromFragments } from './braidAssembler';
import { parseFileToFragment } from './parseFileFragment';

export async function processMultiFileUpload(files: File[]): Promise<MultiFileResult> {
  if (files.length === 0) {
    throw new Error('No files selected');
  }

  const fragments = await Promise.all(files.map(parseFileToFragment));
  const result = assembleBraidFromFragments(fragments);
  result.totalSizeMB = files.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024);
  return result;
}

export function isMultiFileCapable(files: File[]): boolean {
  return files.length > 1;
}

export function getSuggestedPairing(files: File[]): string | null {
  const bases = files.map((f) => {
    const name = f.name.toLowerCase();
    const dot = name.lastIndexOf('.');
    return dot > 0 ? name.slice(0, dot) : name;
  });
  const unique = new Set(bases);
  if (files.length === 2 && unique.size === 1) {
    return `Matched pair: ${bases[0]}.*`;
  }
  if (files.some((f) => f.name.endsWith('.pcpsp')) && files.some((f) => f.name.endsWith('.prec'))) {
    return 'PCPSP + precedence pair detected';
  }
  return null;
}
