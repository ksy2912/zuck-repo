import { useCallback, useState } from 'react';
import { AlertCircle, RotateCcw, Zap, Shield, Eye, Layers } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { DropZone } from '../components/upload/DropZone';
import { FileMetaCard } from '../components/upload/FileMetaCard';
import { ColumnInspector } from '../components/upload/ColumnInspector';
import { VirtualPreview } from '../components/upload/VirtualPreview';
import { parseCSVStream } from '../lib/parsers/csvParser';
import { parseExcel } from '../lib/parsers/excelParser';
import { parseJSON } from '../lib/parsers/jsonParser';
import { detectFormat } from '../lib/parsers/detectFormat';
import { inferColumnTypes } from '../lib/inferTypes';
import type { ParsedDataset } from '../types/dataset';

function getExtension(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  return dot >= 0 ? fileName.slice(dot).toLowerCase() : '';
}

const FEATURES = [
  {
    icon: Zap,
    title: 'Stream parsing',
    desc: 'CSV processed in 10K chunks — zero UI freeze even on million-row files',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
  {
    icon: Shield,
    title: 'Type inference',
    desc: 'Columns auto-classified as integer, float, string, or boolean',
    color: 'from-cyan-500 to-teal-600',
    bg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
  },
  {
    icon: Eye,
    title: 'Virtual preview',
    desc: 'Only visible rows hit the DOM — smooth scroll on any dataset size',
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
];

export function Day1Upload() {
  const [isParsing, setIsParsing] = useState(false);
  const [streamedRows, setStreamedRows] = useState(0);
  const [dataset, setDataset] = useState<ParsedDataset | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setDataset(null);
    setError(null);
    setStreamedRows(0);
    setIsParsing(false);
  }, []);

  const buildDataset = useCallback(
    (
      file: File,
      rows: Record<string, string>[],
      headers: string[],
      isBraidJson = false
    ) => {
      const format = detectFormat(headers, {
        extension: getExtension(file.name),
        isBraidJson,
      });
      const columns = inferColumnTypes(headers, rows);

      setDataset({
        fileName: file.name,
        fileSizeMB: file.size / (1024 * 1024),
        format,
        rowCount: rows.length,
        columns,
        rows,
        rawHeaders: headers,
      });
      setStreamedRows(rows.length);
      setIsParsing(false);
    },
    []
  );

  const handleFileSelected = useCallback(
    (file: File) => {
      resetState();
      setIsParsing(true);
      setError(null);

      const ext = getExtension(file.name);

      if (ext === '.zip') {
        setError('ZIP archives are not yet supported. Please upload CSV, Excel, or JSON directly.');
        setIsParsing(false);
        return;
      }

      if (ext === '.csv') {
        parseCSVStream(
          file,
          (_totalSoFar) => setStreamedRows(_totalSoFar),
          (allRows, headers) => buildDataset(file, allRows, headers),
          (err) => { setError(err); setIsParsing(false); }
        );
        return;
      }

      if (ext === '.xlsx' || ext === '.xls') {
        parseExcel(file)
          .then(({ rows, headers }) => {
            setStreamedRows(rows.length);
            buildDataset(file, rows, headers);
          })
          .catch((err: Error) => {
            setError(err.message ?? 'Failed to parse Excel file');
            setIsParsing(false);
          });
        return;
      }

      if (ext === '.json') {
        parseJSON(file)
          .then(({ rows, headers, isBraidJson }) => {
            setStreamedRows(rows.length);
            buildDataset(file, rows, headers, isBraidJson);
          })
          .catch((err: Error) => {
            setError(err.message ?? 'Failed to parse JSON file');
            setIsParsing(false);
          });
        return;
      }

      setError(`Unsupported file type: ${ext}`);
      setIsParsing(false);
    },
    [buildDataset, resetState]
  );

  const showResults = dataset !== null || isParsing;

  return (
    <div className="min-h-screen bg-mesh">
      <PageHeader
        title="Data Ingestion at Scale"
        subtitle="Upload and inspect large mining datasets — built to handle 1M+ rows without freezing your browser"
        step={1}
      />

      <main className="relative mx-auto max-w-7xl px-6 py-10">
        {/* Subtle dot grid overlay */}
        <div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-30" />

        <div className="relative">
          {error && (
            <div className="animate-fade-up mb-6 flex items-start gap-3 rounded-2xl border border-red-200/80 bg-red-50/90 p-5 shadow-sm backdrop-blur-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-bold text-red-800">Parsing failed</p>
                <p className="mt-1 text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {!showResults ? (
            <div className="mx-auto max-w-2xl">
              <DropZone onFileSelected={handleFileSelected} />

              {/* Feature cards */}
              <div className="mt-14 grid gap-5 sm:grid-cols-3">
                {FEATURES.map((f, i) => (
                  <div
                    key={f.title}
                    className="glass-card glass-card-hover animate-fade-up rounded-2xl p-5"
                    style={{ animationDelay: `${0.1 + i * 0.08}s` }}
                  >
                    <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${f.bg}`}>
                      <f.icon className={`h-5 w-5 ${f.iconColor}`} />
                    </div>
                    <h3 className="font-bold text-slate-800">{f.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{f.desc}</p>
                    <div className={`mt-4 h-0.5 w-8 rounded-full bg-gradient-to-r ${f.color}`} />
                  </div>
                ))}
              </div>

              {/* Trust strip */}
              <div className="mt-10 flex items-center justify-center gap-6 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" />
                  MineLib · BRAID JSON · Generic CSV
                </span>
                <span className="hidden h-3 w-px bg-slate-200 sm:block" />
                <span className="hidden sm:block">100% browser-side — no data leaves your machine</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <FileMetaCard
                dataset={dataset}
                isStreaming={isParsing}
                streamedRows={streamedRows}
              />

              {isParsing && (
                <div className="grid gap-6 lg:grid-cols-5">
                  <div className="lg:col-span-2">
                    <ColumnInspector columns={[]} isLoading />
                  </div>
                  <div className="lg:col-span-3">
                    <div className="glass-card flex h-[440px] items-center justify-center rounded-2xl">
                      <div className="text-center">
                        <div className="relative mx-auto mb-5 h-14 w-14">
                          <div className="absolute inset-0 animate-ping rounded-full bg-violet-300/30" />
                          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-lg">
                            <div className="h-6 w-6 animate-spin-slow rounded-full border-2 border-white/30 border-t-white" />
                          </div>
                        </div>
                        <p className="font-bold text-slate-700">Building preview…</p>
                        <p className="mt-1 text-sm text-slate-400">
                          <span className="font-mono font-semibold text-violet-600">
                            {streamedRows.toLocaleString()}
                          </span>{' '}
                          rows parsed so far
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {dataset && !isParsing && (
                <>
                  <div className="grid gap-6 lg:grid-cols-5">
                    <div className="lg:col-span-2">
                      <ColumnInspector columns={dataset.columns} />
                    </div>
                    <div className="lg:col-span-3">
                      <VirtualPreview rows={dataset.rows} headers={dataset.rawHeaders} />
                    </div>
                  </div>

                  <div className="flex justify-center pt-4">
                    <button
                      type="button"
                      onClick={resetState}
                      className="group inline-flex items-center gap-2.5 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-md ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:shadow-lg hover:ring-violet-300"
                    >
                      <RotateCcw className="h-4 w-4 transition-transform group-hover:-rotate-45" />
                      Upload a different file
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
