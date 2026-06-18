import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { StepNav } from '../components/layout/StepNav';
import { DropZone } from '../components/upload/DropZone';
import { MappingWizard } from '../components/mapping/MappingWizard';
import { useAppContext } from '../context/AppContext';
import { parseCSVStream } from '../lib/parsers/csvParser';
import { parseExcel } from '../lib/parsers/excelParser';
import { parseJSON } from '../lib/parsers/jsonParser';
import { detectFormat } from '../lib/parsers/detectFormat';
import { inferColumnTypes } from '../lib/inferTypes';
import type { ParsedDataset } from '../types/dataset';
import type { BraidJSON } from '../types/braid';
import type { ValidationResult } from '../types/validation';

function getExtension(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  return dot >= 0 ? fileName.slice(dot).toLowerCase() : '';
}

export function Day2Mapping() {
  const navigate = useNavigate();
  const {
    dataset,
    setDataset,
    setBraidOutput,
    setValidationResult,
    rawBraidJson,
    setRawBraidJson,
  } = useAppContext();
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const buildDataset = useCallback(
    (
      file: File,
      rows: Record<string, string>[],
      headers: string[],
      isBraidJson = false,
      braidJson?: BraidJSON
    ) => {
      const parsed: ParsedDataset = {
        fileName: file.name,
        fileSizeMB: file.size / (1024 * 1024),
        format: detectFormat(headers, { extension: getExtension(file.name), isBraidJson }),
        rowCount: rows.length,
        columns: inferColumnTypes(headers, rows),
        rows,
        rawHeaders: headers,
      };
      setDataset(parsed);
      setRawBraidJson(braidJson ?? null);
      setIsParsing(false);
    },
    [setDataset, setRawBraidJson]
  );

  const handleFileSelected = useCallback(
    (file: File) => {
      setIsParsing(true);
      setError(null);
      const ext = getExtension(file.name);

      if (ext === '.csv') {
        parseCSVStream(
          file,
          () => {},
          (allRows, headers) => buildDataset(file, allRows, headers),
          (err) => { setError(err); setIsParsing(false); }
        );
        return;
      }
      if (ext === '.xlsx' || ext === '.xls') {
        parseExcel(file)
          .then(({ rows, headers }) => buildDataset(file, rows, headers))
          .catch((err: Error) => { setError(err.message); setIsParsing(false); });
        return;
      }
      if (ext === '.json') {
        parseJSON(file)
          .then(({ rows, headers, isBraidJson, braidJson }) =>
            buildDataset(file, rows, headers, isBraidJson, braidJson)
          )
          .catch((err: Error) => { setError(err.message); setIsParsing(false); });
        return;
      }
      setError(`Unsupported file type: ${ext}`);
      setIsParsing(false);
    },
    [buildDataset]
  );

  const handleBraidReady = (braid: BraidJSON, result: ValidationResult) => {
    setBraidOutput(braid);
    setValidationResult(result);
  };

  return (
    <div className="min-h-screen bg-mesh">
      <PageHeader
        title="Map & Validate"
        subtitle={dataset ? `Working on: ${dataset.fileName}` : 'Map your columns to BRAID schema and validate'}
        step={2}
      />
      <StepNav currentStep={2} />

      <main className="relative mx-auto max-w-5xl px-6 py-10">
        <div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-30" />
        <div className="relative">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
              <AlertCircle className="mt-0.5 h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!dataset ? (
            <div className="mx-auto max-w-xl space-y-6">
              <div className="glass-card rounded-2xl p-6 text-center">
                <p className="mb-4 text-sm text-slate-500">No dataset loaded. Upload a file or go back to Day 1.</p>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-800"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go back to upload
                </button>
              </div>
              <DropZone onFileSelected={handleFileSelected} />
              {isParsing && (
                <p className="text-center text-sm text-slate-500">Parsing file…</p>
              )}
            </div>
          ) : (
            <MappingWizard
              dataset={dataset}
              rawBraidJson={rawBraidJson}
              onBraidReady={handleBraidReady}
            />
          )}
        </div>
      </main>
    </div>
  );
}
