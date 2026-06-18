interface HealthScoreGaugeProps {
  score: number;
}

function scoreColor(score: number): string {
  if (score < 40) return '#E24B4A';
  if (score < 70) return '#EF9F27';
  if (score < 90) return '#378ADD';
  return '#1D9E75';
}

export function HealthScoreGauge({ score }: HealthScoreGaugeProps) {
  const radius = 80;
  const circumference = Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div className="glass-card flex flex-col items-center rounded-2xl p-6">
      <svg viewBox="0 0 200 110" className="w-48">
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease' }}
        />
        <text x="100" y="88" textAnchor="middle" className="fill-slate-800 text-3xl font-extrabold" fontSize="32">
          {score}%
        </text>
      </svg>
      <p className="mt-1 text-sm font-semibold text-slate-500">Dataset health</p>
    </div>
  );
}
