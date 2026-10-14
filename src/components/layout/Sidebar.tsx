import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  CheckSquare,
  ShieldCheck,
  Users,
  Building2,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const getNavLinks = () => {
    if (role === 'admin') {
      return [
        { label: 'Overview', to: '/admin', icon: LayoutDashboard },
        { label: 'Complaints', to: '/admin/complaints', icon: FileText },
        { label: 'AI Approvals', to: '/admin/approvals', icon: Sparkles },
        { label: 'User Directory', to: '/admin/users', icon: Users },
        { label: 'Departments', to: '/admin/departments', icon: Building2 },
        { label: 'Notifications', to: '/notifications', icon: Bell },
      ];
    }
    if (role === 'staff') {
      return [
        { label: 'Department Hub', to: '/staff', icon: LayoutDashboard },
        { label: 'Work Queue', to: '/staff/queue', icon: CheckSquare },
        { label: 'Notifications', to: '/notifications', icon: Bell },
      ];
    }
    if (role === 'student') {
      return [
        { label: 'Overview', to: '/student', icon: LayoutDashboard },
        { label: 'File Complaint', to: '/student/submit', icon: PlusCircle },
        { label: 'My Complaints', to: '/student/complaints', icon: FileText },
        { label: 'Notifications', to: '/notifications', icon: Bell },
      ];
    }
    return [];
  };

  const links = getNavLinks();

  const roleColors: Record<UserRole, { bg: string; text: string; label: string }> = {
    admin: { bg: 'bg-violet-500/15 border-violet-500/30', text: 'text-violet-300', label: 'Administrator' },
    staff: { bg: 'bg-cyan-500/15 border-cyan-500/30', text: 'text-cyan-300', label: 'Staff Member' },
    student: { bg: 'bg-emerald-500/15 border-emerald-500/30', text: 'text-emerald-300', label: 'Student' },
  };

  const currentRoleCfg = role && roleColors[role] ? roleColors[role] : null;

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-30 flex flex-col bg-[#080D1B] border-r border-white/5 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
        <Link to="/" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center p-0.5 shrink-0 shadow-md shadow-cyan-500/20">
            <div className="w-full h-full bg-[#080D1B] rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold tracking-tight text-[#F1F5F9] truncate">
                CampusResolve <span className="text-cyan-400">AI</span>
              </span>
              <span className="text-[10px] text-[#A7B4CC] truncate">Intelligent Campus Ops</span>
            </div>
          )}
        </Link>
        <button
          onClick={onToggle}
          className="text-[#A7B4CC] hover:text-[#F1F5F9] p-1.5 rounded-lg hover:bg-white/5 transition-colors hidden md:block"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Role Pill Banner */}
      {!collapsed && currentRoleCfg && (
        <div className="px-4 py-3 border-b border-white/5 bg-[#10182B]/60">
          <div className="flex items-center justify-between">
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${currentRoleCfg.bg} ${currentRoleCfg.text}`}
            >
              {currentRoleCfg.label}
            </span>
          </div>
          {user?.department_name && (
            <p className="text-[11px] text-[#A7B4CC] mt-1.5 truncate">
              Dept: <span className="text-[#F1F5F9]">{user.department_name}</span>
            </p>
          )}
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/student' || item.to === '/staff' || item.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#151F35] text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-950'
                    : 'text-[#A7B4CC] hover:text-[#F1F5F9] hover:bg-white/5'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User profile footer */}
      <div className="p-3 border-t border-white/5 bg-[#080D1B]">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl bg-[#10182B] border border-white/5 ${
            collapsed ? 'justify-center p-1.5' : ''
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-[#1C2942] flex items-center justify-center text-xs font-semibold text-cyan-300 shrink-0">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#F1F5F9] truncate">
                {user?.full_name || 'Anonymous User'}
              </p>
              <p className="text-[11px] text-[#A7B4CC] truncate">{user?.email || 'user@campus.edu'}</p>
            </div>
          )}

          <button
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
            className="text-[#A7B4CC] hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors shrink-0"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
