import React, { useEffect, useState, useCallback } from 'react';
import { complaintService } from '../../services/complaintService';
import { Complaint, ComplaintStatus, PriorityLevel } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';
import { formatApiErrorMessage } from '../../services/apiClient';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  X,
  History,
} from 'lucide-react';

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'All Cases', value: 'all' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Under Review', value: 'under_review' },
];

export const StaffQueuePage: React.FC = () => {
  const { success, error } = useToast();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Status & Progress Update Modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState<string>('in_progress');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Updates history modal
  const [historyComplaint, setHistoryComplaint] = useState<Complaint | null>(null);
  const [historyUpdates, setHistoryUpdates] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

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

  const handleOpenUpdateModal = (c: Complaint) => {
    setSelectedComplaint(c);
    setNewStatus(c.status === 'assigned' ? 'in_progress' : c.status);
    setStatusMessage('');
  };

  const handleSubmitStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setIsUpdating(true);
    try {
      // Calls confirmed PATCH /complaints/{cid}/status endpoint
      await complaintService.updateStatus(selectedComplaint.id, {
        status: newStatus,
        message: statusMessage.trim(),
      });

      success(
        'Work Progress Logged',
        `Complaint #${selectedComplaint.id.slice(0, 8)} status set to ${newStatus.replace(/_/g, ' ')}.`
      );
      setSelectedComplaint(null);
      loadComplaints();
    } catch (err) {
      error('Failed to Update Status', formatApiErrorMessage(err));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleViewHistory = async (c: Complaint) => {
    setHistoryComplaint(c);
    setIsLoadingHistory(true);
    try {
      const data = await complaintService.getUpdates(c.id);
      setHistoryUpdates(data);
    } catch (err) {
      error('Unable to fetch history', formatApiErrorMessage(err));
      setHistoryUpdates([]);
    } finally {
      setIsLoadingHistory(false);
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
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight">
          Department Work Queue
        </h1>
        <p className="text-xs sm:text-sm text-[#A7B4CC] mt-0.5">
          Review complaints assigned to your department, record field diagnostics, and submit resolution notices.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#10182B] border border-white/5 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#A7B4CC] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search work queue by title, category, location, or ticket ID..."
            className="w-full bg-[#151F35] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-[#F1F5F9] placeholder:text-[#A7B4CC]/40 focus:outline-hidden focus:border-cyan-400/60 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-[#A7B4CC] mr-2 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Status:</span>
          </span>
          {STATUS_OPTIONS.map((f) => (
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
            title="No complaints in queue"
            description="There are currently no tickets matching the selected status and search criteria."
            action={{
              label: 'Reset Filters',
              onClick: () => {
                setSearchQuery('');
                setActiveFilter('all');
              },
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-semibold text-[#A7B4CC] uppercase tracking-wider">
                  <th className="py-3 px-4">Ticket / Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Received</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-[#F1F5F9]">
                {filteredComplaints.map((item) => (
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
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button
                          onClick={() => handleViewHistory(item)}
                          className="p-1.5 rounded-lg bg-[#151F35] hover:bg-[#1C2942] text-[#A7B4CC] hover:text-[#F1F5F9] transition-colors border border-white/5"
                          title="View update history"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenUpdateModal(item)}
                          className="px-3 py-1.5 rounded-lg bg-[#22D3EE] hover:bg-[#67e8f9] text-[#080D1B] font-semibold text-xs transition-colors inline-flex items-center gap-1.5"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Update Work</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Status & Work Progress Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-[#151F35] border border-white/10 p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedComplaint(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-semibold text-[#F1F5F9] mb-1">Update Case Progress</h3>
            <p className="text-xs text-[#A7B4CC] mb-4 truncate">
              {selectedComplaint.title} (#{selectedComplaint.id.slice(0, 8)})
            </p>

            <form onSubmit={handleSubmitStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#A7B4CC] mb-1.5">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-[#10182B] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-[#F1F5F9] focus:outline-hidden focus:border-cyan-400"
                >
                  <option value="in_progress">In Progress (Active Maintenance)</option>
                  <option value="resolved">Resolved (Completed & Tested)</option>
                  <option value="assigned">Assigned (Awaiting Field Team)</option>
                  <option value="under_review">Under Review (Requires Inspection)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7B4CC] mb-1.5">
                  Progress Note or Resolution Details
                </label>
                <textarea
                  required
                  rows={4}
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                  placeholder="e.g. Field technician dispatched. Replaced faulty fuse box and tested circuit. Normal operation restored."
                  className="w-full bg-[#10182B] border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-[#F1F5F9] placeholder:text-[#A7B4CC]/40 focus:outline-hidden focus:border-cyan-400 resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-3 py-2 text-xs font-medium text-[#A7B4CC] hover:text-[#F1F5F9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || !statusMessage.trim()}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#22D3EE] hover:bg-[#67e8f9] text-[#080D1B] disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {isUpdating ? (
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Post Status Update</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update History Modal */}
      {historyComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-[#151F35] border border-white/10 p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setHistoryComplaint(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-semibold text-[#F1F5F9] mb-1">Case Update History</h3>
            <p className="text-xs text-[#A7B4CC] mb-4 truncate">{historyComplaint.title}</p>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {isLoadingHistory ? (
                <LoadingSkeleton rows={3} />
              ) : historyUpdates.length === 0 ? (
                <p className="text-xs text-[#A7B4CC] text-center py-8">
                  No progress entries recorded yet.
                </p>
              ) : (
                historyUpdates.map((u, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#10182B] border border-white/5 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-[#A7B4CC] mb-1">
                      <span className="font-semibold text-cyan-300">
                        {u.status ? u.status.replace(/_/g, ' ') : 'Update'}
                      </span>
                      <span className="tabular-nums">{new Date(u.created_at).toLocaleString()}</span>
                    </div>
                    {u.message && <p className="text-slate-200 mt-1">{u.message}</p>}
                    {u.user_name && (
                      <span className="text-[10px] text-[#A7B4CC] block mt-1">Logged by: {u.user_name}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
