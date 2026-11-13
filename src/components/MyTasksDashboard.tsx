'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import {
  CheckSquare, Clock, AlertTriangle, Calendar,
  CheckCircle2, Building, ChevronRight
} from 'lucide-react';
import { TaskDetailModal } from './TaskDetailModal';

export function MyTasksDashboard() {
  const { t } = useAuth();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  useEffect(() => {
    loadMyTasks();
  }, []);

  const loadMyTasks = async () => {
    setLoading(true);
    try {
      const res = await api.getMyTasks();
      setData(res);
    } catch (err) {
      console.error('Error loading my tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
        Loading your tasks across all workspaces...
      </div>
    );
  }

  const sections = [
    { key: 'overdue', title: 'Overdue Tasks', color: 'text-red-700 bg-red-50 border-red-200', icon: AlertTriangle },
    { key: 'today', title: 'Due Today', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: Clock },
    { key: 'upcoming', title: 'Upcoming Later', color: 'text-purple-700 bg-purple-50 border-purple-200', icon: Calendar },
    { key: 'no_date', title: 'No Due Date', color: 'text-gray-700 bg-gray-50 border-gray-200', icon: CheckSquare },
    { key: 'completed', title: 'Recently Completed', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full text-xs">
      <div className="pb-6 border-b border-gray-200 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <CheckSquare className="w-6 h-6 text-emerald-600" />
          <span>{t.myTasks}</span>
        </h2>
        <p className="text-gray-500 text-xs mt-1">
          One unified view of all tasks assigned to you across personal and organizational workspaces.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map(({ key, title, color, icon: Icon }) => {
          const tasks = data?.[key] || [];
          if (tasks.length === 0 && key !== 'today' && key !== 'overdue') return null;

          return (
            <div key={key} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className={`px-4 py-2.5 border-b flex items-center justify-between ${color}`}>
                <div className="flex items-center space-x-2 font-bold text-xs">
                  <Icon className="w-4 h-4" />
                  <span>{title}</span>
                </div>
                <span className="font-mono text-[11px] font-bold bg-white/80 px-2 py-0.5 rounded-full border border-gray-200">
                  {tasks.length}
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {tasks.length > 0 ? (
                  tasks.map((task: any) => (
                    <div
                      key={task.id}
                      onClick={() => setActiveTaskId(task.id)}
                      className="p-3.5 hover:bg-neutral-50 flex items-center justify-between cursor-pointer transition group"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <span className={`w-2 h-2 rounded-full ${task.priority === 'urgent' ? 'bg-red-500' : task.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                        <div>
                          <p className="font-semibold text-gray-900 text-xs group-hover:text-blue-600 transition">
                            {task.title}
                          </p>
                          <div className="flex items-center space-x-2 text-[10px] text-gray-400 mt-0.5">
                            <span className="text-purple-600 font-medium">
                              {task.workspace?.name || 'Workspace'}
                            </span>
                            {task.department && (
                              <>
                                <span>·</span>
                                <span>{task.department.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 text-[11px] text-gray-500 flex-shrink-0">
                        {task.due_date && (
                          <span className={key === 'overdue' ? 'text-red-600 font-semibold' : ''}>
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-400 italic">
                    No tasks in this section
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {activeTaskId && (
        <TaskDetailModal
          taskId={activeTaskId}
          onClose={() => setActiveTaskId(null)}
          onTaskUpdated={() => loadMyTasks()}
        />
      )}
    </div>
  );
}

