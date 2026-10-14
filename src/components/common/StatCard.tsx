import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  subtext?: string;
  accentColor?: 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose';
  trend?: string;
}

const colorMap = {
  cyan: {
    iconBg: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    glow: 'hover:border-cyan-500/30',
  },
  violet: {
    iconBg: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
    glow: 'hover:border-violet-500/30',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    glow: 'hover:border-emerald-500/30',
  },
  amber: {
    iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    glow: 'hover:border-amber-500/30',
  },
  rose: {
    iconBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    glow: 'hover:border-rose-500/30',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  subtext,
  accentColor = 'cyan',
  trend,
}) => {
  const colors = colorMap[accentColor] || colorMap.cyan;

  return (
    <div
      className={`p-5 rounded-xl bg-[#151F35] border border-white/5 transition-colors ${colors.glow}`}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-medium text-[#A7B4CC] tracking-wide">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colors.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-[#F1F5F9] tabular-nums tracking-tight">
          {value}
        </span>
        {trend && (
          <span className="text-xs text-[#A7B4CC] tabular-nums">{trend}</span>
        )}
      </div>

      {subtext && (
        <p className="mt-1 text-xs text-[#A7B4CC]/80 truncate">{subtext}</p>
      )}
    </div>
  );
};
