import React from 'react';
import { ComplaintStatus } from '../../types';

interface StatusBadgeProps {
  status: ComplaintStatus | string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { label: string; textClass: string; dotClass: string }> = {
  submitted: {
    label: 'Submitted',
    textClass: 'text-cyan-400',
    dotClass: 'bg-cyan-400',
  },
  under_review: {
    label: 'Under Review',
    textClass: 'text-indigo-400',
    dotClass: 'bg-indigo-400',
  },
  assigned: {
    label: 'Assigned',
    textClass: 'text-purple-400',
    dotClass: 'bg-purple-400',
  },
  in_progress: {
    label: 'In Progress',
    textClass: 'text-amber-400',
    dotClass: 'bg-amber-400',
  },
  resolved: {
    label: 'Resolved',
    textClass: 'text-emerald-400',
    dotClass: 'bg-emerald-400',
  },
  closed: {
    label: 'Closed',
    textClass: 'text-slate-400',
    dotClass: 'bg-slate-400',
  },
  reopened: {
    label: 'Reopened',
    textClass: 'text-orange-400',
    dotClass: 'bg-orange-400',
  },
  rejected: {
    label: 'Rejected',
    textClass: 'text-rose-400',
    dotClass: 'bg-rose-400',
  },
  cancelled: {
    label: 'Cancelled',
    textClass: 'text-slate-500',
    dotClass: 'bg-slate-500',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normKey = status.toLowerCase().replace(/[\s-]/g, '_');
  const cfg = statusConfig[normKey] || {
    label: status.replace(/_/g, ' '),
    textClass: 'text-slate-400',
    dotClass: 'bg-slate-400',
  };

  const textSizes = size === 'sm' ? 'text-xs' : 'text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium ${textSizes} ${cfg.textClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dotClass}`} aria-hidden="true" />
      <span>{cfg.label}</span>
    </span>
  );
};
