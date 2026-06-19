import { useCallback, useRef, useState } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';

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
        setError('Upload exactly one .pcpsp and one .prec file together.');
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
    <div className="relative animate-fade-up">
      <div className="glow-orb -left-8 -top-8 h-40 w-40 bg-violet-400/30" />
      <div className="glow-orb -bottom-8 -right-8 h-32 w-32 bg-cyan-400/20" />

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
        className={`gradient-border relative flex min-h-[260px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl p-10 transition-all duration-300 ${
          isDragOver ? 'drag-active scale-[1.01] shadow-xl shadow-violet-200/50' : 'shadow-lg shadow-slate-200/60'
        } ${isProcessing ? 'pointer-events-none opacity-70' : ''}`}
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

        <div className="animate-float mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-xl shadow-violet-300/50">
          <Upload className="h-8 w-8 text-white" strokeWidth={2} />
        </div>

        <p className="text-center text-xl font-bold text-slate-800">
          Drop your .pcpsp + .prec files here
        </p>
        <p className="mt-2 max-w-md text-center text-sm text-slate-500">
          Both files required — optimization runs automatically after upload
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3.5 py-1.5 text-xs font-semibold text-violet-600 ring-1 ring-violet-500/20 ring-inset">
            <FileSpreadsheet className="h-3.5 w-3.5" />
            .pcpsp model
          </span>
          <span className="text-slate-300">+</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-600 ring-1 ring-cyan-500/20 ring-inset">
            <FileSpreadsheet className="h-3.5 w-3.5" />
            .prec precedence
          </span>
        </div>

        {(pcpspFile || precFile) && (
          <div className="mt-5 space-y-1 text-center text-xs text-slate-500">
            {pcpspFile && <p className="font-mono text-violet-600">{pcpspFile.name}</p>}
            {precFile && <p className="font-mono text-cyan-600">{precFile.name}</p>}
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm font-medium text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}
