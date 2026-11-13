'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { Search, Bell, Globe, User, LogOut, Settings, Check, Sparkles } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { GlobalSearchModal } from './GlobalSearchModal';

interface NavbarProps {
  currentViewTitle: string;
  onOpenSettings?: () => void;
  onSelectPage?: (pageId: string) => void;
  onSelectTask?: (taskId: string) => void;
  onOpenDrive?: () => void;
  onOpenGmail?: () => void;
  onOpenClaude?: () => void;
  onOpenBirthdays?: () => void;
  onOpenApiSettings?: () => void;
}

export function Navbar({
  currentViewTitle,
  onOpenSettings,
  onSelectPage,
  onSelectTask,
  onOpenDrive,
  onOpenGmail,
  onOpenClaude,
  onOpenBirthdays,
  onOpenApiSettings,
}: NavbarProps) {
  const { user, currentWorkspace, lang, setLang, t, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Global Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="h-12 border-b border-gray-200 bg-white flex items-center justify-between px-4 sticky top-0 z-20">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 truncate">
        <span className="font-medium text-gray-900 truncate">
          {currentWorkspace?.settings?.icon || '🏢'} {currentWorkspace?.name || 'Workspace'}
        </span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-800 font-semibold truncate">{currentViewTitle}</span>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-2">
        {/* Quick Search */}
        <button
          onClick={() => setShowSearch(true)}
          className="flex items-center space-x-2 px-2.5 py-1 text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-200 transition"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.search}</span>
          <kbd className="hidden sm:inline px-1 py-0.5 text-[10px] bg-white border border-gray-300 rounded font-mono">
            Ctrl K
          </kbd>
        </button>

        {/* Claude AI Workspace Assistant */}
        <button
          onClick={onOpenClaude}
          className="flex items-center space-x-1.5 px-2.5 py-1 text-xs bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 hover:border-orange-300 rounded-md text-orange-900 font-semibold shadow-xs transition"
          title="Claude AI Assistant Copilot"
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
          <span className="hidden sm:inline">Claude AI</span>
        </button>

        {/* Google Drive */}
        <button
          onClick={onOpenDrive}
          className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-md font-medium transition"
          title="Google Drive Files"
        >
          <span>📁</span>
          <span className="hidden md:inline">Drive</span>
        </button>

        {/* Google Mail (Gmail) */}
        <button
          onClick={onOpenGmail}
          className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-md font-medium transition"
          title="Gmail Inbox & Task Conversion"
        >
          <span>✉️</span>
          <span className="hidden md:inline">Gmail</span>
        </button>

        {/* Birthday & Occasions Reminders */}
        <button
          onClick={onOpenBirthdays}
          className="flex items-center space-x-1 px-2 py-1 text-xs text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-md font-medium transition"
          title="Birthday & Occasion Reminders"
        >
          <span>🎂</span>
          <span className="hidden lg:inline">Birthdays</span>
        </button>

        {/* API Keys & Integrations */}
        <button
          onClick={onOpenApiSettings}
          className="flex items-center space-x-1 px-2 py-1 text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md font-medium transition"
          title="API Keys & Integration Settings (Claude, Google, Razorpay)"
        >
          <span>🔌</span>
          <span className="hidden xl:inline">API Keys</span>
        </button>

        {/* Language switcher */}
        <div className="relative flex items-center text-xs">
          <button
            onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
            className="flex items-center space-x-1 px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition font-medium"
            title="Switch Language (English / தமிழ்)"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'English' : 'தமிழ்'}</span>
          </button>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(prev => !prev)}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md relative transition"
          >
            <Bell className="w-4 h-4" />
          </button>
          {showNotifications && (
            <NotificationCenter onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* User avatar & dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(prev => !prev)}
            className="flex items-center space-x-1.5 p-1 hover:bg-gray-100 rounded-md transition"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase">
              {user?.name ? user.name[0] : 'U'}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 shadow-lg rounded-lg py-1.5 z-50 text-xs">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                <p className="text-gray-500 truncate">{user?.email || user?.phone}</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] rounded font-medium">
                  {currentWorkspace?.my_role ? currentWorkspace.my_role.toUpperCase() : 'MEMBER'}
                </span>
              </div>

              {onOpenApiSettings && (
                <button
                  onClick={() => { setShowUserMenu(false); onOpenApiSettings(); }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center space-x-2 text-indigo-700 font-medium"
                >
                  <span>🔌</span>
                  <span>API Keys & Integrations</span>
                </button>
              )}

              {onOpenSettings && (
                <button
                  onClick={() => { setShowUserMenu(false); onOpenSettings(); }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center space-x-2 text-gray-700"
                >
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span>{t.settings}</span>
                </button>
              )}

              <button
                onClick={() => { setShowUserMenu(false); logout(); }}
                className="w-full text-left px-3 py-2 hover:bg-red-50 flex items-center space-x-2 text-red-600"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.logout}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {showSearch && (
        <GlobalSearchModal
          onClose={() => setShowSearch(false)}
          onSelectPage={(id) => { setShowSearch(false); onSelectPage?.(id); }}
          onSelectTask={(id) => { setShowSearch(false); onSelectTask?.(id); }}
        />
      )}
    </header>
  );
}

