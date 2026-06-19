import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { StepNav } from '../components/layout/StepNav';
import { DropZone } from '../components/upload/DropZone';
import { useAppContext } from '../context/AppContext';
import { runSolverFromFiles } from '../lib/solver/mineScheduler';

export function UploadPage() {
  const navigate = useNavigate();
  const { setSolverResult } = useAppContext();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePairSelected = useCallback(
    async (pcpsp: File, prec: File) => {
      setError(null);
      setIsProcessing(true);
      try {
        const result = await runSolverFromFiles(pcpsp, prec);
        setSolverResult(result);
        navigate('/results');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Optimization failed');
        setIsProcessing(false);
      }
    },
    [navigate, setSolverResult]
  );

  return (
    <div className="min-h-screen bg-mesh">
      <PageHeader
        title="Mine Schedule Optimizer"
        subtitle="Upload PCPSP model and precedence files to generate your optimized schedule"
        step={1}
        totalSteps={2}
      />
      <StepNav currentStep={1} />

      <main className="relative mx-auto max-w-3xl px-6 py-12">
        <div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-30" />

        <div className="relative space-y-6">
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200/80 bg-red-50/90 p-5">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <div>
                <p className="font-bold text-red-800">Processing failed</p>
                <p className="mt-1 text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          <DropZone onPairSelected={handlePairSelected} isProcessing={isProcessing} />

          {isProcessing && (
            <div className="glass-card flex items-center justify-center gap-3 rounded-2xl p-8">
              <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
              <p className="font-semibold text-slate-700">Running optimization…</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
