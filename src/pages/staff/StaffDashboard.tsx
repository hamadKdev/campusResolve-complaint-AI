import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services/complaintService';
import { Complaint } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { formatApiErrorMessage } from '../../services/apiClient';
import {
  Building2,
  CheckSquare,
  AlertTriangle,
  Clock,
  ArrowRight,
  Eye,
  ListTodo,
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await complaintService.getComplaints();
      setComplaints(data);
    } catch (err) {
      setErrorMsg(formatApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const assignedCount = complaints.filter(
    (c) => c.status === 'assigned' || c.status === 'in_progress'
  ).length;
  const urgentCount = complaints.filter(
    (c) =>
      (c.priority === 'urgent' || c.priority === 'high') &&
      c.status !== 'resolved' &&
      c.status !== 'closed' &&
      c.status !== 'cancelled'
  ).length;
  const pendingUpdateCount = complaints.filter(
    (c) => c.status === 'in_progress'
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved').length;

  const priorityQueue = complaints
    .filter(
      (c) => c.status !== 'resolved' && c.status !== 'closed' && c.status !== 'cancelled'
    )
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Department Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#10182B] to-[#151F35] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-xs font-semibold text-cyan-300 mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>{user?.department_name || 'Assigned Department Operations'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight">
            Staff Operations Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B4CC] mt-0.5">
            Logged in as <strong className="text-[#F1F5F9]">{user?.full_name}</strong>. Manage maintenance queues and field progress.
          </p>
        </div>
        <Link
          to="/staff/queue"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#22D3EE] hover:bg-[#67e8f9] text-[#080D1B] font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-cyan-500/20"
        >
          <CheckSquare className="w-4 h-4" />
          <span>Open Full Work Queue</span>
        </Link>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Assigned"
          value={assignedCount}
          icon={ListTodo}
          subtext="Tickets currently assigned"
          accentColor="cyan"
        />
        <StatCard
          label="High / Urgent"
          value={urgentCount}
          icon={AlertTriangle}
          subtext="Requires prompt attention"
          accentColor="rose"
        />
        <StatCard
          label="In Progress"
          value={pendingUpdateCount}
          icon={Clock}
          subtext="Field work under execution"
          accentColor="amber"
        />
        <StatCard
          label="Resolved Cases"
          value={resolvedCount}
          icon={CheckSquare}
          subtext="Successfully completed"
          accentColor="emerald"
        />
      </div>

      {/* Urgent Action Queue */}
      <div className="rounded-2xl bg-[#10182B] border border-white/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-[#F1F5F9]">Pending Queue</h2>
            <p className="text-xs text-[#A7B4CC] mt-0.5">
              Top cases awaiting staff progress updates or resolution
            </p>
          </div>
          <Link
            to="/staff/queue"
            className="text-xs font-medium text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 transition-colors"
          >
            <span>View All Assigned Work</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {errorMsg && <ErrorBanner message={errorMsg} onRetry={loadData} />}

        {isLoading ? (
          <LoadingSkeleton rows={4} />
        ) : priorityQueue.length === 0 ? (
          <EmptyState
            title="Queue is currently clear"
            description="All assigned work has been completed or no pending complaints are assigned to your unit."
            action={{
              label: 'Refresh Queue',
              onClick: loadData,
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-semibold text-[#A7B4CC] uppercase tracking-wider">
                  <th className="py-3 px-4">Title / ID</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned On</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-[#F1F5F9]">
                {priorityQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100 max-w-xs truncate">{item.title}</div>
                      <div className="text-[11px] text-[#A7B4CC] font-mono mt-0.5">
                        #{item.id.slice(0, 8)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#A7B4CC]">{item.location}</td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3 px-4 text-[#A7B4CC] tabular-nums whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to="/staff/queue"
                        className="p-1.5 rounded-lg bg-[#151F35] hover:bg-[#1C2942] text-cyan-300 hover:text-white inline-flex items-center gap-1.5 transition-colors border border-white/5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium hidden sm:inline">Manage</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
