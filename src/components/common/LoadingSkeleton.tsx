import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="space-y-3 w-full animate-pulse my-4">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="h-16 rounded-xl bg-[#151F35]/70 border border-white/5 flex items-center px-4 gap-4"
        >
          <div className="w-8 h-8 rounded-lg bg-[#1C2942]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 bg-[#1C2942] rounded" />
            <div className="h-2 w-1/2 bg-[#1C2942]/60 rounded" />
          </div>
          <div className="w-20 h-4 bg-[#1C2942] rounded hidden sm:block" />
          <div className="w-16 h-4 bg-[#1C2942] rounded" />
        </div>
      ))}
    </div>
  );
};
