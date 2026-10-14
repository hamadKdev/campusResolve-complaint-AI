import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl bg-[#151F35]/60 border border-white/5 my-4">
      <div className="w-12 h-12 rounded-xl bg-[#1C2942] flex items-center justify-center text-[#A7B4CC] mb-4 border border-white/5">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-[#F1F5F9]">{title}</h3>
      <p className="mt-1 text-sm text-[#A7B4CC] max-w-sm leading-relaxed">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 px-4 py-2 text-xs font-medium text-[#080D1B] bg-[#22D3EE] rounded-lg hover:bg-[#67e8f9] transition-colors whitespace-nowrap"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
