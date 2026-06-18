import { useCallback, useEffect, useMemo, useState } from 'react';
import { Wand2, Save, ChevronRight, ChevronLeft, Play } from 'lucide-react';
import type { ParsedDataset } from '../../types/dataset';
import type { BraidFieldKey, FieldMapping, MappingTemplate } from '../../types/mapping';
import type { BraidJSON, BraidBlock } from '../../types/braid';
import type { ValidationResult } from '../../types/validation';
import { autoSuggestMappings } from '../../lib/mapping/autoSuggest';
import { buildBraidJSON } from '../../lib/mapping/mappingEngine';
import { transformMineLib } from '../../lib/transformers/minelibTransformer';
import { transformGeneric } from '../../lib/transformers/genericTransformer';
import { validateBraid } from '../../lib/validation/validateBraid';
import { FieldMapRow } from './FieldMapRow';
import { TransformPreview } from './TransformPreview';
import { ValidationReport } from '../validation/ValidationReport';
import { HealthScoreGauge } from '../validation/HealthScoreGauge';
import { ExportPanel } from '../export/ExportPanel';
import { SchemaReference } from './SchemaReference';

const TEMPLATE_KEY = 'braid_mapping_templates';

const FORMAT_BADGES: Record<string, string> = {
  BRAID_JSON: 'bg-purple-100 text-purple-800',
  MineLib: 'bg-emerald-100 text-emerald-800',
  Generic_CSV: 'bg-blue-100 text-blue-800',
  Excel: 'bg-amber-100 text-amber-800',
  PCPSP: 'bg-violet-100 text-violet-800',
  MultiFile: 'bg-indigo-100 text-indigo-800',
  Unknown: 'bg-slate-100 text-slate-600',
};

interface MappingWizardProps {
  dataset: ParsedDataset;
  rawBraidJson: BraidJSON | null;
  onBraidReady: (braid: BraidJSON, result: ValidationResult) => void;
}

function transformRows(
  dataset: ParsedDataset,
  mappings: FieldMapping[]
): BraidBlock[] {
  if (dataset.format === 'MineLib') {
    return transformMineLib(dataset.rows, mappings);
  }
  return transformGeneric(dataset.rows, mappings);
}

export function MappingWizard({ dataset, rawBraidJson, onBraidReady }: MappingWizardProps) {
  const isPreAssembled =
    rawBraidJson != null &&
    rawBraidJson.blocks.length > 0 &&
    (dataset.format === 'BRAID_JSON' ||
      dataset.format === 'PCPSP' ||
      dataset.format === 'MultiFile');

  const [step, setStep] = useState<1 | 2 | 3>(isPreAssembled ? 3 : 1);
  const [mappings, setMappings] = useState<FieldMapping[]>(() =>
    autoSuggestMappings(dataset.rawHeaders)
  );
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [templateName, setTemplateName] = useState('');

  const userColumns = dataset.rawHeaders;

  const blocks = useMemo(
    () => (rawBraidJson ? rawBraidJson.blocks : transformRows(dataset, mappings)),
    [dataset, mappings, rawBraidJson]
  );

  const braidJson = useMemo(
    () => rawBraidJson ?? buildBraidJSON(blocks, 0),
    [blocks, rawBraidJson]
  );

  const handleAutoSuggest = useCallback(() => {
    setMappings(autoSuggestMappings(userColumns));
  }, [userColumns]);

  const handleMappingChange = useCallback((braidField: BraidFieldKey, userColumn: string | null) => {
    setMappings((prev) =>
      prev.map((m) => (m.braidField === braidField ? { ...m, userColumn } : m))
    );
    setValidationResult(null);
  }, []);

  const saveTemplate = () => {
    if (!templateName.trim()) return;
    const existing: MappingTemplate[] = JSON.parse(localStorage.getItem(TEMPLATE_KEY) ?? '[]');
    existing.push({ name: templateName.trim(), mappings });
    localStorage.setItem(TEMPLATE_KEY, JSON.stringify(existing));
    setTemplateName('');
  };

  const runValidation = () => {
    const result = validateBraid(blocks, braidJson);
    setValidationResult(result);
    onBraidReady(braidJson, result);
  };

  useEffect(() => {
    if (isPreAssembled) setStep(3);
  }, [isPreAssembled]);

  useEffect(() => {
    handleAutoSuggest();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- run once on mount

  const formatBadge = FORMAT_BADGES[dataset.format] ?? FORMAT_BADGES.Unknown;

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(s as 1 | 2 | 3)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              step === s
                ? 'bg-violet-600 text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            Step {s}
          </button>
        ))}
      </div>

      {/* Step 1 — Review columns */}
      {step === 1 && (
        <div className="animate-fade-up space-y-5">
          <div className="glass-card rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Review columns</h2>
                <p className="text-sm text-slate-500">
                  {dataset.rowCount.toLocaleString()} rows · {userColumns.length} columns
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-bold ${formatBadge}`}>
                {dataset.format.replace('_', ' ')}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {dataset.columns.map((col) => (
                <span
                  key={col.name}
                  className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200"
                >
                  {col.name}{' '}
                  <span className="text-slate-400">({col.type})</span>
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAutoSuggest}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
            >
              <Wand2 className="h-4 w-4" />
              Auto-suggest mappings
            </button>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Continue to mapping
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Map fields */}
      {step === 2 && (
        <div className="animate-fade-up space-y-5">
          {rawBraidJson ? (
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 text-sm text-purple-800">
              BRAID JSON detected — using passthrough format. Mapping is optional.
            </div>
          ) : (
            <div className="space-y-3">
              {mappings.map((field) => (
                <FieldMapRow
                  key={field.braidField}
                  field={field}
                  userColumns={userColumns}
                  onChange={handleMappingChange}
                />
              ))}
            </div>
          )}

          <TransformPreview blocks={blocks} />

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Template name…"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={saveTemplate}
              disabled={!templateName.trim()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              <Save className="h-4 w-4" />
              Save mapping as template
            </button>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Continue to validation
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Validate + Export */}
      {step === 3 && (
        <div className="animate-fade-up space-y-5">
          {isPreAssembled && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              {dataset.format === 'MultiFile'
                ? 'Multiple files were merged into BRAID format — mapping was skipped. Run validation to confirm and export.'
                : 'Dataset already in BRAID structure — mapping was skipped. Run validation to confirm and export.'}
            </div>
          )}
          <SchemaReference />
          <button
            type="button"
            onClick={runValidation}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-violet-700"
          >
            <Play className="h-4 w-4" />
            Run Validation
          </button>

          {validationResult && (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ValidationReport result={validationResult} />
              </div>
              <HealthScoreGauge score={validationResult.score} />
            </div>
          )}

          {validationResult && validationResult.score >= 60 && (
            <ExportPanel
              braid={braidJson}
              score={validationResult.score}
              fileName={dataset.fileName}
            />
          )}

          {validationResult && validationResult.score < 60 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
              Fix errors before exporting — health score must be at least 60%.
            </div>
          )}

          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to mapping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
