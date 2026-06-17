import { useCallback, useRef, useState } from 'react';
import { Upload, FileSpreadsheet, Zap } from 'lucide-react';

interface DropZoneProps {
  onFileSelected: (file: File) => void;
}

const ACCEPTED_EXTENSIONS = ['.csv', '.xlsx', '.xls', '.json', '.zip'];

const FORMATS = [
  { label: 'CSV', color: 'bg-blue-500/10 text-blue-600 ring-blue-500/20' },
  { label: 'Excel', color: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20' },
  { label: 'JSON', color: 'bg-violet-500/10 text-violet-600 ring-violet-500/20' },
];

export function DropZone({ onFileSelected }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!ACCEPTED_EXTENSIONS.includes(ext)) return;
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="relative animate-fade-up">
      <div className="glow-orb -left-8 -top-8 h-40 w-40 bg-violet-400/30" />
      <div className="glow-orb -bottom-8 -right-8 h-32 w-32 bg-cyan-400/20" />

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        className={`
          gradient-border relative flex min-h-[280px] w-full cursor-pointer flex-col
          items-center justify-center rounded-2xl p-12 transition-all duration-300
          ${isDragOver ? 'drag-active scale-[1.01] shadow-xl shadow-violet-200/50' : 'shadow-lg shadow-slate-200/60'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(',')}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />

        <div className="animate-float mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-xl shadow-violet-300/50">
          <Upload className="h-9 w-9 text-white" strokeWidth={2} />
        </div>

        <p className="text-center text-2xl font-bold text-slate-800">
          Drop your mining dataset here
        </p>
        <p className="mt-2 text-center text-sm text-slate-500">
          Supports CSV, Excel, JSON — files up to{' '}
          <span className="font-semibold text-slate-700">2 GB</span>
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {FORMATS.map((fmt) => (
            <span
              key={fmt.label}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 ring-inset ${fmt.color}`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              {fmt.label}
            </span>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-xs text-slate-400 ring-1 ring-slate-200/80">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          or click anywhere to browse files
        </div>
      </div>
    </div>
  );
}
