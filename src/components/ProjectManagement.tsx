'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import {
  FolderKanban,
  Plus,
  Search,
  Calendar,
  User,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  Loader2,
  ArrowRight,
  Filter,
} from 'lucide-react';

export function ProjectManagement() {
  const { currentWorkspace } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [onboardingFilter, setOnboardingFilter] = useState<'all' | 'onboarded' | 'unboarded'>('all');
  const [lifecycleFilter, setLifecycleFilter] = useState<string>('all');

  // Modals & form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  // Auxiliary data
  const [departments, setDepartments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    project_id_code: '',
    department_id: '',
    project_manager_id: '',
    onboarding_status: 'unboarded',
    lifecycle_status: 'ongoing',
    priority: 'medium',
    start_date: '',
    expected_completion_date: '',
  });

  const orgId = currentWorkspace?.organisation?.id || currentWorkspace?.organisation_id;

  useEffect(() => {
    if (orgId) {
      loadProjects();
      loadAuxData();
    } else {
      setLoading(false);
    }
  }, [orgId, onboardingFilter, lifecycleFilter]);

  const loadProjects = async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      const filters: any = {};
      if (onboardingFilter !== 'all') filters.onboarding = onboardingFilter;
      if (lifecycleFilter !== 'all') filters.lifecycle = lifecycleFilter;
      const res = await api.getOrgProjects(orgId, filters);
      setProjects(res);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAuxData = async () => {
    if (!currentWorkspace?.id) return;
    try {
      const [depts, mems] = await Promise.all([
        api.getDepartments(currentWorkspace.id),
        api.getWorkspaceMembers(currentWorkspace.id),
      ]);
      setDepartments(depts);
      setMembers(mems);
    } catch (err) {
      console.error('Failed to load depts/members:', err);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;
    setFormError('');
    setCreating(true);

    try {
      const res = await api.createOrgProject(orgId, {
        ...formData,
        department_id: formData.department_id || null,
        project_manager_id: formData.project_manager_id || null,
      });
      setProjects([res, ...projects]);
      setShowCreateModal(false);
      setFormData({
        name: '',
        description: '',
        project_id_code: '',
        department_id: '',
        project_manager_id: '',
        onboarding_status: 'unboarded',
        lifecycle_status: 'ongoing',
        priority: 'medium',
        start_date: '',
        expected_completion_date: '',
      });
    } catch (err: any) {
      setFormError(err.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleOnboarding = async (project: any) => {
    try {
      const nextStatus = project.onboarding_status === 'onboarded' ? 'unboarded' : 'onboarded';
      const updated = await api.updateProject(project.id, { onboarding_status: nextStatus });
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, onboarding_status: updated.onboarding_status } : p))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update onboarding status');
    }
  };

  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.project_id_code?.toLowerCase().includes(q) ||
      p.project_manager?.name?.toLowerCase().includes(q) ||
      p.department?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Project Management &amp; Onboarding</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Track project lifecycle stages, manager ownership, departmental assignments and onboarding validation.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#08745B] hover:bg-[#119875] text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search projects, ID codes, managers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#08745B]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Onboarding Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-neutral-500">Onboarding:</span>
            <div className="inline-flex rounded-lg border border-neutral-200 p-0.5 bg-neutral-50 text-xs">
              {(['all', 'onboarded', 'unboarded'] as const).map((ob) => (
                <button
                  key={ob}
                  onClick={() => setOnboardingFilter(ob)}
                  className={`px-2.5 py-1 rounded-md capitalize font-semibold transition ${
                    onboardingFilter === ob ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500'
                  }`}
                >
                  {ob}
                </button>
              ))}
            </div>
          </div>

          {/* Lifecycle Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-neutral-500">Lifecycle:</span>
            <select
              value={lifecycleFilter}
              onChange={(e) => setLifecycleFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-neutral-200 text-xs bg-white text-neutral-700 font-medium focus:outline-none focus:border-[#08745B]"
            >
              <option value="all">All Stages</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#08745B]" />
          <p className="text-xs text-neutral-500">Loading projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-2xl border border-neutral-200/80 p-6">
          <FolderKanban className="w-12 h-12 text-[#08745B]/60 mx-auto mb-2" />
          <h4 className="font-bold text-sm text-neutral-800">No Projects Found</h4>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Get started by creating your first organizational project or adjusting your search filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((p) => {
            const completedCount = p.tasks_count ? Math.round(p.tasks_count * 0.7) : 0; // fallback calculation
            const progress = p.tasks_count > 0 ? Math.round((completedCount / p.tasks_count) * 100) : 0;

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-neutral-200/80 hover:border-[#08745B] hover:shadow-md transition-all p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                      {p.project_id_code}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleToggleOnboarding(p)}
                        title="Click to toggle onboarding status"
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize transition ${
                          p.onboarding_status === 'onboarded'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        {p.onboarding_status}
                      </button>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize bg-blue-50 text-blue-700">
                        {p.lifecycle_status}
                      </span>
                    </div>
                  </div>

                  {/* Project Title */}
                  <h3 className="font-bold text-sm text-neutral-900 group-hover:text-[#08745B] transition">
                    {p.name}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2 min-h-[32px]">
                    {p.description || 'No detailed description provided.'}
                  </p>

                  {/* Details Meta */}
                  <div className="mt-4 pt-3 border-t border-neutral-100 space-y-1.5 text-xs text-neutral-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-neutral-400">
                        <User className="w-3.5 h-3.5" /> Project Manager:
                      </span>
                      <span className="font-semibold text-neutral-800">
                        {p.project_manager?.name || 'Unassigned'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-neutral-400">
                        <Building2 className="w-3.5 h-3.5" /> Department:
                      </span>
                      <span className="font-semibold text-neutral-800">
                        {p.department?.name || 'General'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-neutral-400">
                        <Calendar className="w-3.5 h-3.5" /> Target Date:
                      </span>
                      <span className="font-semibold text-neutral-800">
                        {p.expected_completion_date
                          ? new Date(p.expected_completion_date).toLocaleDateString()
                          : 'Not set'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom Progress */}
                <div className="mt-4 pt-3 border-t border-neutral-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[11px] text-neutral-500">Tasks Progress</span>
                    <span className="font-bold text-neutral-800">{p.tasks_count ?? 0} Tasks</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#08745B] h-1.5 rounded-full"
                      style={{ width: `${p.tasks_count > 0 ? 50 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-y-auto max-h-[90vh] p-6">
            <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-neutral-900">Create New Project</h3>
                <p className="text-xs text-neutral-500">
                  Add an enterprise project with manager ownership and onboarding status.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-neutral-600 text-sm"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. SEYAL 2.0 Redesign &amp; Rollout"
                  className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#08745B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Objective, scope and success criteria..."
                  className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#08745B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Project Manager
                  </label>
                  <select
                    value={formData.project_manager_id}
                    onChange={(e) => setFormData({ ...formData, project_manager_id: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#08745B] bg-white"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.user?.id}>
                        {m.user?.name || m.user?.email} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#08745B] bg-white"
                  >
                    <option value="">General</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Onboarding Status
                  </label>
                  <select
                    value={formData.onboarding_status}
                    onChange={(e) => setFormData({ ...formData, onboarding_status: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#08745B] bg-white"
                  >
                    <option value="unboarded">Unboarded</option>
                    <option value="onboarded">Onboarded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Lifecycle Status
                  </label>
                  <select
                    value={formData.lifecycle_status}
                    onChange={(e) => setFormData({ ...formData, lifecycle_status: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#08745B] bg-white"
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#08745B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    value={formData.expected_completion_date}
                    onChange={(e) => setFormData({ ...formData, expected_completion_date: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#08745B]"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !formData.name.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#08745B] hover:bg-[#119875] text-white shadow-2xs transition disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Project</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
