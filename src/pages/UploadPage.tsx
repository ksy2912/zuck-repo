import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, Server, Shield } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { StepNav } from '../components/layout/StepNav';
import { DropZone } from '../components/upload/DropZone';
import { useAppContext } from '../context/AppContext';
import { checkBackendHealth, solveWithBackend } from '../lib/api/solveApi';
import type { BlockCoordinate } from '../types/solver';

// Clean parser returning the spatial layout matrix
function parseBlocksFile(fileText: string): Record<number, BlockCoordinate> {
  const coordinatesMap: Record<number, BlockCoordinate> = {};
  const lines = fileText.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;

    const columns = line.split(/\s+/);

    if (columns.length >= 4) {
      const id = parseInt(columns[0], 10);
      const x = parseFloat(columns[1]);
      const y = parseFloat(columns[2]);
      const z = parseFloat(columns[3]);

      if (!isNaN(id) && !isNaN(x) && !isNaN(y) && !isNaN(z)) {
        coordinatesMap[id] = { id, x, y, z };
      }
    }
  }
  return coordinatesMap;
}

export function UploadPage() {
  const navigate = useNavigate();
  const { setSolverResult } = useAppContext();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [backendReady, setBackendReady] = useState<boolean | null>(null);

  useEffect(() => {
    checkBackendHealth().then(setBackendReady);
  }, []);

  const handlePairSelected = useCallback(
    async (pcpsp: File, prec: File, coordsFile?: File) => {
      if (!backendReady) {
        setError('Python backend is not running. Start it with: npm run dev:backend');
        return;
      }

      setError(null);
      setIsProcessing(true);
      
      try {
        const result = await solveWithBackend(pcpsp, prec);

        if (coordsFile) {
          const reader = new FileReader();

          reader.onload = (event) => {
            const rawText = event.target?.result as string;
            const coordinatesMap = parseBlocksFile(rawText);

            setSolverResult({
              ...result,
              coordinates: coordinatesMap,
            });
            navigate('/results');
          };

          reader.onerror = () => {
            setError('Failed reading .blocks column mappings.');
            setIsProcessing(false);
          };

          reader.readAsText(coordsFile);
        } else {
          setSolverResult(result);
          navigate('/results');
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? `${err.message} — start backend: npm run dev:backend`
            : 'Optimization failed'
        );
        setIsProcessing(false);
      }
    },
    [navigate, setSolverResult, backendReady]
  );

  return (
    <div className="min-h-screen bg-app">
      <PageHeader
        title="Mine Schedule Optimizer"
        subtitle="Upload your PCPSP model and PREC precedence file to generate an optimized block schedule."
        step={1}
        totalSteps={2}
      />
      <StepNav currentStep={1} />

      <main className="page-shell w-full py-10">
        <div className="space-y-6">
          {backendReady === false && (
            <div className="panel flex items-start gap-3 border-amber-200 bg-amber-50/50 p-5">
              <Server className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-900">Backend not connected</p>
                <p className="mt-1 text-sm text-amber-800">
                  Run <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">npm run dev:backend</code> in a
                  separate terminal, then refresh this page.
                </p>
              </div>
            </div>
          )}
          {error && (
            <div className="panel flex items-start gap-3 border-red-200 bg-red-50/50 p-5">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">Processing failed</p>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <DropZone onPairSelected={handlePairSelected} isProcessing={isProcessing} />

          {isProcessing && (
            <div className="panel-elevated flex items-center justify-center gap-3 p-8">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--navy)]" />
              <p className="font-medium text-[var(--text-primary)]">Running optimization…</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="panel p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Input</p>
              <p className="mt-1 text-sm font-semibold">.pcpsp + .prec + (opt) .blocks</p>
            </div>
            <div className="panel p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Engine</p>
              <p className="mt-1 text-sm font-semibold">SimpleMineScheduler</p>
            </div>
            <div className="panel flex items-start gap-2 p-4">
              <Shield className="mt-0.5 h-4 w-4 text-[var(--copper)]" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Output</p>
                <p className="mt-1 text-sm font-semibold">Schedule JSON + analytics</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}