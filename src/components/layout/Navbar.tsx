import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { healthService, HealthStatus } from '../../services/healthService';
import { ShieldCheck, LogOut, LayoutDashboard, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, role } = useAuth();
  const navigate = useNavigate();
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    let isMounted = true;
    healthService.checkHealth().then((status) => {
      if (isMounted) setHealth(status);
    });

    const interval = setInterval(() => {
      healthService.checkHealth().then((status) => {
        if (isMounted) setHealth(status);
      });
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin';
    if (role === 'staff') return '/staff';
    if (role === 'student') return '/student';
    return '/login';
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080D1B]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1: Single text element wordmark with brand emblem */}
        <Link to="/" className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center p-0.5 shadow-sm shadow-cyan-500/20">
            <div className="w-full h-full bg-[#080D1B] rounded-[6px] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <span className="text-lg font-bold tracking-tight text-[#F1F5F9]">
            CampusResolve <span className="text-cyan-400">AI</span>
          </span>
        </Link>

        {/* Zone 2: 4 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#A7B4CC]">
          <a href="#how-it-works" className="hover:text-[#F1F5F9] transition-colors whitespace-nowrap shrink-0">
            How It Works
          </a>
          <a href="#features" className="hover:text-[#F1F5F9] transition-colors whitespace-nowrap shrink-0">
            Capabilities
          </a>
          <a href="#approvals" className="hover:text-[#F1F5F9] transition-colors whitespace-nowrap shrink-0">
            AI Approvals
          </a>
          <a href="#overview" className="hover:text-[#F1F5F9] transition-colors whitespace-nowrap shrink-0">
            Overview
          </a>
        </nav>

        {/* Zone 3: 1 primary action + live API status */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Live verified API indicator */}
          <div
            className="hidden sm:flex items-center gap-2 text-xs text-[#A7B4CC]"
            title={
              health?.online
                ? `Backend Online (${health.latencyMs ?? 0}ms)`
                : 'Backend Connection Pending or Offline'
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                health?.online ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-amber-400'
              }`}
            />
            <span className="tabular-nums">
              {health?.online ? `API Live ${health.latencyMs ?? ''}ms` : 'Connecting API...'}
            </span>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to={getDashboardPath()}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#080D1B] bg-[#22D3EE] rounded-lg hover:bg-[#67e8f9] transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-cyan-500/20"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/login', { replace: true });
                }}
                className="p-2 text-[#A7B4CC] hover:text-[#F1F5F9] hover:bg-white/5 rounded-lg transition-colors"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-xs font-medium text-[#A7B4CC] hover:text-[#F1F5F9] px-3 py-2 transition-colors whitespace-nowrap shrink-0"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#080D1B] bg-[#22D3EE] rounded-lg hover:bg-[#67e8f9] transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-cyan-500/20"
              >
                <span>Access Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
