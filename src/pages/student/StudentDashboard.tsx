import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  Eye,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
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

  // Derive counts from actual returned records
  const totalCount = complaints.length;
  const underReviewCount = complaints.filter(
    (c) => c.status === 'submitted' || c.status === 'under_review'
  ).length;
  const inProgressCount = complaints.filter(
    (c) => c.status === 'in_progress' || c.status === 'assigned'
  ).length;
  const resolvedCount = complaints.filter(
    (c) => c.status === 'resolved' || c.status === 'closed'
  ).length;

  const recentComplaints = complaints.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Top Welcome & Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#10182B] to-[#151F35] border border-white/5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight">
            Student Complaint Center
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B4CC] mt-1">
            Track your submitted campus grievances, view progress logs, and submit new issues.
          </p>
        </div>
        <Link
          to="/student/submit"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#22D3EE] hover:bg-[#67e8f9] text-[#080D1B] font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-cyan-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>File New Complaint</span>
        </Link>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Submitted"
          value={totalCount}
          icon={FileText}
          subtext="Lifetime student tickets"
          accentColor="cyan"
        />
        <StatCard
          label="Under Review"
          value={underReviewCount}
          icon={Clock}
          subtext="Awaiting initial triage"
          accentColor="violet"
        />
        <StatCard
          label="In Progress"
          value={inProgressCount}
          icon={AlertCircle}
          subtext="Assigned to department"
          accentColor="amber"
        />
        <StatCard
          label="Resolved"
          value={resolvedCount}
          icon={CheckCircle2}
          subtext="Successfully verified"
          accentColor="emerald"
        />
      </div>

      {/* Recent Complaints Table/Card Section */}
      <div className="rounded-2xl bg-[#10182B] border border-white/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-[#F1F5F9]">Recent Complaints</h2>
            <p className="text-xs text-[#A7B4CC] mt-0.5">Your most recently reported issues</p>
          </div>
          {complaints.length > 0 && (
            <Link
              to="/student/complaints"
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 transition-colors"
            >
              <span>View all ({totalCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {errorMsg && <ErrorBanner message={errorMsg} onRetry={loadData} />}

        {isLoading ? (
          <LoadingSkeleton rows={4} />
        ) : complaints.length === 0 ? (
          <EmptyState
            title="No complaints filed yet"
            description="Notice a maintenance problem, broken equipment, or campus service issue? File your first ticket."
            action={{
              label: 'File Your First Complaint',
              onClick: () => (window.location.href = '/student/submit'),
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-semibold text-[#A7B4CC] uppercase tracking-wider">
                  <th className="py-3 px-4">Title / ID</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Filed</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-[#F1F5F9]">
                {recentComplaints.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100 max-w-xs truncate">{item.title}</div>
                      <div className="text-[11px] text-[#A7B4CC] tabular-nums mt-0.5">
                        ID: {item.id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#A7B4CC]">{item.category}</td>
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
                        to={`/student/complaints/${item.id}`}
                        className="p-1.5 rounded-lg bg-[#151F35] hover:bg-[#1C2942] text-cyan-300 hover:text-white inline-flex items-center gap-1.5 transition-colors border border-white/5"
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium hidden sm:inline">Details</span>
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
