import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { Complaint, ComplaintStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import { formatApiErrorMessage } from '../../services/apiClient';
import {
  Search,
  Filter,
  Eye,
  Trash2,
  PlusCircle,
  X,
} from 'lucide-react';

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All Cases', value: 'all' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Rejected', value: 'rejected' },
];

export const MyComplaintsPage: React.FC = () => {
  const { success, error } = useToast();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cancel modal state
  const [cancellingComplaint, setCancellingComplaint] = useState<Complaint | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const loadComplaints = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await complaintService.getComplaints(
        activeFilter === 'all' ? undefined : activeFilter
      );
      setComplaints(data);
    } catch (err) {
      setErrorMsg(formatApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const handleConfirmCancel = async () => {
    if (!cancellingComplaint) return;
    setIsCancelling(true);
    try {
      await complaintService.cancelComplaint(cancellingComplaint.id);
      success('Complaint Cancelled', `Complaint ID ${cancellingComplaint.id.slice(0, 8)} has been cancelled.`);
      setCancellingComplaint(null);
      loadComplaints();
    } catch (err) {
      error('Unable to Cancel Complaint', formatApiErrorMessage(err));
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight">
            My Campus Complaints
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B4CC] mt-0.5">
            Full history of your logged complaints, real-time status updates, and audit logs.
          </p>
        </div>
        <Link
          to="/student/submit"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#22D3EE] hover:bg-[#67e8f9] text-[#080D1B] font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-cyan-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Complaint</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#10182B] border border-white/5 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#A7B4CC] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search complaints by title, category, location, or ID..."
            className="w-full bg-[#151F35] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-[#F1F5F9] placeholder:text-[#A7B4CC]/40 focus:outline-hidden focus:border-cyan-400/60 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A7B4CC] hover:text-[#F1F5F9]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-[#A7B4CC] mr-2 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </span>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeFilter === f.value
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-[#A7B4CC] hover:text-[#F1F5F9] hover:bg-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Content */}
      <div className="rounded-2xl bg-[#10182B] border border-white/5 p-6">
        {errorMsg && <ErrorBanner message={errorMsg} onRetry={loadComplaints} />}

        {isLoading ? (
          <LoadingSkeleton rows={5} />
        ) : filteredComplaints.length === 0 ? (
          <EmptyState
            title="No complaints match your filters"
            description={
              searchQuery
                ? 'Try adjusting your search terms or resetting the status filter.'
                : 'You have no complaints logged under this status.'
            }
            action={
              searchQuery || activeFilter !== 'all'
                ? {
                    label: 'Reset Filters',
                    onClick: () => {
                      setSearchQuery('');
                      setActiveFilter('all');
                    },
                  }
                : {
                    label: 'File a Complaint',
                    onClick: () => (window.location.href = '/student/submit'),
                  }
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-semibold text-[#A7B4CC] uppercase tracking-wider">
                  <th className="py-3 px-4">Complaint ID & Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-[#F1F5F9]">
                {filteredComplaints.map((item) => {
                  const isCancellable =
                    item.status === 'submitted' || item.status === 'under_review';

                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-100 max-w-sm truncate">{item.title}</div>
                        <div className="text-[11px] text-[#A7B4CC] font-mono mt-0.5">
                          #{item.id.slice(0, 8)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#A7B4CC]">{item.category}</td>
                      <td className="py-3 px-4 text-[#A7B4CC] max-w-xs truncate">{item.location}</td>
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
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <Link
                            to={`/student/complaints/${item.id}`}
                            className="p-1.5 rounded-lg bg-[#151F35] hover:bg-[#1C2942] text-cyan-300 hover:text-white transition-colors border border-white/5"
                            title="View full details and updates"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {isCancellable && (
                            <button
                              onClick={() => setCancellingComplaint(item)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors border border-rose-500/20"
                              title="Cancel this eligible complaint"
                              aria-label="Cancel complaint"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancellation Confirmation Modal */}
      <ConfirmModal
        isOpen={!!cancellingComplaint}
        title="Cancel Campus Complaint?"
        message={`Are you sure you want to cancel "${cancellingComplaint?.title}"? This endpoint cancels eligible complaints without hard-deleting the audit record.`}
        confirmLabel="Cancel Complaint"
        isDestructive={true}
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancellingComplaint(null)}
      />
    </div>
  );
};
