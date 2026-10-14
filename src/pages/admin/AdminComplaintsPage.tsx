import React, { useEffect, useState, useCallback } from 'react';
import { complaintService } from '../../services/complaintService';
import { departmentService } from '../../services/departmentService';
import { userService } from '../../services/userService';
import { assignmentService } from '../../services/assignmentService';
import { agentService } from '../../services/agentService';
import { Complaint, Department, UserProfile } from '../../types';
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
  UserCheck,
  Sparkles,
  Eye,
  Trash2,
  X,
  Building2,
  Cpu,
  History,
  Send,
} from 'lucide-react';

export const AdminComplaintsPage: React.FC = () => {
  const { success, error } = useToast();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Assignment Modal State
  const [assigningComplaint, setAssigningComplaint] = useState<Complaint | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Cancellation Modal State
  const [cancellingComplaint, setCancellingComplaint] = useState<Complaint | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // AI Agent Running state
  const [runningAgentCid, setRunningAgentCid] = useState<string | null>(null);

  // Detail Drawer State
  const [inspectingComplaint, setInspectingComplaint] = useState<Complaint | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [comps, depts, usrs] = await Promise.all([
        complaintService.getComplaints(statusFilter === 'all' ? undefined : statusFilter),
        departmentService.getDepartments().catch(() => []),
        userService.getUsers().catch(() => []),
      ]);
      setComplaints(comps);
      setDepartments(depts);
      setUsers(usrs);
    } catch (err) {
      setErrorMsg(formatApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Assign Modal
  const handleOpenAssignModal = (complaint: Complaint) => {
    setAssigningComplaint(complaint);
    setSelectedDeptId(complaint.department_id || (departments[0]?.id ?? ''));
    setSelectedStaffId(complaint.assigned_to || '');
  };

  // Filter staff belonging to selected department
  const eligibleStaff = users.filter((u) => {
    if (u.role !== 'staff' && u.role !== 'admin') return false;
    if (!selectedDeptId) return true;
    return u.department_id === selectedDeptId || !u.department_id;
  });

  const handleConfirmAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningComplaint || !selectedDeptId || !selectedStaffId) {
      error('Missing Selection', 'Please select both a department and a staff assignee.');
      return;
    }

    setIsAssigning(true);
    try {
      await assignmentService.assignComplaint({
        complaint_id: assigningComplaint.id,
        department_id: selectedDeptId,
        staff_id: selectedStaffId,
      });

      success('Assignment Recorded', `Complaint assigned to staff member.`);
      setAssigningComplaint(null);
      loadData();
    } catch (err) {
      error('Assignment Failed', formatApiErrorMessage(err));
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRunTriage = async (cid: string) => {
    setRunningAgentCid(cid);
    try {
      const res = await agentService.runTriage(cid);
      success('AI Triage Complete', 'Classification and urgency recommendations updated.');
      loadData();
    } catch (err) {
      error('Triage Notice', formatApiErrorMessage(err));
    } finally {
      setRunningAgentCid(null);
    }
  };

  const handleRunAssignmentAgent = async (cid: string) => {
    setRunningAgentCid(cid);
    try {
      const res = await agentService.runAssignmentAgent(cid);
      success('AI Assignment Agent Run', 'Agent evaluated best matching department and technician.');
      loadData();
    } catch (err) {
      error('Assignment Agent Notice', formatApiErrorMessage(err));
    } finally {
      setRunningAgentCid(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingComplaint) return;
    setIsCancelling(true);
    try {
      await complaintService.cancelComplaint(cancellingComplaint.id);
      success('Complaint Cancelled', `Complaint #${cancellingComplaint.id.slice(0, 8)} marked as cancelled.`);
      setCancellingComplaint(null);
      loadData();
    } catch (err) {
      error('Cancel Failed', formatApiErrorMessage(err));
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
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight">
          Campus Complaints Management
        </h1>
        <p className="text-xs sm:text-sm text-[#A7B4CC] mt-0.5">
          Review student grievances, trigger autonomous AI triage, and dispatch work to department technicians.
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
            placeholder="Search all complaints by title, category, location, or UUID..."
            className="w-full bg-[#151F35] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-[#F1F5F9] placeholder:text-[#A7B4CC]/40 focus:outline-hidden focus:border-cyan-400/60 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-[#A7B4CC] mr-2 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </span>
          {[
            { label: 'All Cases', value: 'all' },
            { label: 'Submitted', value: 'submitted' },
            { label: 'Under Review', value: 'under_review' },
            { label: 'Assigned', value: 'assigned' },
            { label: 'In Progress', value: 'in_progress' },
            { label: 'Resolved', value: 'resolved' },
            { label: 'Cancelled', value: 'cancelled' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === f.value
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-[#A7B4CC] hover:text-[#F1F5F9] hover:bg-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Directory Table */}
      <div className="rounded-2xl bg-[#10182B] border border-white/5 p-6">
        {errorMsg && <ErrorBanner message={errorMsg} onRetry={loadData} />}

        {isLoading ? (
          <LoadingSkeleton rows={6} />
        ) : filteredComplaints.length === 0 ? (
          <EmptyState
            title="No complaints found"
            description="No tickets match the search query or status criteria."
            action={{
              label: 'Reset Filters',
              onClick: () => {
                setSearchQuery('');
                setStatusFilter('all');
              },
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-semibold text-[#A7B4CC] uppercase tracking-wider">
                  <th className="py-3 px-4">Ticket / Title</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Dept / Staff</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-[#F1F5F9]">
                {filteredComplaints.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100 max-w-xs truncate">{item.title}</div>
                      <div className="text-[11px] text-[#A7B4CC] font-mono mt-0.5">
                        #{item.id.slice(0, 8)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#A7B4CC] max-w-xs truncate">{item.location}</td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3 px-4 text-[#A7B4CC]">
                      {item.department_name ? (
                        <div className="font-medium text-[#F1F5F9]">{item.department_name}</div>
                      ) : (
                        <span className="text-amber-400/90 italic">Unassigned</span>
                      )}
                      {item.assigned_staff_name && (
                        <div className="text-[10px] text-[#A7B4CC]">Staff: {item.assigned_staff_name}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#A7B4CC] tabular-nums whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => setInspectingComplaint(item)}
                          className="p-1.5 rounded-lg bg-[#151F35] hover:bg-[#1C2942] text-[#A7B4CC] hover:text-[#F1F5F9] transition-colors border border-white/5"
                          title="Inspect details and updates"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleRunTriage(item.id)}
                          disabled={runningAgentCid === item.id}
                          className="p-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 transition-colors border border-violet-500/20 disabled:opacity-50"
                          title="Run Agentic AI Triage"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenAssignModal(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#22D3EE] hover:bg-[#67e8f9] text-[#080D1B] font-semibold text-xs transition-colors inline-flex items-center gap-1"
                          title="Assign to department"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Assign</span>
                        </button>

                        <button
                          onClick={() => setCancellingComplaint(item)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors border border-rose-500/20"
                          title="Cancel complaint"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Assignment Modal (POST /assignments) */}
      {assigningComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-[#151F35] border border-white/10 p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setAssigningComplaint(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <h3 className="text-base font-semibold text-[#F1F5F9]">Assign Complaint to Department</h3>
            </div>
            <p className="text-xs text-[#A7B4CC] mb-4 truncate">
              {assigningComplaint.title} (#{assigningComplaint.id.slice(0, 8)})
            </p>

            <form onSubmit={handleConfirmAssignment} className="space-y-4">
              {/* Department selector */}
              <div>
                <label className="block text-xs font-medium text-[#A7B4CC] mb-1.5">
                  Target Department
                </label>
                <select
                  required
                  value={selectedDeptId}
                  onChange={(e) => {
                    setSelectedDeptId(e.target.value);
                    setSelectedStaffId('');
                  }}
                  className="w-full bg-[#10182B] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-[#F1F5F9] focus:outline-hidden focus:border-cyan-400"
                >
                  <option value="" disabled>Select department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} {d.code ? `(${d.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Staff assignee selector */}
              <div>
                <label className="block text-xs font-medium text-[#A7B4CC] mb-1.5">
                  Assigned Staff Member
                </label>
                <select
                  required
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full bg-[#10182B] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-[#F1F5F9] focus:outline-hidden focus:border-cyan-400"
                >
                  <option value="" disabled>Select department staff</option>
                  {eligibleStaff.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.email})
                    </option>
                  ))}
                  {eligibleStaff.length === 0 && (
                    <option value="" disabled>No staff registered in this department</option>
                  )}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setAssigningComplaint(null)}
                  className="px-3 py-2 text-xs font-medium text-[#A7B4CC] hover:text-[#F1F5F9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning || !selectedDeptId || !selectedStaffId}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#22D3EE] hover:bg-[#67e8f9] text-[#080D1B] disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {isAssigning && (
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>Confirm Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Detail Drawer */}
      {inspectingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-[#151F35] border border-white/10 p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setInspectingComplaint(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-cyan-400">
                #{inspectingComplaint.id}
              </span>
              <StatusBadge status={inspectingComplaint.status} />
              <PriorityBadge priority={inspectingComplaint.priority} />
            </div>

            <h3 className="text-base font-bold text-[#F1F5F9] mb-2">
              {inspectingComplaint.title}
            </h3>

            <p className="text-xs text-[#A7B4CC] leading-relaxed mb-4 whitespace-pre-wrap">
              {inspectingComplaint.description}
            </p>

            <div className="p-3.5 rounded-xl bg-[#10182B] border border-white/5 space-y-2 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-[#A7B4CC]">Location:</span>
                <span className="text-[#F1F5F9]">{inspectingComplaint.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A7B4CC]">Category:</span>
                <span className="text-[#F1F5F9]">{inspectingComplaint.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A7B4CC]">Department:</span>
                <span className="text-[#F1F5F9]">
                  {inspectingComplaint.department_name || 'Not assigned'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A7B4CC]">Assigned Staff:</span>
                <span className="text-[#F1F5F9]">
                  {inspectingComplaint.assigned_staff_name || 'None'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
              <button
                onClick={() => {
                  const comp = inspectingComplaint;
                  setInspectingComplaint(null);
                  handleOpenAssignModal(comp);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#22D3EE] text-[#080D1B] font-semibold text-xs"
              >
                Assign Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      <ConfirmModal
        isOpen={!!cancellingComplaint}
        title="Cancel Campus Complaint?"
        message={`Are you sure you want to cancel "${cancellingComplaint?.title}"?`}
        confirmLabel="Cancel Complaint"
        isDestructive={true}
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancellingComplaint(null)}
      />
    </div>
  );
};
