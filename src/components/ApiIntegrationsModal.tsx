'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import {
  X, Key, Shield, Sparkles, CheckCircle2, AlertCircle,
  ExternalLink, Eye, EyeOff, Loader2, RefreshCw, Zap,
  Lock, Save, Globe, CreditCard, ChevronRight, Check
} from 'lucide-react';

interface ApiIntegrationsModalProps {
  onClose: () => void;
  defaultTab?: 'claude' | 'google' | 'razorpay';
}

export function ApiIntegrationsModal({ onClose, defaultTab = 'claude' }: ApiIntegrationsModalProps) {
  const { currentWorkspace } = useAuth();
  const [activeTab, setActiveTab] = useState<'claude' | 'google' | 'razorpay'>(defaultTab);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Claude fields
  const [claudeKey, setClaudeKey] = useState('');
  const [claudeModel, setClaudeModel] = useState('claude-3-5-sonnet-20241022');
  const [showClaudeKey, setShowClaudeKey] = useState(false);
  const [claudeConfigured, setClaudeConfigured] = useState(false);

  // Google fields
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleClientSecret, setGoogleClientSecret] = useState('');
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [showGoogleSecret, setShowGoogleSecret] = useState(false);
  const [googleConfigured, setGoogleConfigured] = useState(false);

  // Razorpay fields
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('');
  const [razorpayMode, setRazorpayMode] = useState('test');
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);
  const [razorpayConfigured, setRazorpayConfigured] = useState(false);

  // Test states
  const [testing, setTesting] = useState<'claude' | 'google' | 'razorpay' | null>(null);
  const [testResult, setTestResult] = useState<{
    provider: string;
    success: boolean;
    message: string;
    latency_ms?: number;
  } | null>(null);

  useEffect(() => {
    loadSettings();
  }, [currentWorkspace?.id]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.getIntegrationSettings(currentWorkspace?.id);
      if (res.claude) {
        setClaudeConfigured(res.claude.configured);
        setClaudeKey(res.claude.masked_key || '');
        setClaudeModel(res.claude.model || 'claude-3-5-sonnet-20241022');
      }
      if (res.google) {
        setGoogleConfigured(res.google.configured);
        setGoogleClientId(res.google.client_id || '');
        setGoogleClientSecret(res.google.masked_secret || '');
        setGoogleApiKey(res.google.masked_api_key || '');
      }
      if (res.razorpay) {
        setRazorpayConfigured(res.razorpay.configured);
        setRazorpayKeyId(res.razorpay.key_id || '');
        setRazorpayKeySecret(res.razorpay.masked_secret || '');
        setRazorpayMode(res.razorpay.mode || 'test');
      }
    } catch (err) {
      console.error('Failed to load integration settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.updateIntegrationSettings({
        workspace_id: currentWorkspace?.id,
        anthropic_api_key: claudeKey,
        anthropic_model: claudeModel,
        google_client_id: googleClientId,
        google_client_secret: googleClientSecret,
        google_api_key: googleApiKey,
        razorpay_key_id: razorpayKeyId,
        razorpay_key_secret: razorpayKeySecret,
        razorpay_mode: razorpayMode,
      });

      setSaveSuccess(true);
      await loadSettings();
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      alert(err?.data?.error || err.message || 'Failed to save API settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async (provider: 'claude' | 'google' | 'razorpay') => {
    setTesting(provider);
    setTestResult(null);
    try {
      const payload: any = { provider, workspace_id: currentWorkspace?.id };
      if (provider === 'claude') payload.api_key = claudeKey;
      if (provider === 'google') {
        payload.client_id = googleClientId;
        payload.api_key = googleApiKey;
      }
      if (provider === 'razorpay') payload.key_id = razorpayKeyId;

      const res = await api.testIntegrationConnection(payload);
      setTestResult({
        provider,
        success: res.success,
        message: res.message || 'Connected successfully!',
        latency_ms: res.latency_ms,
      });
    } catch (err: any) {
      setTestResult({
        provider,
        success: false,
        message: err?.data?.message || err?.message || 'Connection test failed',
      });
    } finally {
      setTesting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                API Keys & Live Integrations
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Production Ready
                </span>
              </h2>
              <p className="text-xs text-indigo-200/80">
                Configure live API credentials for Anthropic Claude, Google Cloud Workspace & Razorpay
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-gray-200 bg-gray-50/70 px-6 gap-2 text-sm font-medium">
          <button
            onClick={() => setActiveTab('claude')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'claude'
                ? 'border-indigo-600 text-indigo-700 font-semibold bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Anthropic Claude AI</span>
            {claudeConfigured && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('google')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'google'
                ? 'border-indigo-600 text-indigo-700 font-semibold bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Globe className="w-4 h-4 text-blue-600" />
            <span>Google Cloud & Workspace</span>
            {googleConfigured && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('razorpay')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'razorpay'
                ? 'border-indigo-600 text-indigo-700 font-semibold bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <CreditCard className="w-4 h-4 text-sky-600" />
            <span>Razorpay Payments</span>
            {razorpayConfigured && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600" />
              <p className="text-sm">Loading API integration credentials...</p>
            </div>
          ) : (
            <form id="api-settings-form" onSubmit={handleSave} className="space-y-6">
              {/* Save Success Banner */}
              {saveSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5 text-sm animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>API Integration settings saved securely to workspace configuration!</span>
                </div>
              )}

              {/* Live Test Result Alert */}
              {testResult && testResult.provider === activeTab && (
                <div
                  className={`p-3.5 rounded-xl border text-sm flex items-start gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">
                      {testResult.success ? 'Connection Verified' : 'Connection Failed'}
                    </p>
                    <p className="text-xs mt-0.5">{testResult.message}</p>
                    {testResult.latency_ms && (
                      <p className="text-[11px] opacity-75 mt-1 font-mono">
                        Roundtrip Ping: {testResult.latency_ms}ms
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 1: CLAUDE AI */}
              {activeTab === 'claude' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/80 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-purple-900">
                      <p className="font-semibold">Anthropic Claude 3.5 Sonnet Integration</p>
                      <p className="text-xs text-purple-700 mt-0.5">
                        Powers AI document drafting, task breakdown, automatic summarization, and interactive workspace Q&A.
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Anthropic API Key
                      </label>
                      <a
                        href="https://console.anthropic.com/settings/keys"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                      >
                        Get Key from Anthropic Console <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="relative">
                      <input
                        type={showClaudeKey ? 'text' : 'password'}
                        placeholder="sk-ant-api03-..."
                        value={claudeKey}
                        onChange={(e) => setClaudeKey(e.target.value)}
                        className="w-full pl-3.5 pr-20 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowClaudeKey(!showClaudeKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showClaudeKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty to use built-in offline smart copilot, or enter your key for full live Claude 3.5 Sonnet API access.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide block mb-1.5">
                      Model Preference
                    </label>
                    <select
                      value={claudeModel}
                      onChange={(e) => setClaudeModel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                    >
                      <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Recommended - Deep Intelligence)</option>
                      <option value="claude-3-haiku-20240307">Claude 3 Haiku (Ultra Fast & Lightweight)</option>
                      <option value="claude-3-opus-20240229">Claude 3 Opus (Complex Research)</option>
                    </select>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      disabled={testing === 'claude'}
                      onClick={() => handleTestConnection('claude')}
                      className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {testing === 'claude' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                          Testing Live Ping...
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          Test Anthropic API Connection
                        </>
                      )}
                    </button>
                    <span className="text-xs text-gray-500">
                      Status: {claudeConfigured ? '🟢 Live API Configured' : '⚪ Demo Copilot Active'}
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 2: GOOGLE CLOUD */}
              {activeTab === 'google' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 flex items-start gap-3">
                    <Globe className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold">Google Cloud & Google Workspace Integration</p>
                      <p className="text-xs text-blue-700 mt-0.5">
                        Enables Google Sign-In, Google Drive file picker, Gmail email-to-task conversion, and Google Calendar syncing.
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Google OAuth 2.0 Client ID
                      </label>
                      <a
                        href="https://console.cloud.google.com/apis/credentials"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                      >
                        Google Cloud Console <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. 123456789-abcdefg.apps.googleusercontent.com"
                      value={googleClientId}
                      onChange={(e) => setGoogleClientId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide block mb-1.5">
                      Google OAuth 2.0 Client Secret
                    </label>
                    <div className="relative">
                      <input
                        type={showGoogleSecret ? 'text' : 'password'}
                        placeholder="GOCSPX-..."
                        value={googleClientSecret}
                        onChange={(e) => setGoogleClientSecret(e.target.value)}
                        className="w-full pl-3.5 pr-20 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowGoogleSecret(!showGoogleSecret)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showGoogleSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 space-y-1">
                    <p className="font-semibold text-gray-800">OAuth Callback URI Configuration:</p>
                    <p className="font-mono bg-white px-2 py-1 rounded border border-gray-200 text-gray-700">
                      http://localhost:3000/auth/callback/google
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Add this exact redirect URI under your Google Cloud OAuth 2.0 Client ID authorized redirect URIs.
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      disabled={testing === 'google'}
                      onClick={() => handleTestConnection('google')}
                      className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {testing === 'google' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                          Validating Client ID...
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5 text-blue-600" />
                          Validate Google OAuth Config
                        </>
                      )}
                    </button>
                    <span className="text-xs text-gray-500">
                      Scopes: Drive, Gmail, Profile
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 3: RAZORPAY */}
              {activeTab === 'razorpay' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200/80 flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-sky-900">
                      <p className="font-semibold">Razorpay INR Subscriptions & UPI Checkout</p>
                      <p className="text-xs text-sky-700 mt-0.5">
                        Accept Indian Rupee (INR) payments, UPI, debit/credit cards, and automated recurring billing for Pro & Business plans.
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Razorpay Key ID
                      </label>
                      <a
                        href="https://dashboard.razorpay.com/app/keys"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                      >
                        Razorpay Dashboard <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <input
                      type="text"
                      placeholder="rzp_test_... or rzp_live_..."
                      value={razorpayKeyId}
                      onChange={(e) => setRazorpayKeyId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide block mb-1.5">
                      Razorpay Key Secret
                    </label>
                    <div className="relative">
                      <input
                        type={showRazorpaySecret ? 'text' : 'password'}
                        placeholder="rzp_secret_..."
                        value={razorpayKeySecret}
                        onChange={(e) => setRazorpayKeySecret(e.target.value)}
                        className="w-full pl-3.5 pr-20 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showRazorpaySecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide block mb-1.5">
                      Environment Mode
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          name="razorpayMode"
                          value="test"
                          checked={razorpayMode === 'test'}
                          onChange={() => setRazorpayMode('test')}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Test / Sandbox Mode</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          name="razorpayMode"
                          value="live"
                          checked={razorpayMode === 'live'}
                          onChange={() => setRazorpayMode('live')}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Live Production Mode</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      disabled={testing === 'razorpay'}
                      onClick={() => handleTestConnection('razorpay')}
                      className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {testing === 'razorpay' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
                          Testing Razorpay Key...
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5 text-sky-600" />
                          Validate Razorpay Keys
                        </>
                      )}
                    </button>
                    <span className="text-xs text-gray-500">
                      Currency: INR (₹) Supported
                    </span>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Lock className="w-3.5 h-3.5 text-gray-400" />
            <span>Credentials encrypted & saved securely per workspace</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium text-sm transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              form="api-settings-form"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save API Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

