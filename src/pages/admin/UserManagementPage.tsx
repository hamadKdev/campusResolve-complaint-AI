import React, { useEffect, useState, useCallback } from 'react';
import { userService, SetUserRolePayload } from '../../services/userService';
import { departmentService } from '../../services/departmentService';
import { UserProfile, Department, UserRole } from '../../types';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import { formatApiErrorMessage } from '../../services/apiClient';
import {
  Users,
  Shield,
  Building2,
  Search,
  Check,
  Edit2,
  X,
  UserCheck,
} from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const { success, error } = useToast();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  // Role Edit Modal State
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [targetRole, setTargetRole] = useState<UserRole>('student');
  const [targetDeptId, setTargetDeptId] = useState<string>('');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [uList, dList] = await Promise.all([
        userService.getUsers(),
        departmentService.getDepartments().catch(() => []),
      ]);
      setUsers(uList);
      setDepartments(dList);
    } catch (err) {
      setErrorMsg(formatApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setTargetRole(user.role);
    setTargetDeptId(user.department_id || '');
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (targetRole === 'staff' && !targetDeptId) {
      error('Department Required', 'Staff accounts require a valid department assignment.');
      return;
    }

    setIsUpdatingRole(true);
    try {
      const payload: SetUserRolePayload = {
        role: targetRole,
        department_id: targetRole === 'staff' ? targetDeptId : null,
      };

      await userService.setUserRole(editingUser.id, payload);
      success(
        'Role Updated Successfully',
        `Assigned ${editingUser.full_name} to role "${targetRole}".`
      );
      setEditingUser(null);
      loadData();
    } catch (err) {
      error('Role Update Failed', formatApiErrorMessage(err));
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight">
          User & Role Administration
        </h1>
        <p className="text-xs sm:text-sm text-[#A7B4CC] mt-0.5">
          Manage campus user roles and assign staff members to university operational departments.
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-[#10182B] border border-white/5">
        <div className="relative">
          <Search className="w-4 h-4 text-[#A7B4CC] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name, email, or role..."
            className="w-full bg-[#151F35] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-[#F1F5F9] placeholder:text-[#A7B4CC]/40 focus:outline-hidden focus:border-cyan-400/60 transition-all"
          />
        </div>
      </div>

      {/* User Directory Table */}
      <div className="rounded-2xl bg-[#10182B] border border-white/5 p-6">
        {errorMsg && <ErrorBanner message={errorMsg} onRetry={loadData} />}

        {isLoading ? (
          <LoadingSkeleton rows={5} />
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            title="No users found"
            description="No registered user profiles matched your criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-semibold text-[#A7B4CC] uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-[#F1F5F9]">
                {filteredUsers.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100">{item.full_name}</div>
                      <div className="text-[11px] text-[#A7B4CC]">{item.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded border capitalize ${
                          item.role === 'admin'
                            ? 'bg-violet-500/15 border-violet-500/30 text-violet-300'
                            : item.role === 'staff'
                            ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
                            : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        }`}
                      >
                        {item.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#A7B4CC]">
                      {item.department_name || (item.role === 'staff' ? 'Unassigned' : 'N/A')}
                    </td>
                    <td className="py-3 px-4 text-[#A7B4CC] tabular-nums whitespace-nowrap">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Active'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="px-2.5 py-1 rounded-lg bg-[#151F35] hover:bg-[#1C2942] text-cyan-300 hover:text-white transition-colors border border-white/5 inline-flex items-center gap-1.5 text-xs"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Change Role</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modify Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-[#151F35] border border-white/10 p-6 shadow-2xl relative">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-semibold text-[#F1F5F9] mb-1">
              Modify User Role & Department
            </h3>
            <p className="text-xs text-[#A7B4CC] mb-4 truncate">
              {editingUser.full_name} ({editingUser.email})
            </p>

            <form onSubmit={handleSaveRole} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#A7B4CC] mb-1.5">
                  Assigned System Role
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value as UserRole)}
                  className="w-full bg-[#10182B] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-[#F1F5F9] focus:outline-hidden focus:border-cyan-400"
                >
                  <option value="student">Student (Intake and Tracking)</option>
                  <option value="staff">Staff (Department Field Operations)</option>
                  <option value="admin">Admin (Executive Operations & Approvals)</option>
                </select>
              </div>

              {targetRole === 'staff' && (
                <div>
                  <label className="block text-xs font-medium text-[#A7B4CC] mb-1.5">
                    Assigned Department <span className="text-rose-400">*</span>
                  </label>
                  <select
                    required
                    value={targetDeptId}
                    onChange={(e) => setTargetDeptId(e.target.value)}
                    className="w-full bg-[#10182B] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-[#F1F5F9] focus:outline-hidden focus:border-cyan-400"
                  >
                    <option value="" disabled>Select department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} {d.code ? `(${d.code})` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-[#A7B4CC] mt-1">
                    Staff members require a valid department assignment on the server.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-2 text-xs font-medium text-[#A7B4CC] hover:text-[#F1F5F9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingRole}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#22D3EE] hover:bg-[#67e8f9] text-[#080D1B] disabled:opacity-50"
                >
                  {isUpdatingRole ? 'Updating...' : 'Save Role Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
