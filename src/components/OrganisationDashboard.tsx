'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import {
  Building2,
  Users,
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Download,
  Printer,
  ChevronRight,
  ShieldCheck,
  Briefcase,
  Layers,
  ArrowUpRight,
  Calendar,
  Loader2,
  Plus,
} from 'lucide-react';

interface OrganisationDashboardProps {
  onNavigateToProjects?: () => void;
  onNavigateToTeam?: () => void;
}

export function OrganisationDashboard({
  onNavigateToProjects,
  onNavigateToTeam,
}: OrganisationDashboardProps) {
  const { currentWorkspace, user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const orgId = currentWorkspace?.organisation?.id || currentWorkspace?.organisation_id;

  useEffect(() => {
    if (orgId) {
      loadOverview();
    } else {
      setLoading(false);
    }
  }, [orgId, currentWorkspace?.id]);

  const loadOverview = async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      const res = await api.getOrgOverview(orgId);
      setData(res);
    } catch (err: any) {
      console.error('Failed to load org overview:', err);
      setError(err.message || 'Unable to load organisation overview');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  if (!orgId) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200/80 m-6">
        <Building2 className="w-12 h-12 text-[#08745B] mx-auto mb-3 opacity-60" />
        <h3 className="font-bold text-base text-neutral-800">Organisation Not Linked</h3>
        <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
          This workspace is running in independent mode. You can link it to an enterprise organization in Workspace Settings.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#08745B]" />
        <p className="text-xs text-neutral-500">Loading Organisation KPI Dashboard...</p>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const depts = data?.department_performance || [];
  const projects = data?.recent_projects || [];
  const org = data?.organisation || {};

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Executive Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-emerald-900 to-[#08745B] rounded-2xl p-6 text-white shadow-md">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-emerald-100 mb-2">
            <ShieldCheck className="w-3 h-3" />
            <span>Organisation Super Admin &amp; Owner Overview</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">{org.name || currentWorkspace?.name}</h2>
          <p className="text-xs text-emerald-100/90 mt-1">
            Real-time executive performance monitoring across departments, projects, and workforce accountability.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrintReport}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white text-emerald-900 font-bold text-xs rounded-xl shadow-xs hover:bg-emerald-50 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export / Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl p-4 border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 text-[11px]">
            <span>Employees</span>
            <Users className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-black text-neutral-900 mt-1">{kpis.total_employees ?? 0}</div>
          <span className="text-[10px] text-neutral-400">Total staff &amp; interns</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 text-[11px]">
            <span>Departments</span>
            <Building2 className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xl font-black text-neutral-900 mt-1">{kpis.total_departments ?? 0}</div>
          <span className="text-[10px] text-neutral-400">Functional units</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 text-[11px]">
            <span>Total Projects</span>
            <FolderKanban className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-neutral-900 mt-1">{kpis.total_projects ?? 0}</div>
          <span className="text-[10px] text-emerald-600 font-medium">{kpis.onboarded_projects ?? 0} onboarded</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 text-[11px]">
            <span>Completed Tasks</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-700 mt-1">{kpis.completed_tasks ?? 0}</div>
          <span className="text-[10px] text-neutral-400">of {kpis.total_tasks ?? 0} tasks</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 text-[11px]">
            <span>Pending Work</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-700 mt-1">{kpis.pending_tasks ?? 0}</div>
          <span className="text-[10px] text-neutral-400">In review / progress</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 text-[11px]">
            <span>Overdue Tasks</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl font-black text-rose-600 mt-1">{kpis.overdue_tasks ?? 0}</div>
          <span className="text-[10px] text-neutral-400">{kpis.task_completion_rate ?? 0}% overall rate</span>
        </div>
      </div>

      {/* Middle Row: Department Breakdown & Project Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Performance Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Department Performance Breakdown</h3>
              <p className="text-xs text-neutral-500">Live task throughput &amp; delivery speed by department.</p>
            </div>
            <span className="text-xs font-bold text-[#08745B] bg-[#EDF6F1] px-2.5 py-1 rounded-lg">
              {depts.length} Active Departments
            </span>
          </div>

          <div className="space-y-3.5">
            {depts.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                No departments established yet. Create departments to track group performance.
              </div>
            ) : (
              depts.map((d: any) => (
                <div key={d.id} className="p-3 rounded-xl border border-neutral-100 bg-neutral-50/50">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-neutral-800">{d.name}</span>
                    <span className="text-neutral-500">
                      <strong>{d.completed_tasks}</strong> / {d.total_tasks} tasks ({d.rate}%)
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#08745B] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(d.rate, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Project Pipeline Summary (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Project Pipeline</h3>
                <p className="text-xs text-neutral-500">Onboarding and operational status.</p>
              </div>
              {onNavigateToProjects && (
                <button
                  onClick={onNavigateToProjects}
                  className="text-xs font-bold text-[#08745B] hover:underline inline-flex items-center gap-0.5"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {projects.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-400">
                  No projects created yet.
                </div>
              ) : (
                projects.map((p: any) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border border-neutral-200 hover:border-[#08745B] transition flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-neutral-800">{p.name}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">
                        Manager: {p.project_manager?.name || 'Unassigned'} • Code: {p.project_id_code}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        p.onboarding_status === 'onboarded'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.onboarding_status}
                      </span>
                      <div className="text-[10px] text-neutral-500 mt-0.5 capitalize">
                        {p.lifecycle_status}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick stats bottom */}
          <div className="mt-4 pt-3 border-t border-neutral-100 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="bg-[#EDF6F1] p-2 rounded-xl text-[#08745B]">
              <span className="font-bold text-sm">{kpis.ongoing_projects ?? 0}</span>
              <p className="text-[10px]">Ongoing Projects</p>
            </div>
            <div className="bg-neutral-100 p-2 rounded-xl text-neutral-700">
              <span className="font-bold text-sm">{kpis.completed_projects ?? 0}</span>
              <p className="text-[10px]">Completed Projects</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
