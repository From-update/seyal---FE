'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import { Search, FileText, CheckSquare, User, X } from 'lucide-react';

interface GlobalSearchModalProps {
  onClose: () => void;
  onSelectPage?: (pageId: string) => void;
  onSelectTask?: (taskId: string) => void;
}

export function GlobalSearchModal({ onClose, onSelectPage, onSelectTask }: GlobalSearchModalProps) {
  const { currentWorkspace } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ pages: any[]; tasks: any[]; members: any[] }>({
    pages: [],
    tasks: [],
    members: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ pages: [], tasks: [], members: [] });
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.searchGlobal(query, currentWorkspace?.id);
        setResults(res);
      } catch (err) {
        console.error('Error searching:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, currentWorkspace?.id]);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-24 p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-xl w-full overflow-hidden text-xs">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-gray-200 flex items-center space-x-3">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, tasks, or teammates..."
            className="flex-1 border-none outline-none focus:ring-0 text-sm text-gray-900 placeholder-gray-400"
          />
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-80 overflow-y-auto p-3 space-y-4">
          {loading && (
            <div className="text-center py-4 text-gray-400">Searching...</div>
          )}

          {!loading && !query && (
            <div className="text-center py-6 text-gray-400">
              Type anything to search across pages, tasks, and people.
            </div>
          )}

          {!loading && query && results.pages.length === 0 && results.tasks.length === 0 && results.members.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              No results found for &quot;{query}&quot;
            </div>
          )}

          {/* Pages */}
          {results.pages.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-2">
                Pages
              </div>
              <div className="space-y-1">
                {results.pages.map(p => (
                  <button
                    key={p.id}
                    onClick={() => onSelectPage?.(p.id)}
                    className="w-full text-left p-2 hover:bg-gray-50 rounded-lg flex items-center space-x-2 transition"
                  >
                    <span>{p.icon || '📄'}</span>
                    <span className="font-semibold text-gray-900">{p.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {results.tasks.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-2">
                Tasks
              </div>
              <div className="space-y-1">
                {results.tasks.map(t => (
                  <button
                    key={t.id}
                    onClick={() => onSelectTask?.(t.id)}
                    className="w-full text-left p-2 hover:bg-gray-50 rounded-lg flex items-center justify-between transition"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-semibold text-gray-900 truncate">{t.title}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                      {t.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Members */}
          {results.members.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-2">
                People
              </div>
              <div className="space-y-1">
                {results.members.map(m => (
                  <div
                    key={m.id}
                    className="p-2 hover:bg-gray-50 rounded-lg flex items-center space-x-2"
                  >
                    <User className="w-3.5 h-3.5 text-purple-600" />
                    <span className="font-semibold text-gray-900">{m.user?.name || m.user?.email}</span>
                    <span className="text-[10px] text-gray-400 capitalize">({m.role})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

