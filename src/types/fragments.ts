import type { BraidJSON, BraidResourceDef } from './braid';

/** What role a file plays in the combined dataset */
export type FileRole =
  | 'pcpsp_model'      // objectives, resources, discount rate
  | 'precedence'       // .prec — block predecessor graph
  | 'braid_json'       // complete or partial BRAID JSON
  | 'tabular'          // CSV/Excel — flat block table
  | 'unknown';

export interface ResourceCoeff {
  blockId: number;
  destinationId: number;
  resourceId: number;
  capacityUsed: number;
}

export interface DataFragment {
  sourceFile: string;
  role: FileRole;
  /** block id → predecessor block ids */
  precedence?: Map<number, number[]>;
  /** block id → objective per destination index */
  objectives?: Map<number, number[]>;
  resourceCoeffs?: ResourceCoeff[];
  resourceDefs?: BraidResourceDef[];
  discountRate?: number;
  nDestinations?: number;
  nPeriods?: number;
  nResources?: number;
  /** Full BRAID JSON when file is self-contained */
  braidJson?: BraidJSON;
  /** Flat rows for preview / manual mapping fallback */
  rows?: Record<string, string>[];
  headers?: string[];
}

export interface FileManifestEntry {
  fileName: string;
  role: FileRole;
  contributes: string[];
}

export interface CompletenessReport {
  hasBlockIds: boolean;
  hasObjectives: boolean;
  hasPrecedence: boolean;
  hasResourceCoeffs: boolean;
  hasResourceLimits: boolean;
  hasDiscountRate: boolean;
  blockCount: number;
  readyForBraid: boolean;
  missing: string[];
}

export interface MultiFileResult {
  braidJson: BraidJSON | null;
  fragments: DataFragment[];
  manifest: FileManifestEntry[];
  completeness: CompletenessReport;
  previewRows: Record<string, string>[];
  previewHeaders: string[];
  fileNames: string[];
  totalSizeMB: number;
}
