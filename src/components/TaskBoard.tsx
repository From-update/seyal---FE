'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import {
  Plus, Filter, LayoutGrid, Table as TableIcon,
  Clock, AlertTriangle, CheckCircle2, User, Building,
  Search, ArrowUpDown
} from 'lucide-react';
import { TaskDetailModal } from './TaskDetailModal';

const STATUS_COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'bg-gray-100 text-gray-700' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'submitted', label: 'Submitted for Review', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'completed', label: 'Approved / Done', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'rejected', label: 'Changes Requested', color: 'bg-amber-50 text-amber-700 border-amber-200' },
];

export function TaskBoard({ initialTaskId }: { initialTaskId?: string | null }) {
  const { currentWorkspace, t } = useAuth();
  const isPersonal = currentWorkspace?.type === 'personal';

  const columns = isPersonal
    ? [
        { id: 'todo', label: 'To Do', color: 'bg-gray-100 text-gray-700' },
        { id: 'in_progress', label: 'In Progress', color: 'bg-blue-50 text-blue-700 border-blue-200' },
        { id: 'completed', label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      ]
    : STATUS_COLUMNS;
  const [tasks, setTasks] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');

  // Filters
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New task form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newDeptId, setNewDeptId] = useState('');
  const [newAssigneeId, setNewAssigneeId] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  useEffect(() => {
    if (currentWorkspace?.id) {
      loadData();
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    if (initialTaskId && tasks.length > 0) {
      const match = tasks.find(t => t.id === initialTaskId);
      if (match) setActiveTask(match);
    }
  }, [initialTaskId, tasks]);

  const loadData = async () => {
    if (!currentWorkspace) return;
    setLoading(true);
    try {
      const [tasksRes, deptsRes, membersRes] = await Promise.all([
        api.getTasks(currentWorkspace.id),
        api.getDepartments(currentWorkspace.id),
        api.getWorkspaceMembers(currentWorkspace.id),
      ]);
      setTasks(tasksRes);
      setDepartments(deptsRes);
      setMembers(membersRes);
    } catch (err) {
      console.error('Error loading task board:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace || !newTitle.trim()) return;
    try {
      const created = await api.createTask({
        workspace_id: currentWorkspace.id,
        title: newTitle,
        description: newDesc,
        priority: newPriority,
        department_id: newDeptId || null,
        assignee_id: newAssigneeId || null,
        due_date: newDueDate ? new Date(newDueDate).toISOString() : null,
      });
      setTasks([created, ...tasks]);
      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      setNewDueDate('');
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (selectedDept !== 'all' && task.department?.id !== selectedDept) return false;
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">URGENT</span>;
      case 'high':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800">HIGH</span>;
      case 'medium':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">MED</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">LOW</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-50/50">
      {/* Top Controls Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex border border-gray-200 rounded-lg p-0.5 bg-gray-50 text-xs">
            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition ${viewMode === 'board' ? 'bg-white shadow-sm font-semibold text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{t.board}</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition ${viewMode === 'table' ? 'bg-white shadow-sm font-semibold text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>{t.table}</span>
            </button>
          </div>

          {/* Department Filter */}
          {departments.length > 0 && (
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          )}

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Right side: search & create */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tasks..."
              className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-44"
            />
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.newTask}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
        {loading ? (
          <div className="h-full flex items-center justify-center text-xs text-gray-400">
            Loading tasks...
          </div>
        ) : viewMode === 'board' ? (
          /* Kanban Board */
          <div className="flex space-x-4 min-w-[1000px] h-full items-start">
            {columns.map(col => {
              const colTasks = filteredTasks.filter(t => {
                if (col.id === 'completed') return t.status === 'completed' || t.status === 'approved';
                return t.status === col.id;
              });

              return (
                <div key={col.id} className="w-72 bg-neutral-100/70 rounded-xl p-3 flex flex-col max-h-full border border-gray-200/60">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
                    <span className="font-semibold text-xs text-gray-800">{col.label}</span>
                    <span className="text-[11px] font-mono bg-white px-1.5 py-0.5 rounded-full text-gray-500 shadow-sm border border-gray-200">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
                    {colTasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => setActiveTask(task)}
                        className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 shadow-sm hover:shadow transition cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-1 mb-1.5">
                          <h4 className="text-xs font-semibold text-gray-900 line-clamp-2">
                            {task.title}
                          </h4>
                          {getPriorityBadge(task.priority)}
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-gray-500 line-clamp-2 mb-2">
                            {task.description}
                          </p>
                        )}

                        {/* Department Tag */}
                        {task.department && (
                          <div className="flex items-center space-x-1 text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-medium mb-2 w-max">
                            <Building className="w-2.5 h-2.5" />
                            <span>{task.department.name}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-[10px] text-gray-500">
                          <div className="flex items-center space-x-1">
                            <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[8px]">
                              {task.assignee?.name ? task.assignee.name[0] : '?'}
                            </div>
                            <span className="truncate max-w-[80px]">
                              {task.assignee?.name || 'Unassigned'}
                            </span>
                          </div>

                          {task.due_date && (
                            <span className="flex items-center space-x-1">
                              <Clock className="w-2.5 h-2.5 text-gray-400" />
                              <span>{new Date(task.due_date).toLocaleDateString()}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {colTasks.length === 0 && (
                      <div className="py-6 text-center text-[11px] text-gray-400 italic">
                        No tasks
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Task Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTasks.map(task => (
                  <tr
                    key={task.id}
                    onClick={() => setActiveTask(task)}
                    className="hover:bg-blue-50/40 cursor-pointer transition"
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900">{task.title}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700 capitalize">
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getPriorityBadge(task.priority)}</td>
                    <td className="px-4 py-3 text-gray-600">{task.department?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{task.assignee?.name || 'Unassigned'}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {activeTask && (
        <TaskDetailModal
          taskId={activeTask.id}
          onClose={() => setActiveTask(null)}
          onTaskUpdated={() => loadData()}
        />
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-lg w-full p-6 text-xs">
            <h3 className="text-base font-bold text-gray-900 mb-4">{t.newTask}</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Conduct End-Semester Practical Exam Audit"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Details, requirements, guidelines..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {!isPersonal && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Department</label>
                    <select
                      value={newDeptId}
                      onChange={(e) => setNewDeptId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                    >
                      <option value="">None (General)</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Assignee</label>
                    <select
                      value={newAssigneeId}
                      onChange={(e) => setNewAssigneeId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                    >
                      <option value="">Unassigned</option>
                      {members.map(m => (
                        <option key={m.user.id} value={m.user.id}>
                          {m.user.name || m.user.email} ({m.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

