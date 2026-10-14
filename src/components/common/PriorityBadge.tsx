import React from 'react';
import { PriorityLevel } from '../../types';

interface PriorityBadgeProps {
  priority: PriorityLevel | string;
}

const priorityConfig: Record<string, { label: string; textClass: string; barCount: number }> = {
  low: {
    label: 'Low',
    textClass: 'text-slate-400',
    barCount: 1,
  },
  medium: {
    label: 'Medium',
    textClass: 'text-cyan-400',
    barCount: 2,
  },
  high: {
    label: 'High',
    textClass: 'text-amber-400',
    barCount: 3,
  },
  urgent: {
    label: 'Urgent',
    textClass: 'text-rose-400',
    barCount: 4,
  },
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const norm = (priority || 'medium').toLowerCase();
  const cfg = priorityConfig[norm] || {
    label: priority,
    textClass: 'text-slate-400',
    barCount: 1,
  };

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.textClass}`}>
      <span className="flex items-end gap-0.5 h-3" aria-hidden="true">
        {[1, 2, 3, 4].map((bar) => (
          <span
            key={bar}
            className={`w-0.5 rounded-xs transition-all ${
              bar <= cfg.barCount ? 'bg-current' : 'bg-slate-700/60'
            }`}
            style={{ height: `${bar * 25}%` }}
          />
        ))}
      </span>
      <span>{cfg.label}</span>
    </span>
  );
};
