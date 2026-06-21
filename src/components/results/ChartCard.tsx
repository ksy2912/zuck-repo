import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, subtitle, children, className = '' }: ChartCardProps) {
  return (
    <div className={`panel overflow-hidden ${className}`}>
      <div className="border-b border-[var(--border)] px-5 py-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-[var(--text-muted)]">{subtitle}</p>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

const CHART = {
  grid: '#e8ecf1',
  axis: '#64748b',
  ore: '#1a3a5c',
  waste: '#b87333',
  npv: '#2d6a4f',
  accent: '#3d6b8e',
  fill: '#dce6f0',
};

export const chartTheme = CHART;

export const tooltipStyle = {
  backgroundColor: '#0f2744',
  border: 'none',
  borderRadius: '8px',
  color: '#f8fafc',
  fontSize: '12px',
  padding: '10px 12px',
};
