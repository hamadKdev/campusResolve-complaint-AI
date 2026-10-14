import React, { useEffect, useState, useCallback } from 'react';
import { departmentService } from '../../services/departmentService';
import { userService } from '../../services/userService';
import { Department, UserProfile } from '../../types';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { EmptyState } from '../../components/common/EmptyState';
import { formatApiErrorMessage } from '../../services/apiClient';
import {
  Building2,
  Users,
  ShieldAlert,
  Info,
} from 'lucide-react';

export const DepartmentOverviewPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [deptList, userList] = await Promise.all([
        departmentService.getDepartments(),
        userService.getUsers().catch(() => []),
      ]);
      setDepartments(deptList);
      setUsers(userList);
    } catch (err) {
      setErrorMsg(formatApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute staff per department
  const getStaffForDept = (deptId: string) => {
    return users.filter((u) => u.department_id === deptId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight">
          University Operational Departments
        </h1>
        <p className="text-xs sm:text-sm text-[#A7B4CC] mt-0.5">
          Registered campus faculties, facility teams, and administrative dispatch units.
        </p>
      </div>

      {/* Contract Notification Banner */}
      <div className="p-4 rounded-xl bg-[#10182B] border border-cyan-500/20 flex items-start gap-3 text-xs text-[#A7B4CC]">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-[#F1F5F9]">Contract Note:</strong> Departments are provisioned via
          university directory configuration and queried via <code className="text-cyan-300">GET /departments</code>. In accordance with backend security rules, department records are read-only in this console.
        </div>
      </div>

      {errorMsg && <ErrorBanner message={errorMsg} onRetry={loadData} />}

      {/* Departments Grid */}
      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : departments.length === 0 ? (
        <EmptyState
          title="No departments found"
          description="Unable to retrieve department catalog from the backend."
          action={{
            label: 'Retry Fetch',
            onClick: loadData,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
            const staffMembers = getStaffForDept(dept.id);

            return (
              <div
                key={dept.id}
                className="p-5 rounded-2xl bg-[#10182B] border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                    {dept.code && (
                      <span className="text-[11px] font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 font-semibold">
                        {dept.code}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-[#F1F5F9]">{dept.name}</h3>
                  <p className="text-xs text-[#A7B4CC] mt-1 leading-relaxed">
                    {dept.description || 'Designated university operational unit.'}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[#A7B4CC] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-violet-400" />
                    <span>Active Staff:</span>
                  </span>
                  <span className="font-mono text-[#F1F5F9] tabular-nums font-semibold">
                    {staffMembers.length} technician(s)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
