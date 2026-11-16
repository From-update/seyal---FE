'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { BlockEditor } from '@/components/BlockEditor';
import { TaskBoard } from '@/components/TaskBoard';
import { MyTasksDashboard } from '@/components/MyTasksDashboard';
import { DepartmentsManager } from '@/components/DepartmentsManager';
import { ReportsDashboard } from '@/components/ReportsDashboard';
import { DatabaseView } from '@/components/DatabaseView';
import { WorkspaceSettingsModal } from '@/components/WorkspaceSettingsModal';
import { BillingModal } from '@/components/BillingModal';
import { HabitTracker } from '@/components/HabitTracker';
import { PersonalTemplatesModal } from '@/components/PersonalTemplatesModal';
import { GoogleDriveModal } from '@/components/GoogleDriveModal';
import { GmailModal } from '@/components/GmailModal';
import { ClaudeAssistantModal } from '@/components/ClaudeAssistantModal';
import { BirthdayRemindersModal } from '@/components/BirthdayRemindersModal';
import { ApiIntegrationsModal } from '@/components/ApiIntegrationsModal';

export default function AppDashboard() {
  const router = useRouter();
  const { user, currentWorkspace, isLoading, t } = useAuth();

  const [currentView, setCurrentView] = useState<string>('tasks');
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<string | null>(null);
  const [targetTaskId, setTargetTaskId] = useState<string | null>(null);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [showGmailModal, setShowGmailModal] = useState(false);
  const [showClaudeModal, setShowClaudeModal] = useState(false);
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div
        className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4"
        suppressHydrationWarning
      >
        <img
          src="/logo.jpg"
          alt="Seyal"
          className="h-12 w-auto object-contain rounded-xl shadow-md border border-neutral-800 animate-pulse"
        />
        <p className="text-xs font-semibold text-gray-500">Loading Seyal Workspace...</p>
      </div>
    );
  }

  const getViewTitle = () => {
    switch (currentView) {
      case 'page':
        return 'Document';
      case 'tasks':
        return `${t.board} & Tasks`;
      case 'my-tasks':
        return t.myTasks;
      case 'habits':
        return 'Habit Tracker';
      case 'departments':
        return t.departments;
      case 'reports':
        return t.reports;
      case 'database':
        return t.databases;
      default:
        return 'Dashboard';
    }
  };

  return (
    <div
      className="flex h-screen w-screen overflow-hidden bg-white"
      suppressHydrationWarning
    >
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedPageId={selectedPageId}
        setSelectedPageId={setSelectedPageId}
        selectedDatabaseId={selectedDatabaseId}
        setSelectedDatabaseId={setSelectedDatabaseId}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenBilling={() => setShowBillingModal(true)}
        onOpenTemplates={() => setShowTemplatesModal(true)}
        onOpenDrive={() => setShowDriveModal(true)}
        onOpenGmail={() => setShowGmailModal(true)}
        onOpenClaude={() => setShowClaudeModal(true)}
        onOpenBirthdays={() => setShowBirthdayModal(true)}
        onOpenApiSettings={() => setShowApiModal(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar
          currentViewTitle={getViewTitle()}
          onOpenSettings={() => setShowSettingsModal(true)}
          onSelectPage={(pageId) => {
            setSelectedPageId(pageId);
            setCurrentView('page');
          }}
          onSelectTask={(taskId) => {
            setTargetTaskId(taskId);
            setCurrentView('tasks');
          }}
          onOpenDrive={() => setShowDriveModal(true)}
          onOpenGmail={() => setShowGmailModal(true)}
          onOpenClaude={() => setShowClaudeModal(true)}
          onOpenBirthdays={() => setShowBirthdayModal(true)}
          onOpenApiSettings={() => setShowApiModal(true)}
        />

        <main className="flex-1 flex overflow-hidden">
          {currentView === 'page' && selectedPageId && (
            <BlockEditor pageId={selectedPageId} />
          )}

          {currentView === 'tasks' && (
            <TaskBoard initialTaskId={targetTaskId} />
          )}

          {currentView === 'habits' && (
            <HabitTracker />
          )}

          {currentView === 'my-tasks' && (
            <MyTasksDashboard />
          )}

          {currentView === 'departments' && (
            <DepartmentsManager />
          )}

          {currentView === 'reports' && (
            <ReportsDashboard />
          )}

          {currentView === 'database' && selectedDatabaseId && (
            <DatabaseView databaseId={selectedDatabaseId} />
          )}
        </main>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <WorkspaceSettingsModal
          onClose={() => setShowSettingsModal(false)}
          onOpenApiSettings={() => {
            setShowSettingsModal(false);
            setShowApiModal(true);
          }}
        />
      )}

      {/* Billing & Plans Modal */}
      {showBillingModal && (
        <BillingModal onClose={() => setShowBillingModal(false)} />
      )}

      {/* Personal Templates Hub Modal (Section 4A) */}
      {showTemplatesModal && (
        <PersonalTemplatesModal
          onClose={() => setShowTemplatesModal(false)}
          onPageCreated={(pageId) => {
            setSelectedPageId(pageId);
            setSelectedDatabaseId(null);
            setCurrentView('page');
          }}
          onDatabaseCreated={(dbId) => {
            setSelectedDatabaseId(dbId);
            setSelectedPageId(null);
            setCurrentView('database');
          }}
        />
      )}

      {/* Google Drive Integration Modal */}
      {showDriveModal && (
        <GoogleDriveModal
          onClose={() => setShowDriveModal(false)}
          onSelectFile={(file) => {
            if (selectedPageId) {
              api.addBlock(selectedPageId, {
                type: 'callout',
                content: {
                  text: `📁 Google Drive Attachment: [${file.name}](${file.webViewLink}) (${file.type}, ${file.size})`,
                  icon: '📁',
                },
              }).catch(() => {});
            }
          }}
        />
      )}

      {/* Google Mail (Gmail) Modal */}
      {showGmailModal && (
        <GmailModal
          onClose={() => setShowGmailModal(false)}
          onTaskCreated={() => {
            setCurrentView('tasks');
          }}
        />
      )}

      {/* Anthropic Claude AI Assistant Modal */}
      {showClaudeModal && (
        <ClaudeAssistantModal
          onClose={() => setShowClaudeModal(false)}
          onInsertContent={(content) => {
            if (selectedPageId) {
              api.addBlock(selectedPageId, {
                type: 'paragraph',
                content: { text: content },
              }).catch(() => {});
            }
          }}
        />
      )}

      {/* Birthday & Occasion Reminders Modal */}
      {showBirthdayModal && (
        <BirthdayRemindersModal
          onClose={() => setShowBirthdayModal(false)}
          onTaskCreated={() => {
            setCurrentView('tasks');
          }}
        />
      )}

      {/* API Keys & External Integrations Modal */}
      {showApiModal && (
        <ApiIntegrationsModal
          onClose={() => setShowApiModal(false)}
        />
      )}
    </div>
  );
}

