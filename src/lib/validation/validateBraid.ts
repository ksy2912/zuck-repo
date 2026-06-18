import type { BraidBlock, BraidJSON } from '../../types/braid';
import type { ValidationCheck, ValidationResult } from '../../types/validation';
import { detectCycle } from './cycleDetection';
import { computeHealthScore } from './healthScore';
import { buildBraidJSON } from '../mapping/mappingEngine';
import { validateBraidInputSchema } from './braidSchema';

export function validateBraid(
  blocks: BraidBlock[],
  fullJson?: BraidJSON
): ValidationResult {
  const checks: ValidationCheck[] = [];
  const blockIds = blocks.map((b) => b.id);
  const idSet = new Set(blockIds);

  const braidJson = fullJson ?? buildBraidJSON(blocks);
  const totalResources = braidJson.resources.length;
  const totalPeriods = braidJson.resources[0]?.upper_capacity.length ?? 6;

  // CHECK 0 — Official input JSON schema (Zod)
  const schemaResult = validateBraidInputSchema(braidJson);
  checks.push({
    id: 'input_schema',
    label: 'Input JSON schema valid',
    status: schemaResult.success ? 'pass' : 'fail',
    detail: schemaResult.success
      ? 'Matches Decisions 360 BRAID input schema (blocks, resources, parameters)'
      : `Schema errors: ${schemaResult.errors.slice(0, 3).join('; ')}`,
    affectedCount: schemaResult.success ? undefined : schemaResult.errors.length,
  });

  // CHECK 1 — Block IDs unique
  const seen = new Set<number>();
  const duplicates: number[] = [];
  for (const id of blockIds) {
    if (seen.has(id)) duplicates.push(id);
    seen.add(id);
  }
  checks.push({
    id: 'unique_ids',
    label: 'Block IDs unique',
    status: duplicates.length === 0 ? 'pass' : 'fail',
    detail:
      duplicates.length === 0
        ? `All ${blocks.length.toLocaleString()} block IDs are unique`
        : `Duplicates found: ${[...new Set(duplicates)].slice(0, 5).join(', ')}`,
    affectedCount: duplicates.length > 0 ? duplicates.length : undefined,
  });

  // CHECK 2 — Block IDs non-null
  const badIds = blocks.filter((b) => b.id == null || isNaN(b.id)).length;
  checks.push({
    id: 'non_null_ids',
    label: 'Block IDs non-null',
    status: badIds === 0 ? 'pass' : 'fail',
    detail: badIds === 0 ? 'All block IDs are valid numbers' : `${badIds} blocks have invalid IDs`,
    affectedCount: badIds > 0 ? badIds : undefined,
  });

  // CHECK 3 — Objectives exist
  const missingObjective = blocks.filter(
    (b) => !b.destinations.some((d) => typeof d.objective === 'number' && !isNaN(d.objective))
  ).length;
  checks.push({
    id: 'objectives',
    label: 'Objectives exist',
    status: missingObjective === 0 ? 'pass' : 'warn',
    detail:
      missingObjective === 0
        ? 'Every block has a numeric objective'
        : `${missingObjective} blocks missing objective value — will use 0`,
    affectedCount: missingObjective > 0 ? missingObjective : undefined,
  });

  // CHECK 4 — Precedence references valid
  const brokenRefs: string[] = [];
  for (const block of blocks) {
    for (const pred of block.precedence) {
      if (!idSet.has(pred)) brokenRefs.push(`${pred} (referenced by ${block.id})`);
    }
  }
  checks.push({
    id: 'precedence_valid',
    label: 'Precedence references valid',
    status: brokenRefs.length === 0 ? 'pass' : 'fail',
    detail:
      brokenRefs.length === 0
        ? 'All precedence references point to existing blocks'
        : `Broken refs: ${brokenRefs.slice(0, 5).join('; ')}`,
    affectedCount: brokenRefs.length > 0 ? brokenRefs.length : undefined,
  });

  // CHECK 5 — No cycles
  const cycle = detectCycle(blocks);
  checks.push({
    id: 'no_cycles',
    label: 'No cycles in precedence graph',
    status: cycle === null ? 'pass' : 'fail',
    detail: cycle === null ? 'Precedence graph is a valid DAG' : `Cycle detected: ${cycle}`,
  });

  // CHECK 6 — Destinations valid
  const noDest = blocks.filter((b) => b.destinations.length === 0).length;
  checks.push({
    id: 'destinations',
    label: 'Destinations valid',
    status: noDest === 0 ? 'pass' : 'warn',
    detail:
      noDest === 0
        ? 'Every block has at least one destination'
        : `${noDest} blocks have no destinations`,
    affectedCount: noDest > 0 ? noDest : undefined,
  });

  // CHECK 7 — Resource capacity non-negative
  let negativeCount = 0;
  for (const block of blocks) {
    for (const dest of block.destinations) {
      for (const res of dest.resources) {
        if (res.capacity_used < 0) negativeCount++;
      }
    }
  }
  checks.push({
    id: 'capacity_nonneg',
    label: 'Resource capacity non-negative',
    status: negativeCount === 0 ? 'pass' : 'fail',
    detail:
      negativeCount === 0
        ? 'All capacity_used values are >= 0'
        : `${negativeCount} negative capacity values found`,
    affectedCount: negativeCount > 0 ? negativeCount : undefined,
  });

  const score = computeHealthScore(checks);
  const fails = checks.filter((c) => c.status === 'fail').length;

  return {
    checks,
    totalBlocks: blocks.length,
    totalResources,
    totalPeriods,
    isValid: fails === 0,
    score,
  };
}
