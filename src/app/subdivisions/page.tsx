'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import {
  Building2,
  User,
  Briefcase,
  Sliders,
  ArrowRight,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Layers,
  ChevronRight,
  LogOut,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { SeyalLogo } from '@/components/SeyalLogo';

interface SubdivisionCard {
  id: 'organisation' | 'personal' | 'freelancer' | 'customize';
  title: string;
  badge: string;
  description: string;
  icon: any;
  color: string;
  bgGradient: string;
  borderHover: string;
  actionText: string;
}

export default function SubdivisionsPage() {
  const router = useRouter();
  const { user, workspaces, setCurrentWorkspace, logout, isLoading } = useAuth();
  const [subdivisionsData, setSubdivisionsData] = useState<any>(null);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [selectedSubdivision, setSelectedSubdivision] = useState<string>('organisation');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      loadSubdivisions();
    }
  }, [user]);

  const loadSubdivisions = async () => {
    try {
      setLoadingSubs(true);
      const res = await api.getSubdivisions();
      setSubdivisionsData(res);
    } catch (err) {
      console.error('Failed to load subdivisions:', err);
    } finally {
      setLoadingSubs(false);
    }
  };

  const subdivisionCards: SubdivisionCard[] = [
    {
      id: 'organisation',
      title: 'Organisation',
      badge: 'Enterprise & Teams',
      description: 'Manage organisations, employees, managers, departments, projects and business operations.',
      icon: Building2,
      color: 'text-emerald-700',
      bgGradient: 'from-emerald-500/10 via-emerald-50/40 to-transparent',
      borderHover: 'hover:border-emerald-500 hover:shadow-emerald-500/10',
      actionText: 'Enter Organisation Workspace',
    },
    {
      id: 'personal',
      title: 'Personal',
      badge: 'Individual Productivity',
      description: 'Manage personal tasks, habits, goals, schedules, notes and everyday productivity.',
      icon: User,
      color: 'text-blue-700',
      bgGradient: 'from-blue-500/10 via-blue-50/40 to-transparent',
      borderHover: 'hover:border-blue-500 hover:shadow-blue-500/10',
      actionText: 'Enter Personal Workspace',
    },
    {
      id: 'freelancer',
      title: 'Freelancer',
      badge: 'Client Work & Deliverables',
      description: 'Manage freelance clients, projects, deliverables, deadlines and hourly/milestone work activities.',
      icon: Briefcase,
      color: 'text-purple-700',
      bgGradient: 'from-purple-500/10 via-purple-50/40 to-transparent',
      borderHover: 'hover:border-purple-500 hover:shadow-purple-500/10',
      actionText: 'Enter Freelancer Workspace',
    },
    {
      id: 'customize',
      title: 'Customize',
      badge: 'Configurable Engine',
      description: 'Create a tailored, configurable workspace mapped exactly to your unique organizational workflow.',
      icon: Sliders,
      color: 'text-amber-700',
      bgGradient: 'from-amber-500/10 via-amber-50/40 to-transparent',
      borderHover: 'hover:border-amber-500 hover:shadow-amber-500/10',
      actionText: 'Enter Custom Workspace',
    },
  ];

  const handleSelectWorkspace = (ws: any) => {
    setCurrentWorkspace(ws);
    router.push('/');
  };

  const handleContinueSubdivision = async (subdivisionId: string) => {
    // Find first accessible workspace under this subdivision
    const matchingWs = workspaces.find((w: any) => {
      const sub = w.subdivision || (w.type === 'organization' ? 'organisation' : 'personal');
      return sub === subdivisionId;
    });

    if (matchingWs) {
      setCurrentWorkspace(matchingWs);
      router.push('/');
    } else {
      // Auto-create workspace for this subdivision
      setSelectedSubdivision(subdivisionId);
      setShowCreateModal(true);
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    setCreating(true);
    try {
      const type = selectedSubdivision === 'organisation' ? 'organization' : 'personal';
      const res = await api.createWorkspace({
        name: newWorkspaceName.trim(),
        type,
        settings: { subdivision: selectedSubdivision },
      });
      setCurrentWorkspace(res);
      setShowCreateModal(false);
      router.push('/');
    } catch (err: any) {
      alert(err.message || 'Failed to create workspace');
    } finally {
      setCreating(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-4">
        <SeyalLogo size="lg" />
        <p className="text-xs font-semibold text-neutral-500">Loading your Seyal subdivisions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-neutral-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <SeyalLogo size="md" />
            <div className="h-4 w-px bg-neutral-200 hidden sm:block" />
            <span className="text-xs font-semibold text-neutral-500 hidden sm:inline-block">
              Workspace Hub
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Super Admin Global Link if privileged */}
            {(user.is_superuser || user.is_staff) && (
              <Link
                href="/superadmin"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition shadow-2xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                <span>Superadmin Portal</span>
              </Link>
            )}

            <div className="text-right hidden md:block">
              <div className="text-xs font-bold text-neutral-800">{user.name || user.email}</div>
              <div className="text-[10px] text-neutral-500">{user.email}</div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 flex flex-col justify-center">
        {/* Title & Description */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-100/80 text-emerald-800 mb-3 border border-emerald-200">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Select Your Subdivision</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Welcome back to <span className="text-[#08745B]">SEYAL</span>
          </h1>
          <p className="mt-2 text-sm text-neutral-600 max-w-xl mx-auto">
            Choose your subdivision below to access tailored workflows, dedicated dashboards, roles, and project management controls.
          </p>
        </div>

        {/* 4 Large Interactive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {subdivisionCards.map((card) => {
            const Icon = card.icon;
            const subInfo = subdivisionsData?.subdivisions?.[card.id];
            const accessibleCount = subInfo?.accessible_workspaces_count ?? workspaces.filter((w: any) => {
              const sub = w.subdivision || (w.type === 'organization' ? 'organisation' : 'personal');
              return sub === card.id;
            }).length;

            return (
              <div
                key={card.id}
                onClick={() => setSelectedSubdivision(card.id)}
                className={`group relative rounded-2xl bg-white border p-6 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-xl cursor-pointer ${
                  selectedSubdivision === card.id
                    ? 'border-[#08745B] ring-2 ring-[#08745B]/20 shadow-lg'
                    : 'border-neutral-200 ' + card.borderHover
                }`}
              >
                {/* Background Tint Gradient */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${card.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
                />

                <div className="relative z-10">
                  {/* Card Header: Icon & Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center bg-neutral-100 group-hover:scale-105 transition-transform ${card.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                      {card.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-neutral-900 group-hover:text-[#08745B] transition-colors">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-xs text-neutral-500 leading-relaxed min-h-[48px]">
                    {card.description}
                  </p>

                  {/* Accessible Workspaces Counter */}
                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-neutral-400" />
                      Active Workspaces
                    </span>
                    <span className="font-bold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-full text-[11px]">
                      {accessibleCount}
                    </span>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="relative z-10 mt-6 pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContinueSubdivision(card.id);
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow-2xs ${
                      selectedSubdivision === card.id
                        ? 'bg-[#08745B] text-white hover:bg-[#119875]'
                        : 'bg-neutral-100 text-neutral-800 hover:bg-[#08745B] hover:text-white'
                    }`}
                  >
                    <span>{card.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Existing Workspaces Quick-List */}
        {workspaces.length > 0 && (
          <div className="mt-12 bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-neutral-900">Your Accessible Workspaces</h4>
                <p className="text-xs text-neutral-500">Directly jump into any of your active workspaces.</p>
              </div>
              <button
                onClick={() => {
                  setNewWorkspaceName('');
                  setShowCreateModal(true);
                }}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#08745B] hover:text-[#119875] bg-[#EDF6F1] px-3 py-1.5 rounded-xl border border-emerald-200 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Workspace</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {workspaces.map((ws: any) => {
                const sub = ws.subdivision || (ws.type === 'organization' ? 'organisation' : 'personal');
                return (
                  <div
                    key={ws.id}
                    onClick={() => handleSelectWorkspace(ws)}
                    className="p-3.5 rounded-xl border border-neutral-200 hover:border-[#08745B] hover:bg-[#EDF6F1]/30 cursor-pointer transition flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-sm shrink-0">
                        {ws.settings?.icon || (sub === 'organisation' ? '🏢' : '👤')}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-neutral-800 truncate group-hover:text-[#08745B] transition">
                          {ws.name}
                        </div>
                        <div className="text-[10px] text-neutral-400 capitalize">
                          {sub} • {ws.plan || 'Free'}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#08745B] transition shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200/80 py-4 text-center text-xs text-neutral-400 bg-white">
        &copy; {new Date().getFullYear()} SEYAL Platform. All rights reserved.
      </footer>

      {/* CREATE WORKSPACE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-md overflow-hidden p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-neutral-900">
                Create {selectedSubdivision.toUpperCase()} Workspace
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-neutral-600 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder={`e.g., ${selectedSubdivision === 'organisation' ? 'Acme Global Operations' : 'My Personal Space'}`}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#08745B] focus:ring-2 focus:ring-[#08745B]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Subdivision Type
                </label>
                <div className="capitalize px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700">
                  {selectedSubdivision}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newWorkspaceName.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#08745B] hover:bg-[#119875] text-white shadow-2xs transition disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create &amp; Enter</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
