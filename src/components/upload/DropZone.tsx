import { useCallback, useRef, useState } from 'react';
import { Upload, FileText } from 'lucide-react';

interface DropZoneProps {
  onPairSelected: (pcpsp: File, prec: File) => void;
  isProcessing?: boolean;
}

export function DropZone({ onPairSelected, isProcessing }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [pcpspFile, setPcpspFile] = useState<File | null>(null);
  const [precFile, setPrecFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const classify = (files: File[]) => {
    let pcpsp: File | null = null;
    let prec: File | null = null;
    for (const f of files) {
      const ext = f.name.split('.').pop()?.toLowerCase();
      if (ext === 'pcpsp' || ext === 'pcps') pcpsp = f;
      else if (ext === 'prec') prec = f;
    }
    return { pcpsp, prec };
  };

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      setError(null);
      const files = Array.from(fileList);
      const { pcpsp, prec } = classify(files);

      if (!pcpsp || !prec) {
        setError('Select one .pcpsp model file and one .prec precedence file.');
        if (pcpsp) setPcpspFile(pcpsp);
        if (prec) setPrecFile(prec);
        return;
      }

      setPcpspFile(pcpsp);
      setPrecFile(prec);
      onPairSelected(pcpsp, prec);
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
        className={`panel-elevated flex min-h-[220px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors ${
          isDragOver ? 'border-[var(--copper)] bg-amber-50/30' : 'border-slate-200 hover:border-slate-300'
        } ${isProcessing ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pcpsp,.pcps,.prec"
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
          Upload model and precedence files
        </p>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Drop both files here or click to browse
        </p>

        <div className="mt-5 flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 font-medium">
            <FileText className="h-3.5 w-3.5" /> .pcpsp
          </span>
          <span>+</span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 font-medium">
            <FileText className="h-3.5 w-3.5" /> .prec
          </span>
        </div>

        {(pcpspFile || precFile) && (
          <div className="mt-4 space-y-1 text-center font-mono text-xs text-[var(--text-muted)]">
            {pcpspFile && <p>{pcpspFile.name}</p>}
            {precFile && <p>{precFile.name}</p>}
          </div>
        )}

        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
      </div>
    </div>
  );
}
