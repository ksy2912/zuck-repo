import { useCallback, useRef, useState } from 'react';
import { Upload, FileText, HelpCircle } from 'lucide-react';

interface DropZoneProps {
  onPairSelected: (pcpsp: File, prec: File, coords?: File) => void;
  isProcessing?: boolean;
}

export function DropZone({ onPairSelected, isProcessing }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [pcpspFile, setPcpspFile] = useState<File | null>(null);
  const [precFile, setPrecFile] = useState<File | null>(null);
  const [coordsFile, setCoordsFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Updated Extension Classifier Loop to include .blocks
  const classify = (files: File[]) => {
    let pcpsp: File | null = null;
    let prec: File | null = null;
    let coords: File | null = null;

    for (const f of files) {
      const ext = f.name.split('.').pop()?.toLowerCase();
      if (ext === 'pcpsp' || ext === 'pcps') {
        pcpsp = f;
      } else if (ext === 'prec') {
        prec = f;
      } else if (ext === 'blocks' || ext === 'xyz' || ext === 'csv' || ext === 'txt') {
        coords = f;
      }
    }
    return { pcpsp, prec, coords };
  };

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      setError(null);
      const files = Array.from(fileList);
      const { pcpsp, prec, coords } = classify(files);

      if (!pcpsp || !prec) {
        setError('Select one mandatory .pcpsp model file and one .prec precedence file.');
        if (pcpsp) setPcpspFile(pcpsp);
        if (prec) setPrecFile(prec);
        if (coords) setCoordsFile(coords);
        return;
      }

      setPcpspFile(pcpsp);
      setPrecFile(prec);
      setCoordsFile(coords ?? null);

      onPairSelected(pcpsp, prec, coords ?? undefined);
    },
    [onPairSelected]
  );

  return (
    <div className="animate-fade-up">
      <div
        role="button"
        tabIndex={0}
        onClick={() => !isProcessing && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !isProcessing && inputRef.current?.click()}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (!isProcessing && e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        className={`panel-elevated flex min-h-[240px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors ${
          isDragOver ? 'border-[var(--copper)] bg-amber-50/30' : 'border-slate-200 hover:border-slate-300'
        } ${isProcessing ? 'pointer-events-none opacity-60' : ''}`}
      >
        {/* 2. Updated Hidden Native HTML Input Accept Tags */}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pcpsp,.pcps,.prec,.blocks,.xyz,.csv,.txt"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
            e.target.value = '';
          }}
        />

        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--navy)] text-white">
          <Upload className="h-5 w-5" />
        </div>

        <p className="text-base font-semibold text-[var(--text-primary)]">
          Upload optimization pipeline files
        </p>
        <p className="mt-1 text-sm text-[var(--text-muted)] text-center max-w-md">
          Drop your model and structural precedence pairs here. Drop an optional coordinate file to generate the 3D grid layout viewport.
        </p>

        {/* 3. Updated Visual Badge Labels at the Bottom */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 font-medium">
            <FileText className="h-3.5 w-3.5" /> .pcpsp (Core)
          </span>
          <span>+</span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 font-medium">
            <FileText className="h-3.5 w-3.5" /> .prec (Graph)
          </span>
          <span>+</span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 font-medium">
            <HelpCircle className="h-3.5 w-3.5" /> .blocks / .xyz (Optional 3D)
          </span>
        </div>

        {(pcpspFile || precFile || coordsFile) && (
          <div className="mt-5 space-y-1 text-center font-mono text-xs text-[var(--text-primary)] border-t border-slate-100 pt-3 w-full max-w-xs">
            {pcpspFile && <p className="truncate text-slate-600">✓ Model: {pcpspFile.name}</p>}
            {precFile && <p className="truncate text-slate-600">✓ Graph: {precFile.name}</p>}
            {coordsFile && <p className="truncate text-emerald-600 font-semibold">✓ 3D Spatial Matrix: {coordsFile.name}</p>}
          </div>
        )}

        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
      </div>
    </div>
  );
}