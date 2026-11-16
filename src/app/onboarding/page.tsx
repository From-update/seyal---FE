'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import { User, Users, KeyRound, ArrowRight } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { refreshState, t } = useAuth();
  const [selectedMode, setSelectedMode] = useState<'myself' | 'team' | 'join'>('myself');
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    setError('');
    setLoading(true);
    try {
      if (selectedMode === 'team' && !teamName.trim()) {
        setError('Please enter a team name');
        setLoading(false);
        return;
      }
      if (selectedMode === 'join' && !inviteCode.trim()) {
        setError('Please enter your invite code');
        setLoading(false);
        return;
      }

      await api.chooseOnboarding({
        mode: selectedMode,
        team_name: teamName,
        invite_token: inviteCode
      });
      await refreshState();
      router.push('/');
    } catch (err: any) {
      setError(err?.data?.error || err.message || 'Onboarding step failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
      suppressHydrationWarning
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="text-center">
          <span className="text-4xl">🚀</span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900">
            How will you use Seyal?
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            You can always invite team members or switch workspaces later.
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-6 shadow-sm border border-gray-200 sm:rounded-xl sm:px-10">
          <div className="space-y-3">
            {/* For myself */}
            <div
              onClick={() => setSelectedMode('myself')}
              className={`p-4 border rounded-xl cursor-pointer transition flex items-start space-x-4 ${selectedMode === 'myself' ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700 mt-0.5">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 text-sm">For myself (Personal Workspace)</h3>
                  {selectedMode === 'myself' && <span className="text-blue-600 font-bold">✓</span>}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Keep notes, organize tasks, habits, and personal databases. Fully private to you.
                </p>
              </div>
            </div>

            {/* With team */}
            <div
              onClick={() => setSelectedMode('team')}
              className={`p-4 border rounded-xl cursor-pointer transition flex items-start space-x-4 ${selectedMode === 'team' ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700 mt-0.5">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 text-sm">With my team or organization</h3>
                  {selectedMode === 'team' && <span className="text-blue-600 font-bold">✓</span>}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Department task hierarchy, manager reviews, shared docs, and permissions.
                </p>
                {selectedMode === 'team' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="e.g. Acme Corp or Computer Science Dept"
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Join team */}
            <div
              onClick={() => setSelectedMode('join')}
              className={`p-4 border rounded-xl cursor-pointer transition flex items-start space-x-4 ${selectedMode === 'join' ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700 mt-0.5">
                <KeyRound className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 text-sm">I have an invite link or code</h3>
                  {selectedMode === 'join' && <span className="text-blue-600 font-bold">✓</span>}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Join an existing college or company workspace.
                </p>
                {selectedMode === 'join' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="Paste invite token or code"
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={handleContinue}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
            >
              <span>{loading ? 'Setting up...' : 'Get Started'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

