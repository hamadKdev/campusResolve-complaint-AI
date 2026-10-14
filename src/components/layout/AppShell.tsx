import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { healthService, HealthStatus } from '../../services/healthService';
import {
  Menu,
  X,
  Bell,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const AppShell: React.FC = () => {
  const { user, role, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    healthService.checkHealth().then((status) => {
      if (isMounted) setHealth(status);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Generate clean breadcrumbs
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems = pathParts.map((part, index) => {
    const url = `/${pathParts.slice(0, index + 1).join('/')}`;
    const formatted = part
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return { name: formatted, url };
  });

  return (
    <div className="min-h-screen bg-[#080D1B] text-[#F1F5F9] flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/80 backdrop-blur-xs flex">
          <div className="w-64 bg-[#080D1B] h-full shadow-2xl relative">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
          </div>
          <div className="flex-1" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        {/* Top Header */}
        <header className="h-16 sticky top-0 z-20 bg-[#080D1B]/90 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-[#A7B4CC] hover:text-[#F1F5F9] p-2 rounded-lg hover:bg-white/5"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Trail */}
            <nav className="flex items-center gap-1.5 text-xs text-[#A7B4CC]" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-cyan-300 transition-colors">
                CampusResolve
              </Link>
              {breadcrumbItems.map((item, idx) => (
                <React.Fragment key={item.url}>
                  <ChevronRight className="w-3.5 h-3.5 text-[#A7B4CC]/50" />
                  {idx === breadcrumbItems.length - 1 ? (
                    <span className="text-[#F1F5F9] font-medium">{item.name}</span>
                  ) : (
                    <Link to={item.url} className="hover:text-cyan-300 transition-colors">
                      {item.name}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Right Header Zone */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Live API status indicator */}
            <div
              className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#10182B] border border-white/5 text-[11px] text-[#A7B4CC]"
              title={
                health?.online
                  ? `Backend Online (${health.latencyMs ?? 0}ms)`
                  : 'Backend Disconnected'
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  health?.online ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span className="tabular-nums">
                {health?.online ? `API Live (${health.latencyMs ?? 0}ms)` : 'Connecting API'}
              </span>
            </div>

            {/* Notification Bell */}
            <Link
              to="/notifications"
              className="p-2 text-[#A7B4CC] hover:text-[#F1F5F9] hover:bg-white/5 rounded-lg transition-colors relative"
              title="Notifications"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
