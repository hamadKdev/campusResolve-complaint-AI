import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#080D1B] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <span className="text-xs font-mono font-semibold text-cyan-400 tracking-widest uppercase">
        404 — Route Not Found
      </span>
      <h1 className="text-3xl font-bold text-[#F1F5F9] mt-2 mb-3">
        Campus Coordinate Undefined
      </h1>
      <p className="text-xs sm:text-sm text-[#A7B4CC] max-w-md mb-8 leading-relaxed">
        The requested screen does not exist or has been relocated within the CampusResolve AI portal.
      </p>
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#22D3EE] text-[#080D1B] text-xs font-semibold hover:bg-[#67e8f9] transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};
