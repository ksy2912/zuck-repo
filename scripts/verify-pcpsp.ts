import { readFileSync } from 'node:fs';
import { parsePcpspFile } from '../src/lib/parsers/pcpspParser.ts';
import { parsePrecFile } from '../src/lib/parsers/precParser.ts';
import { assembleBraidFromFragments } from '../src/lib/merge/braidAssembler.ts';

function verifyDataset(name: string, pcpspPath: string, precPath: string) {
  const model = parsePcpspFile(readFileSync(pcpspPath, 'utf8'));
  const precedence = parsePrecFile(readFileSync(precPath, 'utf8'));
  const result = assembleBraidFromFragments([
    {
      sourceFile: pcpspPath,
      role: 'pcpsp_model',
      objectives: model.objectives,
      resourceCoeffs: model.resourceCoeffs,
      resourceDefs: model.resourceDefs,
      discountRate: model.discountRate,
      nDestinations: model.nDestinations,
      nPeriods: model.nPeriods,
      nResources: model.nResources,
    },
    { sourceFile: precPath, role: 'precedence', precedence },
  ]);

  const braid = result.braidJson!;
  const block0 = braid.blocks[0];
  const block9 = braid.blocks[9];
  const nonZeroCaps = braid.blocks.flatMap((b) =>
    b.destinations.flatMap((d) => d.resources.map((r) => r.capacity_used))
  ).filter((v) => v > 0).length;

  console.log(name, {
    blocks: braid.blocks.length,
    expectedBlocks: model.nBlocks,
    coeffsParsed: model.resourceCoeffs.length,
    nonZeroCapacityEntries: nonZeroCaps,
    discount: braid.parameters.discount_rate,
    resources: braid.resources.length,
    periods: braid.resources[0]?.upper_capacity.length,
    block0dest1Cap: block0?.destinations[1]?.resources[0]?.capacity_used,
    block9dest1Cap: block9?.destinations[1]?.resources[0]?.capacity_used,
    ready: result.completeness.readyForBraid,
    hasCoeffs: result.completeness.hasResourceCoeffs,
  });
}

verifyDataset('kd', 'dataset/kd.pcpsp', 'dataset/kd.prec');
verifyDataset('zuck_small', 'dataset/zuck_small.pcpsp', 'dataset/zuck_small.prec');
