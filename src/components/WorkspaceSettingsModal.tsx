'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import {
  X, Users, Mail, Phone, UserPlus, Shield, Sparkles,
  CheckCircle, ArrowRight, Trash2, KeyRound
} from 'lucide-react';

export function WorkspaceSettingsModal({
  onClose,
  onOpenApiSettings,
}: {
  onClose: () => void;
  onOpenApiSettings?: () => void;
}) {
  const { currentWorkspace, refreshState, t } = useAuth();
  const [name, setName] = useState(currentWorkspace?.name || '');
  const [icon, setIcon] = useState(currentWorkspace?.settings?.icon || '🏢');
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite form
  const [inviteEmailOrPhone, setInviteEmailOrPhone] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteSuccess, setInviteSuccess] = useState('');

  // Convert Personal to Team state
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    if (currentWorkspace?.id) {
      loadMembers();
    }
  }, [currentWorkspace?.id]);

  const loadMembers = async () => {
    if (!currentWorkspace) return;
    try {
      const data = await api.getWorkspaceMembers(currentWorkspace.id);
      setMembers(data);
    } catch (err) {
      console.error('Error loading members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace) return;
    try {
      await api.updateWorkspace(currentWorkspace.id, {
        name,
        settings: { ...currentWorkspace.settings, icon },
      });
      await refreshState();
      alert('Workspace updated!');
    } catch (err) {
      console.error('Error updating workspace:', err);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace || !inviteEmailOrPhone.trim()) return;
    try {
      const res = await api.inviteMember(currentWorkspace.id, {
        email_or_phone: inviteEmailOrPhone,
        role: inviteRole,
      });
      setInviteSuccess(`Invite link generated! Token: ${res.token}`);
      setInviteEmailOrPhone('');
    } catch (err: any) {
      alert(err?.data?.error || err.message || 'Failed to send invite');
    }
  };

  const handleRoleChange = async (memberId: string, role: string) => {
    try {
      await api.updateMember(memberId, { role });
      loadMembers();
    } catch (err: any) {
      alert(err?.data?.error || err.message || 'Failed to update role');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remove this member from the workspace?')) return;
    try {
      await api.removeMember(memberId);
      loadMembers();
    } catch (err: any) {
      alert(err?.data?.error || err.message || 'Failed to remove member');
    }
  };

  const handleConvertPersonal = async () => {
    if (!currentWorkspace) return;
    if (!confirm('Convert this Personal workspace into a collaborative Team workspace?')) return;
    setConverting(true);
    try {
      await api.convertWorkspace(currentWorkspace.id);
      await refreshState();
      alert('Workspace converted to Team!');
    } catch (err: any) {
      alert(err?.data?.error || err.message || 'Failed to convert workspace');
    } finally {
      setConverting(false);
    }
  };

  const isPersonal = currentWorkspace?.type === 'personal';
  const isOwner = currentWorkspace?.my_role === 'owner';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 text-xs">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Workspace Settings</h2>
            <p className="text-gray-500 text-xs mt-1">
              Manage workspace name, team members, roles, and hierarchy.
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* General Details Form */}
        <form onSubmit={handleUpdateWorkspace} className="space-y-4 pb-6 border-b border-gray-200">
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-1">
              <label className="block font-medium text-gray-700 mb-1">Icon</label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full text-center px-3 py-2 text-xl border border-gray-300 rounded-lg"
              />
            </div>
            <div className="col-span-3">
              <label className="block font-medium text-gray-700 mb-1">Workspace Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-1.5 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Save Changes
            </button>
          </div>
        </form>

        {/* API Keys & External Integrations Hub */}
        <div className="py-4 border-b border-gray-200">
          <div className="p-3.5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-xl">🔌</span>
              <div>
                <h4 className="font-bold text-indigo-950 text-xs">API Keys & Live Integrations</h4>
                <p className="text-indigo-700/80 text-[11px] mt-0.5">
                  Configure live API keys for Anthropic Claude, Google Cloud Workspace (Drive/Gmail), and Razorpay.
                </p>
              </div>
            </div>
            {onOpenApiSettings && (
              <button
                type="button"
                onClick={() => { onClose(); onOpenApiSettings(); }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs text-xs whitespace-nowrap ml-4 transition"
              >
                Configure Keys
              </button>
            )}
          </div>
        </div>

        {/* Convert Personal to Team Workspace (Section 4A) */}
        {isPersonal && (
          <div className="py-6 border-b border-gray-200">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-purple-900 text-sm">Convert to Team Workspace</h4>
                <p className="text-purple-700 text-xs mt-0.5">
                  Currently in Personal Mode. Convert this workspace to invite team members and set up department hierarchy.
                </p>
              </div>
              <button
                onClick={handleConvertPersonal}
                disabled={converting}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-sm transition whitespace-nowrap ml-4"
              >
                {converting ? 'Converting...' : 'Convert to Team'}
              </button>
            </div>
          </div>
        )}

        {/* Team Members & Invites (Only for Team / Org workspaces) */}
        {!isPersonal && (
          <div className="py-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span>Invite Team Member</span>
              </h3>
              <form onSubmit={handleSendInvite} className="flex space-x-2">
                <input
                  type="text"
                  required
                  value={inviteEmailOrPhone}
                  onChange={(e) => setInviteEmailOrPhone(e.target.value)}
                  placeholder="Email or Mobile (+91...)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white"
                >
                  <option value="member">Member (Staff)</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="guest">Guest</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold whitespace-nowrap shadow-sm"
                >
                  Send Invite
                </button>
              </form>

              {inviteSuccess && (
                <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-[11px]">
                  {inviteSuccess}
                </div>
              )}
            </div>

            {/* Members List */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-600" />
                <span>Members ({members.length})</span>
              </h3>
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                {members.map((m) => (
                  <div key={m.id} className="p-3 flex items-center justify-between hover:bg-gray-50/70">
                    <div className="flex items-center space-x-3 truncate">
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                        {m.user?.name ? m.user.name[0] : 'U'}
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-gray-900">{m.user?.name || 'Teammate'}</p>
                        <p className="text-[10px] text-gray-400">{m.user?.email || m.user?.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {isOwner && m.role !== 'owner' ? (
                        <select
                          value={m.role}
                          onChange={(e) => handleRoleChange(m.id, e.target.value)}
                          className="px-2 py-1 border border-gray-200 rounded bg-white text-gray-700 text-xs"
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="member">Member</option>
                          <option value="guest">Guest</option>
                        </select>
                      ) : (
                        <span className="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-gray-100 text-gray-700">
                          {m.role}
                        </span>
                      )}

                      {isOwner && m.role !== 'owner' && (
                        <button
                          onClick={() => handleRemoveMember(m.id)}
                          className="p-1 hover:text-red-600 rounded text-gray-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

