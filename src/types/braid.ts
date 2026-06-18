/**
 * BRAID Input JSON — Decisions 360 Pty Ltd
 * Block-based optimization with destinations, resources, and global parameters.
 */

/** Resource usage within a destination */
export interface BraidResource {
  id: number;
  capacity_used: number;
}

/** Destination option for a block */
export interface BraidDestination {
  id: number;
  objective: number;
  resources: BraidResource[];
}

/** Block with precedence constraints and destination options */
export interface BraidBlock {
  id: number;
  precedence: number[];
  destinations: BraidDestination[];
}

/** Capacity constraints per resource across time periods */
export interface BraidResourceDef {
  id: number;
  lower_capacity: number[];
  upper_capacity: number[];
}

/** Full BRAID solver input */
export interface BraidJSON {
  blocks: BraidBlock[];
  resources: BraidResourceDef[];
  parameters: {
    discount_rate: number;
  };
}

/**
 * BRAID Output JSON — one row per scheduled block.
 * Unscheduled blocks do not appear in the output.
 */
export interface BraidOutputRow {
  block_id: number;
  destination: number;
  time_period: number;
}

export type BraidOutput = BraidOutputRow[];
