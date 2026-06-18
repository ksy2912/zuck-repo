import type { BraidFieldKey, FieldMapping } from '../../types/mapping';

interface FieldMapRowProps {
  field: FieldMapping;
  userColumns: string[];
  onChange: (braidField: BraidFieldKey, userColumn: string | null) => void;
}

export function FieldMapRow({ field, userColumns, onChange }: FieldMapRowProps) {
  const isUnmappedRequired = field.required && !field.userColumn;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-800">{field.braidField}</span>
          {field.required && (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600 ring-1 ring-red-200">
              Required
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-500">{field.description}</p>
      </div>
      <select
        value={field.userColumn ?? ''}
        onChange={(e) =>
          onChange(field.braidField, e.target.value === '' ? null : e.target.value)
        }
        className={`w-full rounded-lg border px-3 py-2 text-sm font-medium sm:w-56 ${
          isUnmappedRequired
            ? 'border-amber-300 bg-amber-50 text-amber-800'
            : 'border-slate-200 bg-slate-50 text-slate-700'
        }`}
      >
        <option value="">— unmapped —</option>
        {userColumns.map((col) => (
          <option key={col} value={col}>
            {col}
          </option>
        ))}
      </select>
    </div>
  );
}
