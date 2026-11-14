'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import {
  CheckSquare,
  FileText,
  Database,
  Building2,
  BarChart3,
  Settings,
  Plus,
  ChevronDown,
  ChevronRight,
  Sparkles,
  User,
  Users,
  CreditCard,
  Trash2,
  Flame,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  selectedPageId: string | null;
  setSelectedPageId: (id: string | null) => void;
  selectedDatabaseId: string | null;
  setSelectedDatabaseId: (id: string | null) => void;
  onOpenSettings: () => void;
  onOpenBilling: () => void;
  onOpenTemplates: () => void;
  onOpenDrive?: () => void;
  onOpenGmail?: () => void;
  onOpenClaude?: () => void;
  onOpenBirthdays?: () => void;
  onOpenApiSettings?: () => void;
}

export function Sidebar({
  currentView,
  setCurrentView,
  selectedPageId,
  setSelectedPageId,
  selectedDatabaseId,
  setSelectedDatabaseId,
  onOpenSettings,
  onOpenBilling,
  onOpenTemplates,
  onOpenDrive,
  onOpenGmail,
  onOpenClaude,
  onOpenBirthdays,
  onOpenApiSettings,
}: SidebarProps) {
  const { user, workspaces, currentWorkspace, setCurrentWorkspace, t } = useAuth();
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [pages, setPages] = useState<any[]>([]);
  const [databases, setDatabases] = useState<any[]>([]);
  const [expandedPages, setExpandedPages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (currentWorkspace?.id) {
      loadContent();
    }
  }, [currentWorkspace?.id]);

  const loadContent = async () => {
    if (!currentWorkspace) return;
    try {
      const [pagesList, dbsList] = await Promise.all([
        api.getPages(currentWorkspace.id),
        api.getDatabases(currentWorkspace.id),
      ]);
      setPages(pagesList);
      setDatabases(dbsList);
    } catch (err) {
      console.error('Error loading sidebar content:', err);
    }
  };

  const handleCreatePage = async () => {
    if (!currentWorkspace) return;
    try {
      const newPage = await api.createPage({
        workspace_id: currentWorkspace.id,
        title: 'Untitled Page',
        icon: '📄',
      });
      setPages([newPage, ...pages]);
      setSelectedPageId(newPage.id);
      setCurrentView('page');
    } catch (err) {
      console.error('Error creating page:', err);
    }
  };

  const handleCreateDatabase = async () => {
    if (!currentWorkspace) return;
    try {
      const newDb = await api.createDatabase({
        workspace_id: currentWorkspace.id,
        name: 'New Projects Database',
      });
      setDatabases([newDb, ...databases]);
      setSelectedDatabaseId(newDb.id);
      setCurrentView('database');
    } catch (err) {
      console.error('Error creating database:', err);
    }
  };

  const togglePageExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPages(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isPersonal = currentWorkspace?.type === 'personal';

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen select-none text-sidebar-foreground">
      {/* Brand Logo Header */}
      <div className="px-4 py-2.5 border-b border-sidebar-border bg-black/95 flex items-center justify-between">
        <img
          src="/logo.jpg"
          alt="Seyal Logo"
          className="h-7 w-auto object-contain rounded"
        />
        <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
          PRO
        </span>
      </div>

      {/* Workspace Switcher Header */}
      <div className="p-3 border-b border-sidebar-border relative">
        <button
          onClick={() => setShowWorkspaceMenu(prev => !prev)}
          className="w-full flex items-center justify-between p-1.5 hover:bg-neutral-200/60 rounded-md transition text-left"
        >
          <div className="flex items-center space-x-2 truncate">
            <span className="text-xl">
              {currentWorkspace?.settings?.icon || (isPersonal ? '👤' : '🏛️')}
            </span>
            <div className="truncate">
              <div className="font-semibold text-xs text-gray-900 truncate">
                {currentWorkspace?.name || 'My Workspace'}
              </div>
              <div className="text-[10px] text-gray-500 uppercase flex items-center space-x-1">
                <span>{currentWorkspace?.type || 'team'}</span>
                <span>·</span>
                <span className="text-blue-600 font-medium">{currentWorkspace?.plan?.toUpperCase() || 'FREE'}</span>
              </div>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>

        {/* Dropdown Menu */}
        {showWorkspaceMenu && (
          <div className="absolute top-14 left-2 right-2 bg-white border border-gray-200 shadow-xl rounded-lg py-1.5 z-50 text-xs">
            <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {t.switchWorkspace}
            </div>
            <div className="max-h-52 overflow-y-auto">
              {workspaces.map((ws: any) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    setCurrentWorkspace(ws);
                    setShowWorkspaceMenu(false);
                    setCurrentView('tasks');
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition ${ws.id === currentWorkspace?.id ? 'bg-blue-50/70 font-semibold text-blue-700' : 'text-gray-800'}`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span>{ws.settings?.icon || (ws.type === 'personal' ? '👤' : '🏛️')}</span>
                    <span className="truncate">{ws.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 capitalize">{ws.type}</span>
                </button>
              ))}
            </div>

            <div className="border-t border-gray-100 mt-1 pt-1">
              <button
                onClick={() => {
                  setShowWorkspaceMenu(false);
                  onOpenSettings();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center space-x-2 text-gray-600"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.createWorkspace}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation Items */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 text-xs">
        {/* Personal Workspace Info Pill */}
        {isPersonal && (
          <div className="mb-2 px-2.5 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-lg">
            <div className="flex items-center space-x-1.5 text-blue-900 font-semibold text-[11px]">
              <span>👤</span>
              <span>Personal Workspace</span>
            </div>
            <p className="text-[10px] text-blue-700/80 mt-0.5 leading-tight">
              Private to you · Organization members cannot see your content
            </p>
          </div>
        )}

        {/* Core Views */}
        <div className="space-y-0.5">
          <button
            onClick={() => { setCurrentView('my-tasks'); setSelectedPageId(null); setSelectedDatabaseId(null); }}
            className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md transition ${currentView === 'my-tasks' ? 'bg-neutral-200/80 font-medium text-gray-900' : 'hover:bg-neutral-200/50 text-gray-700'}`}
          >
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            <span>{t.myTasks}</span>
          </button>

          <button
            onClick={() => { setCurrentView('tasks'); setSelectedPageId(null); setSelectedDatabaseId(null); }}
            className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md transition ${currentView === 'tasks' ? 'bg-neutral-200/80 font-medium text-gray-900' : 'hover:bg-neutral-200/50 text-gray-700'}`}
          >
            <CheckSquare className="w-4 h-4 text-blue-600" />
            <span>{isPersonal ? 'Personal Board & To-Do' : `${t.board} & Tasks`}</span>
          </button>

          {/* Personal Features (Section 4A) */}
          {isPersonal && (
            <>
              <button
                onClick={() => { setCurrentView('habits'); setSelectedPageId(null); setSelectedDatabaseId(null); }}
                className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md transition ${currentView === 'habits' ? 'bg-neutral-200/80 font-medium text-gray-900' : 'hover:bg-neutral-200/50 text-gray-700'}`}
              >
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Habit Tracker</span>
              </button>

              <button
                onClick={onOpenTemplates}
                className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md hover:bg-neutral-200/50 text-purple-700 font-medium transition"
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Templates Library</span>
              </button>
            </>
          )}

          {/* Hierarchy & Departments (Hidden for Personal workspaces as per Section 4A) */}
          {!isPersonal && (
            <button
              onClick={() => { setCurrentView('departments'); setSelectedPageId(null); setSelectedDatabaseId(null); }}
              className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md transition ${currentView === 'departments' ? 'bg-neutral-200/80 font-medium text-gray-900' : 'hover:bg-neutral-200/50 text-gray-700'}`}
            >
              <Building2 className="w-4 h-4 text-purple-600" />
              <span>{t.departments}</span>
            </button>
          )}

          <button
            onClick={() => { setCurrentView('reports'); setSelectedPageId(null); setSelectedDatabaseId(null); }}
            className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md transition ${currentView === 'reports' ? 'bg-neutral-200/80 font-medium text-gray-900' : 'hover:bg-neutral-200/50 text-gray-700'}`}
          >
            <BarChart3 className="w-4 h-4 text-amber-600" />
            <span>{t.reports}</span>
          </button>
        </div>

        {/* Databases Section */}
        <div>
          <div className="flex items-center justify-between px-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
            <span>{t.databases}</span>
            <button
              onClick={handleCreateDatabase}
              className="p-0.5 hover:bg-neutral-200 rounded text-gray-500"
              title={t.newDatabase}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-0.5">
            {databases.map((db) => (
              <button
                key={db.id}
                onClick={() => {
                  setSelectedDatabaseId(db.id);
                  setSelectedPageId(null);
                  setCurrentView('database');
                }}
                className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md transition truncate ${currentView === 'database' && selectedDatabaseId === db.id ? 'bg-neutral-200/80 font-medium text-gray-900' : 'hover:bg-neutral-200/50 text-gray-700'}`}
              >
                <Database className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span className="truncate">{db.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pages Section */}
        <div>
          <div className="flex items-center justify-between px-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
            <span>{t.pages}</span>
            <button
              onClick={handleCreatePage}
              className="p-0.5 hover:bg-neutral-200 rounded text-gray-500"
              title={t.newPage}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-0.5">
            {pages.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPageId(p.id);
                  setSelectedDatabaseId(null);
                  setCurrentView('page');
                }}
                className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md transition truncate ${currentView === 'page' && selectedPageId === p.id ? 'bg-neutral-200/80 font-medium text-gray-900' : 'hover:bg-neutral-200/50 text-gray-700'}`}
              >
                <span className="text-sm flex-shrink-0">{p.icon || '📄'}</span>
                <span className="truncate">{p.title || 'Untitled'}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Integrations & AI Section */}
        <div>
          <div className="px-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Connected Apps & AI
          </div>
          <div className="space-y-0.5">
            {onOpenClaude && (
              <button
                onClick={onOpenClaude}
                className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md hover:bg-orange-50 text-orange-800 font-medium transition"
              >
                <span className="text-orange-600 font-serif font-bold text-sm">✦</span>
                <span className="truncate">Claude AI Assistant</span>
              </button>
            )}

            {onOpenDrive && (
              <button
                onClick={onOpenDrive}
                className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md hover:bg-neutral-200/50 text-gray-700 transition"
              >
                <span>📁</span>
                <span className="truncate">Google Drive</span>
              </button>
            )}

            {onOpenGmail && (
              <button
                onClick={onOpenGmail}
                className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md hover:bg-neutral-200/50 text-gray-700 transition"
              >
                <span>✉️</span>
                <span className="truncate">Google Mail</span>
              </button>
            )}

            {onOpenBirthdays && (
              <button
                onClick={onOpenBirthdays}
                className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md hover:bg-pink-50 text-pink-700 transition"
              >
                <span>🎂</span>
                <span className="truncate">Birthday Reminders</span>
              </button>
            )}

            {onOpenApiSettings && (
              <button
                onClick={onOpenApiSettings}
                className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md hover:bg-indigo-50 text-indigo-700 font-medium transition"
              >
                <span>🔌</span>
                <span className="truncate">API & Integration Keys</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Settings & Plan */}
      <div className="p-2 border-t border-sidebar-border space-y-1 text-xs">
        <button
          onClick={onOpenBilling}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-neutral-200/60 text-gray-700 font-medium transition"
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.plans}</span>
          </div>
          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
            INR
          </span>
        </button>

        <button
          onClick={onOpenSettings}
          className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md hover:bg-neutral-200/60 text-gray-700 transition"
        >
          <Settings className="w-3.5 h-3.5 text-gray-500" />
          <span>{t.settings}</span>
        </button>
      </div>
    </aside>
  );
}

