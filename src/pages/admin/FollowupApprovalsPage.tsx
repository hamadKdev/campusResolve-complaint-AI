import React, { useEffect, useState, useCallback } from 'react';
import { approvalService, CreateApprovalPayload } from '../../services/approvalService';
import { complaintService } from '../../services/complaintService';
import { agentService } from '../../services/agentService';
import { FollowupApproval, Complaint, RecommendedAction, ApprovalStatus } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import { formatApiErrorMessage } from '../../services/apiClient';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Eye,
  PlusCircle,
  FileText,
  AlertCircle,
  Send,
  X,
  Bot,
  HelpCircle,
} from 'lucide-react';

export const FollowupApprovalsPage: React.FC = () => {
  const { success, error } = useToast();

  const [approvals, setApprovals] = useState<FollowupApproval[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<'all' | ApprovalStatus>('all');

  // Review confirmation modal
  const [reviewingApproval, setReviewingApproval] = useState<FollowupApproval | null>(null);
  const [decision, setDecision] = useState<'approved' | 'rejected'>('approved');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  // Detail panel modal
  const [activeApproval, setActiveApproval] = useState<FollowupApproval | null>(null);

  // Manual Create Approval Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState('');
  const [recommendedAction, setRecommendedAction] = useState<RecommendedAction>('remind');
  const [reason, setReason] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Agent execution
  const [isRunningAgent, setIsRunningAgent] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [apps, comps] = await Promise.all([
        approvalService.getApprovals(),
        complaintService.getComplaints().catch(() => []),
      ]);
      setApprovals(apps);
      setComplaints(comps);
    } catch (err) {
      setErrorMsg(formatApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenReview = (approval: FollowupApproval, dec: 'approved' | 'rejected') => {
    setReviewingApproval(approval);
    setDecision(dec);
  };

  const handleConfirmReview = async () => {
    if (!reviewingApproval) return;
    setIsSubmittingDecision(true);
    try {
      await approvalService.reviewApproval(reviewingApproval.id, decision);
      success(
        `Recommendation ${decision === 'approved' ? 'Approved' : 'Rejected'}`,
        `Approval ID #${reviewingApproval.id.slice(0, 8)} updated to ${decision}.`
      );
      setReviewingApproval(null);
      if (activeApproval?.id === reviewingApproval.id) {
        setActiveApproval(null);
      }
      loadData();
    } catch (err) {
      error('Review Submission Failed', formatApiErrorMessage(err));
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleCreateApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaintId || !reason.trim()) {
      error('Validation Error', 'Complaint ID and reasoning are required.');
      return;
    }

    setIsCreating(true);
    try {
      await approvalService.createApproval({
        complaint_id: selectedComplaintId,
        recommended_action: recommendedAction,
        reason: reason.trim(),
      });
      success('Recommendation Created', 'New follow-up approval request recorded.');
      setIsCreateModalOpen(false);
      setSelectedComplaintId('');
      setReason('');
      loadData();
    } catch (err) {
      error('Creation Failed', formatApiErrorMessage(err));
    } finally {
      setIsCreating(false);
    }
  };

  const handleTriggerFollowupAgent = async () => {
    if (complaints.length === 0) {
      error('Notice', 'No complaints exist to trigger follow-up agent against.');
      return;
    }
    const target = complaints.find((c) => c.status !== 'resolved' && c.status !== 'closed') || complaints[0];

    setIsRunningAgent(true);
    try {
      await agentService.runFollowupAgent(target.id);
      success('Follow-up Agent Executed', `Agent evaluated complaint #${target.id.slice(0, 8)}.`);
      loadData();
    } catch (err) {
      error('Agent Execution', formatApiErrorMessage(err));
    } finally {
      setIsRunningAgent(false);
    }
  };

  const filteredApprovals = approvals.filter((a) => {
    if (statusFilter === 'all') return true;
    return a.status === statusFilter;
  });

  const getAssociatedComplaint = (cid: string) => {
    return complaints.find((c) => c.id === cid);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#10182B] to-[#151F35] border border-white/5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-500/15 border border-violet-500/30 text-xs font-semibold text-violet-300 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Human-in-the-Loop AI Oversight</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight">
            AI Follow-Up Approvals
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B4CC] mt-0.5">
            Review recommendations generated by autonomous n8n Follow-up Agents. Approve or reject escalations with full auditability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerFollowupAgent}
            disabled={isRunningAgent}
            className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5 shadow-sm shadow-violet-500/20 disabled:opacity-50"
          >
            {isRunningAgent ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
            <span>Run Follow-up Agent</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#22D3EE] hover:bg-[#67e8f9] text-[#080D1B] font-semibold text-xs transition-colors inline-flex items-center gap-1.5 shadow-sm shadow-cyan-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Recommendation</span>
          </button>
        </div>
      </div>

      {/* Explanation Banner */}
      <div className="p-4 rounded-xl bg-[#10182B] border border-white/5 flex items-start gap-3 text-xs text-[#A7B4CC]">
        <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-[#F1F5F9]">Administrative Control Principle:</strong> Approving an AI
          recommendation updates its status on the university server. No reminder or escalation is dispatched without verified human authorization.
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <span className="text-xs text-[#A7B4CC] mr-2 shrink-0 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Status:</span>
        </span>
        {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              statusFilter === s
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                : 'text-[#A7B4CC] hover:text-[#F1F5F9] hover:bg-white/5'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Approvals Table */}
      <div className="rounded-2xl bg-[#10182B] border border-white/5 p-6">
        {errorMsg && <ErrorBanner message={errorMsg} onRetry={loadData} />}

        {isLoading ? (
          <LoadingSkeleton rows={5} />
        ) : filteredApprovals.length === 0 ? (
          <EmptyState
            title="No AI approvals found"
            description={
              statusFilter !== 'all'
                ? `No follow-up recommendations currently marked as "${statusFilter}".`
                : 'No pending AI follow-up requests. Trigger the agent or create a recommendation.'
            }
            action={{
              label: 'Trigger Agent Check',
              onClick: handleTriggerFollowupAgent,
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-semibold text-[#A7B4CC] uppercase tracking-wider">
                  <th className="py-3 px-4">Approval ID / Ticket</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">AI Reasoning</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-[#F1F5F9]">
                {filteredApprovals.map((item) => {
                  const comp = getAssociatedComplaint(item.complaint_id);
                  const isPending = item.status === 'pending';

                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-100 font-mono">
                          #{item.id.slice(0, 8)}
                        </div>
                        <div className="text-[11px] text-[#A7B4CC] truncate max-w-xs mt-0.5">
                          {comp ? comp.title : `Ticket: ${item.complaint_id.slice(0, 8)}...`}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs font-semibold uppercase tracking-wider ${
                            item.recommended_action === 'escalate'
                              ? 'text-rose-400'
                              : item.recommended_action === 'remind'
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {item.recommended_action}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-sm">
                        <p className="text-xs text-[#A7B4CC] line-clamp-2 leading-relaxed">
                          {item.reason}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            item.status === 'approved'
                              ? 'text-emerald-400'
                              : item.status === 'rejected'
                              ? 'text-rose-400'
                              : 'text-amber-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.status === 'approved'
                                ? 'bg-emerald-400'
                                : item.status === 'rejected'
                                ? 'bg-rose-400'
                                : 'bg-amber-400'
                            }`}
                          />
                          <span className="capitalize">{item.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#A7B4CC] tabular-nums whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2 justify-end">
                          <button
                            onClick={() => setActiveApproval(item)}
                            className="p-1.5 rounded-lg bg-[#151F35] hover:bg-[#1C2942] text-[#A7B4CC] hover:text-[#F1F5F9] transition-colors border border-white/5"
                            title="Inspect complete recommendation"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {isPending && (
                            <>
                              <button
                                onClick={() => handleOpenReview(item, 'rejected')}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-medium text-xs transition-colors border border-rose-500/20"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleOpenReview(item, 'approved')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-medium text-xs transition-colors border border-emerald-500/20"
                              >
                                Approve
                              </button>
                            </>
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

      {/* Inspect Approval Detail Modal */}
      {activeApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-[#151F35] border border-white/10 p-6 shadow-2xl relative">
            <button
              onClick={() => setActiveApproval(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-mono text-cyan-400">
                #{activeApproval.id}
              </span>
              <span
                className={`text-xs font-semibold uppercase px-2 py-0.5 rounded border ${
                  activeApproval.status === 'approved'
                    ? 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10'
                    : activeApproval.status === 'rejected'
                    ? 'border-rose-500/30 text-rose-300 bg-rose-500/10'
                    : 'border-amber-500/30 text-amber-300 bg-amber-500/10'
                }`}
              >
                {activeApproval.status}
              </span>
            </div>

            <h3 className="text-base font-bold text-[#F1F5F9] mb-1">
              Recommended Action: {activeApproval.recommended_action.toUpperCase()}
            </h3>

            <div className="mt-4 p-4 rounded-xl bg-[#10182B] border border-white/5 space-y-2 text-xs">
              <span className="text-[#A7B4CC] block font-semibold">AI Reasoning:</span>
              <p className="text-[#F1F5F9] leading-relaxed whitespace-pre-wrap">{activeApproval.reason}</p>
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-[#10182B] border border-white/5 space-y-1.5 text-xs text-[#A7B4CC]">
              <div>Complaint UUID: <span className="font-mono text-cyan-300">{activeApproval.complaint_id}</span></div>
              <div>Created: <span className="tabular-nums">{new Date(activeApproval.created_at).toLocaleString()}</span></div>
              {activeApproval.reviewed_at && (
                <div>Reviewed At: <span className="tabular-nums">{new Date(activeApproval.reviewed_at).toLocaleString()}</span></div>
              )}
            </div>

            {activeApproval.status === 'pending' && (
              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  onClick={() => handleOpenReview(activeApproval, 'rejected')}
                  className="px-4 py-2 text-xs font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg"
                >
                  Reject Action
                </button>
                <button
                  onClick={() => handleOpenReview(activeApproval, 'approved')}
                  className="px-4 py-2 text-xs font-medium text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg"
                >
                  Approve Action
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Create Approval Request Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-[#151F35] border border-white/10 p-6 shadow-2xl relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-semibold text-[#F1F5F9] mb-4">
              Create Follow-up Approval Request
            </h3>

            <form onSubmit={handleCreateApproval} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#A7B4CC] mb-1.5">
                  Target Complaint
                </label>
                <select
                  required
                  value={selectedComplaintId}
                  onChange={(e) => setSelectedComplaintId(e.target.value)}
                  className="w-full bg-[#10182B] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-[#F1F5F9] focus:outline-hidden focus:border-cyan-400"
                >
                  <option value="" disabled>Select a complaint</option>
                  {complaints.map((c) => (
                    <option key={c.id} value={c.id}>
                      #{c.id.slice(0, 8)} - {c.title.slice(0, 35)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7B4CC] mb-1.5">
                  Recommended Action
                </label>
                <select
                  value={recommendedAction}
                  onChange={(e) => setRecommendedAction(e.target.value as RecommendedAction)}
                  className="w-full bg-[#10182B] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-[#F1F5F9] focus:outline-hidden focus:border-cyan-400"
                >
                  <option value="remind">Remind (Department Reminder)</option>
                  <option value="escalate">Escalate (Elevate to Urgent Supervision)</option>
                  <option value="none">None (Audited Oversight)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7B4CC] mb-1.5">
                  Reason for Recommendation
                </label>
                <textarea
                  required
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Complaint has remained unaddressed for over 72 hours despite urgent priority flag."
                  className="w-full bg-[#10182B] border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-[#F1F5F9] focus:outline-hidden focus:border-cyan-400 resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-[#A7B4CC] hover:text-[#F1F5F9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#22D3EE] hover:bg-[#67e8f9] text-[#080D1B] disabled:opacity-50"
                >
                  {isCreating ? 'Recording...' : 'Create Approval Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Confirmation Modal */}
      <ConfirmModal
        isOpen={!!reviewingApproval}
        title={`${decision === 'approved' ? 'Approve' : 'Reject'} AI Recommendation?`}
        message={`Are you sure you want to mark recommendation #${reviewingApproval?.id.slice(0, 8)} (${reviewingApproval?.recommended_action.toUpperCase()}) as ${decision}? This updates the approval record in the database.`}
        confirmLabel={`Confirm ${decision}`}
        isDestructive={decision === 'rejected'}
        isLoading={isSubmittingDecision}
        onConfirm={handleConfirmReview}
        onCancel={() => setReviewingApproval(null)}
      />
    </div>
  );
};
