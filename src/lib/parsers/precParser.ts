/** Parse .prec precedence files: each line is `block_id pred1 pred2 ...` */
export function parsePrecFile(text: string): Map<number, number[]> {
  const precedence = new Map<number, number[]>();

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const parts = trimmed.split(/\s+/).map(Number);
    if (parts.length < 1 || isNaN(parts[0])) continue;

    const blockId = parts[0];
    let preds = parts.slice(1).filter((p) => !isNaN(p) && p !== blockId);

    // Convention: lone `0` on block 0 means no predecessors
    if (blockId === 0 && preds.length === 1 && preds[0] === 0) {
      preds = [];
    }

    precedence.set(blockId, preds);
  }

  return precedence;
}
