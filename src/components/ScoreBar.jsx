import { cn } from '@/lib/utils';

export default function ScoreBar({ label, value, color = 'amber' }) {
  const colorMap = {
    amber: 'from-amber-400 to-amber-600',
    green: 'from-emerald-400 to-emerald-600',
    blue: 'from-sky-400 to-sky-600',
    purple: 'from-violet-400 to-violet-600',
    red: 'from-rose-400 to-rose-600',
  };

  return (
    <div className="flex items-center gap-3">
      <div className="w-32 text-xs text-white/60 font-medium">{label}</div>
      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', colorMap[color])}
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="w-8 text-right text-sm font-bold text-white">{value}</div>
    </div>
  );
}