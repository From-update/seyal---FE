'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import {
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
  Loader2,
  ChevronRight,
  Filter,
} from 'lucide-react';

export function OrganisationTeamManager() {
  const { currentWorkspace, user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Add Member Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'staff',
    employee_id: '',
    designation: '',
    department_id: '',
    reporting_manager_id: '',
    password: '',
  });

  const orgId = currentWorkspace?.organisation?.id || currentWorkspace?.organisation_id;

  useEffect(() => {
    if (orgId) {
      loadMembers();
      loadDepartments();
    } else {
      setLoading(false);
    }
  }, [orgId]);

  const loadMembers = async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      const res = await api.getOrgUsers(orgId);
      setMembers(res);
    } catch (err) {
      console.error('Failed to load organisation users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    if (!currentWorkspace?.id) return;
    try {
      const res = await api.getDepartments(currentWorkspace.id);
      setDepartments(res);
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;
    setFormError('');
    setSubmitting(true);

    try {
      const res = await api.createOrgUser(orgId, {
        ...formData,
        department_id: formData.department_id || null,
        reporting_manager_id: formData.reporting_manager_id || null,
      });
      setMembers([res, ...members]);
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'staff',
        employee_id: '',
        designation: '',
        department_id: '',
        reporting_manager_id: '',
        password: '',
      });
    } catch (err: any) {
      setFormError(err.message || 'Failed to add member to organisation');
    } finally {
      setSubmitting(false);
    }
  };

  const ROLE_LABELS: Record<string, { label: string; badge: string }> = {
    org_superadmin: { label: 'Organisation Super Admin (Owner)', badge: 'bg-emerald-100 text-emerald-800' },
    org_admin: { label: 'Organisation Admin', badge: 'bg-teal-100 text-teal-800' },
    lead_manager: { label: 'Lead Manager', badge: 'bg-purple-100 text-purple-800' },
    department_manager: { label: 'Department Manager', badge: 'bg-indigo-100 text-indigo-800' },
    project_manager: { label: 'Project Manager', badge: 'bg-blue-100 text-blue-800' },
    hr_manager: { label: 'HR Manager', badge: 'bg-pink-100 text-pink-800' },
    finance_manager: { label: 'Finance Manager', badge: 'bg-amber-100 text-amber-800' },
    staff: { label: 'Staff Member', badge: 'bg-neutral-100 text-neutral-800' },
    intern: { label: 'Intern', badge: 'bg-slate-100 text-slate-700' },
  };

  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      m.user?.name?.toLowerCase().includes(q) ||
      m.user?.email?.toLowerCase().includes(q) ||
      m.employee_id?.toLowerCase().includes(q) ||
      m.designation?.toLowerCase().includes(q);

    if (roleFilter !== 'all') return matchesQuery && m.role === roleFilter;
    return matchesQuery;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Enterprise User Directory &amp; Roles</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage your organisation hierarchy across 9 enterprise tiers, departments, designations and reporting managers.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#08745B] hover:bg-[#119875] text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, email, employee ID, designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#08745B]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-xs text-neutral-500">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-neutral-200 text-xs bg-white text-neutral-700 font-medium focus:outline-none focus:border-[#08745B]"
          >
            <option value="all">All Roles ({members.length})</option>
            {Object.entries(ROLE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-600 uppercase text-[10px] tracking-wider border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4 font-semibold">User Details</th>
                <th className="py-3 px-4 font-semibold">Employee ID</th>
                <th className="py-3 px-4 font-semibold">Designation</th>
                <th className="py-3 px-4 font-semibold">Enterprise Role</th>
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold">Reporting Manager</th>
                <th className="py-3 px-4 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#08745B] mx-auto mb-2" />
                    <span className="text-neutral-400">Loading directory...</span>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-400 text-xs">
                    No members match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => {
                  const roleConfig = ROLE_LABELS[m.role] || { label: m.role, badge: 'bg-neutral-100 text-neutral-700' };

                  return (
                    <tr key={m.id} className="hover:bg-neutral-50/70 transition">
                      <td className="py-3.5 px-4 font-bold text-neutral-900">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#EDF6F1] text-[#08745B] flex items-center justify-center font-bold text-xs shrink-0">
                            {(m.user?.name || m.user?.email || 'U').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div>{m.user?.name || 'Unnamed Member'}</div>
                            <div className="text-[10px] font-normal text-neutral-400">{m.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-700">
                        {m.employee_id || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-800 font-medium">
                        {m.designation || 'Specialist'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${roleConfig.badge}`}>
                          {roleConfig.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-600">
                        {m.department?.name || 'General Operations'}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-700">
                        {m.reporting_manager?.name || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-400">
                        {m.joined_at ? new Date(m.joined_at).toLocaleDateString() : 'Active'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD MEMBER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-y-auto max-h-[90vh] p-6">
            <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-neutral-900">Enroll Organisation Member</h3>
                <p className="text-xs text-neutral-500">
                  Assign enterprise role, reporting structure and credentials.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
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

            <form onSubmit={handleAddMember} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Anand Sharma"
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#08745B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="anand@company.com"
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#08745B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#08745B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Employee ID Code
                  </label>
                  <input
                    type="text"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    placeholder="EMP-104"
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#08745B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="Senior QA Engineer"
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#08745B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Enterprise Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#08745B] bg-white font-medium"
                  >
                    {Object.entries(ROLE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
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
                    Reporting Manager
                  </label>
                  <select
                    value={formData.reporting_manager_id}
                    onChange={(e) => setFormData({ ...formData, reporting_manager_id: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#08745B] bg-white"
                  >
                    <option value="">Unassigned</option>
                    {members
                      .filter((m) =>
                        ['org_superadmin', 'org_admin', 'lead_manager', 'department_manager', 'project_manager'].includes(
                          m.role
                        )
                      )
                      .map((m) => (
                        <option key={m.id} value={m.user?.id}>
                          {m.user?.name || m.user?.email} ({m.designation || m.role})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Initial Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Default: SeyalUser@2026"
                  className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#08745B]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.email.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#08745B] hover:bg-[#119875] text-white shadow-2xs transition disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Enroll Member</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
