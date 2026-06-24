import type { BraidOutput } from './braid';

export interface BlockCoordinate {
  id: number;
  x: number;
  y: number;
  z: number;
}

export interface PeriodStat {
  period: number;
  blockCount: number;
  npv: number;
}

export interface SolverResult {
  name: string;
  periods: number;
  destinations: number;
  discountRate: number;
  blockCount: number;
  output: BraidOutput;
  totalNpv: number;
  periodStats: PeriodStat[];
  destinationSplit: { ore: number; waste: number };
  fileNames: { pcpsp: string; prec: string };
  engine: string;
  
  // NEW OPTIONAL FIELD: Maps Block ID directly to its Spatial Coordinates
  coordinates?: Record<number, BlockCoordinate>;
}