/** BRAID solver output — one row per scheduled block */
export interface BraidOutputRow {
  block_id: number;
  destination: number;
  time_period: number;
}

export type BraidOutput = BraidOutputRow[];
