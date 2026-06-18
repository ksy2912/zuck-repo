import { z } from 'zod';
import type { BraidJSON } from '../../types/braid';

/** Zod schemas matching the official Decisions 360 BRAID input JSON spec */
export const BraidResourceUsageSchema = z.object({
  id: z.number(),
  capacity_used: z.number(),
});

export const BraidDestinationSchema = z.object({
  id: z.number(),
  objective: z.number(),
  resources: z.array(BraidResourceUsageSchema),
});

export const BraidBlockSchema = z.object({
  id: z.number(),
  precedence: z.array(z.number()),
  destinations: z.array(BraidDestinationSchema).min(1),
});

export const BraidResourceDefSchema = z.object({
  id: z.number(),
  lower_capacity: z.array(z.number()),
  upper_capacity: z.array(z.number()),
});

export const BraidInputSchema = z.object({
  blocks: z.array(BraidBlockSchema).min(1),
  resources: z.array(BraidResourceDefSchema).min(1),
  parameters: z.object({
    discount_rate: z.number(),
  }),
});

/** Official BRAID solver output — array of scheduled blocks */
export const BraidOutputRowSchema = z.object({
  block_id: z.number(),
  destination: z.number(),
  time_period: z.number(),
});

export const BraidOutputSchema = z.array(BraidOutputRowSchema);

export function validateBraidInputSchema(data: unknown): {
  success: boolean;
  data?: BraidJSON;
  errors: string[];
} {
  const result = BraidInputSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as BraidJSON, errors: [] };
  }
  return {
    success: false,
    errors: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
  };
}
