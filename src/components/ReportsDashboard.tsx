'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import {
  BarChart3, CheckCircle, Clock, AlertTriangle, Users,
  Building, TrendingUp, Download
} from 'lucide-react';

export function ReportsDashboard() {
  const { currentWorkspace, t } = useAuth();
  const [deptReport, setDeptReport] = useState<any | null>(null);
  const [memberReport, setMemberReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentWorkspace?.id) {
      loadReports();
    }
  }, [currentWorkspace?.id]);

  const loadReports = async () => {
    if (!currentWorkspace) return;
    setLoading(true);
    try {
      const [deptRes, memberRes] = await Promise.all([
        api.getDepartmentReport(currentWorkspace.id),
        api.getMemberReport(currentWorkspace.id),
      ]);
      setDeptReport(deptRes);
      setMemberReport(memberRes);
    } catch (err) {
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
        Generating reports...
      </div>
    );
  }

  const overview = deptReport?.overview || {
    total_tasks: 0,
    total_completed: 0,
    total_overdue: 0,
    overall_completion_rate: 0,
  };

  const departments = deptReport?.departments || [];

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full text-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-amber-600" />
            <span>Reports & Analytics</span>
          </h2>
          <p className="text-gray-500 text-xs mt-1">
            Department performance, task completion rates, and team workload.
          </p>
        </div>

        <button
          onClick={() => alert('Report summary exported as CSV / PDF.')}
          className="flex items-center space-x-1.5 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold shadow-sm transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Summary</span>
        </button>
      </div>

      {/* Top Stat KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <span className="text-[10px] text-gray-400 uppercase font-semibold">Total Tasks</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">{overview.total_tasks}</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <span className="text-[10px] text-gray-400 uppercase font-semibold">Completion Rate</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{overview.overall_completion_rate}%</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <span className="text-[10px] text-gray-400 uppercase font-semibold">Overdue Tasks</span>
          <p className="text-2xl font-bold text-red-600 mt-1">{overview.total_overdue}</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <span className="text-[10px] text-gray-400 uppercase font-semibold">Active Departments</span>
          <p className="text-2xl font-bold text-purple-600 mt-1">{departments.length}</p>
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 bg-neutral-50/70 font-bold text-gray-800 flex items-center space-x-2">
          <Building className="w-4 h-4 text-purple-600" />
          <span>Department Performance & Hierarchy Status</span>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-[10px]">
            <tr>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Lead / Manager</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Completed</th>
              <th className="px-4 py-3">In Review</th>
              <th className="px-4 py-3">Overdue</th>
              <th className="px-4 py-3">Completion %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {departments.map((dept: any) => (
              <tr key={dept.id} className="hover:bg-gray-50/60">
                <td className="px-4 py-3 font-semibold text-gray-900">{dept.name}</td>
                <td className="px-4 py-3 text-gray-600">{dept.manager_name}</td>
                <td className="px-4 py-3 font-mono">{dept.total_tasks}</td>
                <td className="px-4 py-3 text-emerald-600 font-mono font-semibold">{dept.completed}</td>
                <td className="px-4 py-3 text-purple-600 font-mono font-semibold">{dept.in_review}</td>
                <td className="px-4 py-3 text-red-600 font-mono font-semibold">{dept.overdue}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${dept.completion_rate}%` }}
                      />
                    </div>
                    <span className="font-semibold text-gray-700">{dept.completion_rate}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Member Workload Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 bg-neutral-50/70 font-bold text-gray-800 flex items-center space-x-2">
          <Users className="w-4 h-4 text-blue-600" />
          <span>Team Member Workload & Execution</span>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-[10px]">
            <tr>
              <th className="px-4 py-3">Team Member</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Assigned Tasks</th>
              <th className="px-4 py-3">Completed</th>
              <th className="px-4 py-3">Overdue</th>
              <th className="px-4 py-3">Completion Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {memberReport.map((m: any) => (
              <tr key={m.user_id} className="hover:bg-gray-50/60">
                <td className="px-4 py-3 font-semibold text-gray-900">{m.name}</td>
                <td className="px-4 py-3 capitalize text-gray-500">{m.role}</td>
                <td className="px-4 py-3 font-mono">{m.total_tasks}</td>
                <td className="px-4 py-3 text-emerald-600 font-mono font-semibold">{m.completed}</td>
                <td className="px-4 py-3 text-red-600 font-mono font-semibold">{m.overdue}</td>
                <td className="px-4 py-3 font-semibold text-gray-700">{m.completion_rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

