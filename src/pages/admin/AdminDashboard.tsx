import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { approvalService } from '../../services/approvalService';
import { analyticsService } from '../../services/analyticsService';
import { agentService } from '../../services/agentService';
import { Complaint, FollowupApproval, AnalyticsData } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { useToast } from '../../context/ToastContext';
import { formatApiErrorMessage } from '../../services/apiClient';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  LayoutDashboard,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Users,
  Building2,
  Cpu,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { success, error } = useToast();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [approvals, setApprovals] = useState<FollowupApproval[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRunningFollowup, setIsRunningFollowup] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [comps, apps, anlyt] = await Promise.all([
        complaintService.getComplaints().catch(() => []),
        approvalService.getApprovals().catch(() => []),
        analyticsService.getAnalytics().catch(() => null),
      ]);
      setComplaints(comps);
      setApprovals(apps);
      setAnalytics(anlyt);
    } catch (err) {
      setErrorMsg(formatApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derive real statistics from verified endpoints
  const totalComplaints = analytics?.total_complaints ?? complaints.length;
  const openComplaints =
    analytics?.open_complaints ??
    complaints.filter(
      (c) => c.status === 'submitted' || c.status === 'under_review' || c.status === 'assigned'
    ).length;
  const inProgressComplaints =
    analytics?.in_progress ?? complaints.filter((c) => c.status === 'in_progress').length;
  const resolvedComplaints =
    analytics?.resolved ?? complaints.filter((c) => c.status === 'resolved').length;
  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length;
  const urgentCount = complaints.filter(
    (c) =>
      (c.priority === 'urgent' || c.priority === 'high') &&
      c.status !== 'resolved' &&
      c.status !== 'closed'
  ).length;

  // Chart data: by category
  const categoryCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    const cat = c.category || 'Uncategorized';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const categoryChartData = Object.entries(categoryCounts).map(([name, count]) => ({
    name: name.length > 14 ? `${name.slice(0, 14)}…` : name,
    count,
  }));

  // Chart data: by status
  const statusCounts: Record<string, number> = {
    Submitted: 0,
    Assigned: 0,
    'In Progress': 0,
    Resolved: 0,
  };
  complaints.forEach((c) => {
    if (c.status === 'submitted' || c.status === 'under_review') statusCounts['Submitted']++;
    else if (c.status === 'assigned') statusCounts['Assigned']++;
    else if (c.status === 'in_progress') statusCounts['In Progress']++;
    else if (c.status === 'resolved' || c.status === 'closed') statusCounts['Resolved']++;
  });
  const statusChartData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const STATUS_COLORS = ['#22D3EE', '#818CF8', '#FBBF24', '#34D399'];

  const handleRunFollowupAgent = async () => {
    if (complaints.length === 0) {
      error('No Complaints', 'No complaints exist to run the follow-up agent against.');
      return;
    }
    const targetComplaint = complaints.find(
      (c) => c.status === 'assigned' || c.status === 'in_progress'
    ) || complaints[0];

    setIsRunningFollowup(true);
    try {
      await agentService.runFollowupAgent(targetComplaint.id);
      success(
        'Follow-up Agent Executed',
        `Analyzed complaint #${targetComplaint.id.slice(0, 8)}. Check AI Approvals for any generated recommendations.`
      );
      loadData();
    } catch (err) {
      error('Agent Execution Notice', formatApiErrorMessage(err));
    } finally {
      setIsRunningFollowup(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Executive Command Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#10182B] to-[#151F35] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-500/15 border border-violet-500/30 text-xs font-semibold text-violet-300 mb-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>Campus Operations Command Center</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight">
            Administrator Overview & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B4CC] mt-0.5">
            Real-time oversight of university complaints, department assignments, and pending AI follow-up approvals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRunFollowupAgent}
            disabled={isRunningFollowup}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-colors whitespace-nowrap shadow-sm shadow-violet-500/20 disabled:opacity-50"
          >
            {isRunningFollowup ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Trigger Follow-up AI</span>
          </button>
        </div>
      </div>

      {errorMsg && <ErrorBanner message={errorMsg} onRetry={loadData} />}

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Volume"
          value={totalComplaints}
          icon={FileText}
          subtext="Campus complaints logged"
          accentColor="cyan"
        />
        <StatCard
          label="Open / In Triage"
          value={openComplaints}
          icon={Clock}
          subtext="Awaiting or in routing"
          accentColor="violet"
        />
        <StatCard
          label="In Progress"
          value={inProgressComplaints}
          icon={AlertTriangle}
          subtext="Active field repairs"
          accentColor="amber"
        />
        <StatCard
          label="Resolved"
          value={resolvedComplaints}
          icon={CheckCircle2}
          subtext="Verified completions"
          accentColor="emerald"
        />
        <StatCard
          label="AI Approvals Pending"
          value={pendingApprovalsCount}
          icon={Sparkles}
          subtext="Requires admin decision"
          accentColor="rose"
        />
      </div>

      {/* Pending Follow-up Approvals Alert Card */}
      {pendingApprovalsCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-amber-200">
                {pendingApprovalsCount} AI Follow-up Recommendation(s) Pending Review
              </h4>
              <p className="text-xs text-amber-300/80">
                Autonomous agent detected stale cases requiring reminder approval.
              </p>
            </div>
          </div>
          <Link
            to="/admin/approvals"
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-[#080D1B] font-semibold text-xs hover:bg-amber-400 transition-colors whitespace-nowrap"
          >
            Review Approvals
          </Link>
        </div>
      )}

      {/* Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="lg:col-span-7 rounded-2xl bg-[#10182B] border border-white/5 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[#F1F5F9]">Complaints by Category</h2>
              <p className="text-xs text-[#A7B4CC]">Incident distribution across campus facilities</p>
            </div>
            <span className="text-[11px] font-mono text-[#A7B4CC]">
              {categoryChartData.length} active categories
            </span>
          </div>

          <div className="flex-1 min-h-[260px] w-full">
            {isLoading ? (
              <LoadingSkeleton rows={3} />
            ) : categoryChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#A7B4CC]">
                No category data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="name"
                    stroke="#A7B4CC"
                    fontSize={10}
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis stroke="#A7B4CC" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151F35',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#F1F5F9',
                    }}
                  />
                  <Bar dataKey="count" fill="#22D3EE" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="lg:col-span-5 rounded-2xl bg-[#10182B] border border-white/5 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[#F1F5F9]">Resolution Pipeline</h2>
              <p className="text-xs text-[#A7B4CC]">Current progress states</p>
            </div>
          </div>

          <div className="flex-1 min-h-[260px] w-full flex items-center justify-center">
            {isLoading ? (
              <LoadingSkeleton rows={3} />
            ) : complaints.length === 0 ? (
              <div className="text-xs text-[#A7B4CC]">No complaints recorded.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151F35',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px]">
            {statusChartData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[i] }} />
                <span className="text-[#A7B4CC]">{item.name}:</span>
                <span className="text-[#F1F5F9] font-mono tabular-nums font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Complaints & Direct Assignment CTA */}
      <div className="rounded-2xl bg-[#10182B] border border-white/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-[#F1F5F9]">All Campus Complaints</h2>
            <p className="text-xs text-[#A7B4CC] mt-0.5">Live directory from backend service</p>
          </div>
          <Link
            to="/admin/complaints"
            className="text-xs font-medium text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 transition-colors"
          >
            <span>Manage All Complaints</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {complaints.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#A7B4CC]">
            No complaint records available on the server.
          </div>
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
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-[#F1F5F9]">
                {complaints.slice(0, 5).map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100 max-w-sm truncate">{item.title}</div>
                      <div className="text-[11px] text-[#A7B4CC] font-mono mt-0.5">
                        #{item.id.slice(0, 8)}
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
                    <td className="py-3 px-4 text-right">
                      <Link
                        to="/admin/complaints"
                        className="px-2.5 py-1 rounded-md bg-[#151F35] hover:bg-[#1C2942] text-cyan-300 text-xs font-medium border border-white/5 transition-colors"
                      >
                        Assign / Review
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
