'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import { Building, UserCheck, Plus, Users, ChevronRight, Trash2 } from 'lucide-react';

export function DepartmentsManager() {
  const { currentWorkspace, t } = useAuth();
  const [departments, setDepartments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [managerId, setManagerId] = useState('');

  useEffect(() => {
    if (currentWorkspace?.id) {
      loadData();
    }
  }, [currentWorkspace?.id]);

  const loadData = async () => {
    if (!currentWorkspace) return;
    setLoading(true);
    try {
      const [deptsData, membersData] = await Promise.all([
        api.getDepartments(currentWorkspace.id),
        api.getWorkspaceMembers(currentWorkspace.id),
      ]);
      setDepartments(deptsData);
      setMembers(membersData);
    } catch (err) {
      console.error('Error loading departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace || !deptName.trim()) return;
    try {
      const created = await api.createDepartment(currentWorkspace.id, {
        name: deptName,
        manager_id: managerId || null,
      });
      setDepartments([...departments, created]);
      setShowAddModal(false);
      setDeptName('');
      setManagerId('');
    } catch (err) {
      console.error('Error creating department:', err);
    }
  };

  const handleDeleteDepartment = async (deptId: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await api.deleteDepartment(deptId);
      setDepartments(departments.filter(d => d.id !== deptId));
    } catch (err) {
      console.error('Error deleting department:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
        Loading departments...
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full text-xs">
      {/* Title & Hierarchy Overview */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Building className="w-6 h-6 text-purple-600" />
            <span>Departments & Hierarchy</span>
          </h2>
          <p className="text-gray-500 text-xs mt-1">
            Configure department structure: Owner / GM → Department Manager → Staff.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Visual Hierarchy Pipeline Banner */}
      <div className="my-6 p-4 bg-purple-50/70 border border-purple-200 rounded-xl">
        <h4 className="font-bold text-purple-900 mb-2">Hierarchy Flow Model:</h4>
        <div className="flex items-center space-x-3 text-xs text-purple-950 font-medium overflow-x-auto">
          <span className="p-2 bg-white rounded border border-purple-200 shadow-sm">👑 Owner / GM</span>
          <ChevronRight className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span className="p-2 bg-white rounded border border-purple-200 shadow-sm">💼 Department Manager (HOD)</span>
          <ChevronRight className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span className="p-2 bg-white rounded border border-purple-200 shadow-sm">✍️ Staff / Member Works & Submits</span>
          <ChevronRight className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span className="p-2 bg-white rounded border border-purple-200 shadow-sm">✅ Manager Review & Approval</span>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {departments.map((dept) => (
          <div key={dept.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-purple-300 transition group">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{dept.name}</h4>
                <div className="flex items-center space-x-2 text-gray-500">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Manager: <strong className="text-gray-800">{dept.manager?.name || 'Unassigned'}</strong></span>
                </div>
              </div>
              <button
                onClick={() => handleDeleteDepartment(dept.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 rounded transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{dept.member_count || 1} team members</span>
              </span>
              <span className="text-purple-600 font-semibold">Active Department</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-md w-full p-6 text-xs">
            <h3 className="text-base font-bold text-gray-900 mb-4">Create New Department</h3>
            <form onSubmit={handleCreateDepartment} className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. Mechanical Engineering or Marketing"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Department Manager / Lead</label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                >
                  <option value="">None (Self-managed)</option>
                  {members.map(m => (
                    <option key={m.user.id} value={m.user.id}>
                      {m.user.name || m.user.email} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

