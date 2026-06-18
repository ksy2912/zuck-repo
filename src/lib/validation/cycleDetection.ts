import type { BraidBlock } from '../../types/braid';

export function detectCycle(blocks: BraidBlock[]): string | null {
  const blockIds = new Set(blocks.map((b) => b.id));
  const adj = new Map<number, number[]>();

  for (const block of blocks) {
    adj.set(
      block.id,
      block.precedence.filter((p) => blockIds.has(p))
    );
  }

  const visited = new Set<number>();
  const inStack = new Set<number>();
  const parent = new Map<number, number>();

  for (const startId of blockIds) {
    if (visited.has(startId)) continue;

    const stack: number[] = [startId];
    visited.add(startId);
    inStack.add(startId);

    while (stack.length > 0) {
      const node = stack[stack.length - 1];
      const neighbors = adj.get(node) ?? [];
      let advanced = false;

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          inStack.add(neighbor);
          parent.set(neighbor, node);
          stack.push(neighbor);
          advanced = true;
          break;
        }
        if (inStack.has(neighbor)) {
          const cycle: number[] = [neighbor];
          let current = node;
          while (current !== neighbor) {
            cycle.unshift(current);
            current = parent.get(current) ?? neighbor;
          }
          cycle.unshift(neighbor);
          return cycle.join(' → ');
        }
      }

      if (!advanced) {
        inStack.delete(stack.pop()!);
      }
    }
  }

  return null;
}
