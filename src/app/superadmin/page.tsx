'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import {
  ShieldAlert,
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  Activity,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ArrowLeft,
  Loader2,
  Sparkles,
  BarChart3,
  Calendar,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { SeyalLogo } from '@/components/SeyalLogo';

export default function SuperadminPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [analytics, setAnalytics] = useState<any>(null);
  const [organisations, setOrganisations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // New Org Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    email: '',
    phone: '',
    address: '',
    industry: 'Technology',
    registration_number: '',
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    owner_password: '',
    subscription_plan: 'starter',
  });

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (!user.is_superuser && !user.is_staff) {
        // Not a Seyal platform superadmin
        router.push('/subdivisions');
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && (user.is_superuser || user.is_staff)) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsData, orgsData] = await Promise.all([
        api.getSuperadminAnalytics(),
        api.getSuperadminOrganisations(),
      ]);
      setAnalytics(analyticsData);
      setOrganisations(orgsData);
    } catch (err) {
      console.error('Superadmin data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOrgStatus = async (org: any) => {
    try {
      const updated = await api.updateSuperadminOrganisation(org.id, {
        is_active: !org.is_active,
      });
      setOrganisations((prev) =>
        prev.map((o) => (o.id === org.id ? { ...o, is_active: updated.is_active } : o))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update organisation status');
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      const res = await api.createSuperadminOrganisation(formData);
      setOrganisations([res, ...organisations]);
      setShowCreateModal(false);
      setFormData({
        name: '',
        logo_url: '',
        email: '',
        phone: '',
        address: '',
        industry: 'Technology',
        registration_number: '',
        owner_name: '',
        owner_email: '',
        owner_phone: '',
        owner_password: '',
        subscription_plan: 'starter',
      });
      // Refresh analytics
      const updatedAnalytics = await api.getSuperadminAnalytics();
      setAnalytics(updatedAnalytics);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create organisation');
    } finally {
      setCreating(false);
    }
  };

  const filteredOrgs = organisations.filter((org) => {
    const matchesSearch =
      org.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.owner?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'active') return matchesSearch && org.is_active;
    if (filterStatus === 'inactive') return matchesSearch && !org.is_active;
    return matchesSearch;
  });

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-3">
        <SeyalLogo size="lg" />
        <p className="text-xs font-semibold text-neutral-500">Loading Seyal Global Platform Portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Top Global Super Admin Bar */}
      <header className="bg-neutral-900 text-white border-b border-neutral-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <SeyalLogo size="md" />
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-400 border border-emerald-700/50">
              Product Owner Portal
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/subdivisions"
              className="inline-flex items-center space-x-1 text-xs text-neutral-400 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Workspace Hub</span>
            </Link>
            <div className="h-4 w-px bg-neutral-700" />
            <span className="text-xs text-neutral-300 font-mono">
              {user.email} (Superadmin)
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Global Platform Analytics &amp; Organisation Management
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Real-time platform metrics, organization provisioning, user growth and revenue tracking.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#08745B] hover:bg-[#119875] text-white shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Provision New Organisation</span>
          </button>
        </div>

        {/* SECTION 1: KPI CARDS */}
        {analytics && (
          <div className="space-y-6">
            {/* Organisation Analytics */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#08745B]" />
                <span>Organisation Analytics</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-white rounded-xl p-4 border border-neutral-200/80 shadow-2xs">
                  <span className="text-[11px] text-neutral-500">Total Registered</span>
                  <div className="text-xl font-extrabold text-neutral-900 mt-1">
                    {analytics.organisations.total}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-neutral-200/80 shadow-2xs">
                  <span className="text-[11px] text-emerald-600 font-medium">Active Orgs</span>
                  <div className="text-xl font-extrabold text-emerald-700 mt-1">
                    {analytics.organisations.active}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-neutral-200/80 shadow-2xs">
                  <span className="text-[11px] text-rose-500 font-medium">Inactive Orgs</span>
                  <div className="text-xl font-extrabold text-rose-600 mt-1">
                    {analytics.organisations.inactive}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-neutral-200/80 shadow-2xs">
                  <span className="text-[11px] text-blue-600 font-medium">New This Month</span>
                  <div className="text-xl font-extrabold text-blue-700 mt-1">
                    {analytics.organisations.new_this_month}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-neutral-200/80 shadow-2xs">
                  <span className="text-[11px] text-purple-600 font-medium">Org Admins</span>
                  <div className="text-xl font-extrabold text-purple-700 mt-1">
                    {analytics.organisations.total_admins}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-neutral-200/80 shadow-2xs">
                  <span className="text-[11px] text-neutral-500 font-medium">Total Platform Users</span>
                  <div className="text-xl font-extrabold text-neutral-900 mt-1">
                    {analytics.organisations.total_users}
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Analytics */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Revenue Analytics</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-white rounded-xl p-4 border border-neutral-200/80 shadow-2xs">
                  <span className="text-[11px] text-neutral-500">Total Revenue</span>
                  <div className="text-xl font-extrabold text-neutral-900 mt-1">
                    ₹{Number(analytics.revenue.total_inr).toLocaleString()}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-neutral-200/80 shadow-2xs">
                  <span className="text-[11px] text-emerald-600">Monthly Revenue</span>
                  <div className="text-xl font-extrabold text-emerald-700 mt-1">
                    ₹{Number(analytics.revenue.monthly_inr).toLocaleString()}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-neutral-200/80 shadow-2xs">
                  <span className="text-[11px] text-neutral-500">Active Subscriptions</span>
                  <div className="text-xl font-extrabold text-neutral-900 mt-1">
                    {analytics.revenue.active_subscriptions}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-neutral-200/80 shadow-2xs">
                  <span className="text-[11px] text-amber-600">Pending Payments</span>
                  <div className="text-xl font-extrabold text-amber-600 mt-1">
                    {analytics.revenue.pending_payments}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-neutral-200/80 shadow-2xs">
                  <span className="text-[11px] text-rose-500">Failed Payments</span>
                  <div className="text-xl font-extrabold text-rose-600 mt-1">
                    {analytics.revenue.failed_payments}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-neutral-200/80 shadow-2xs">
                  <span className="text-[11px] text-neutral-500">Annual Run Rate</span>
                  <div className="text-xl font-extrabold text-neutral-900 mt-1">
                    ₹{Number(analytics.revenue.annual_inr).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Product & Activity Analytics */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Product &amp; Active Usage</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl p-4 border border-neutral-200/80 shadow-2xs">
                  <span className="text-[11px] text-neutral-500">Daily Active Users (DAU)</span>
                  <div className="text-xl font-extrabold text-neutral-900 mt-1">
                    {analytics.product.dau}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-neutral-200/80 shadow-2xs">
                  <span className="text-[11px] text-neutral-500">Monthly Active Users (MAU)</span>
                  <div className="text-xl font-extrabold text-neutral-900 mt-1">
                    {analytics.product.mau}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-neutral-200/80 shadow-2xs">
                  <span className="text-[11px] text-neutral-500">Total Workspaces</span>
                  <div className="text-xl font-extrabold text-neutral-900 mt-1">
                    {analytics.product.total_workspaces}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-neutral-200/80 shadow-2xs">
                  <span className="text-[11px] text-neutral-500">Plans Distributed</span>
                  <div className="text-xs font-semibold text-neutral-700 mt-2 flex flex-wrap gap-1">
                    {analytics.product.plan_distribution.map((p: any, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-neutral-100 text-[10px]">
                        {p.subscription_plan || 'free'}: {p.count}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: ORGANISATION MANAGEMENT TABLE */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
          {/* Table Toolbar */}
          <div className="p-4 sm:p-5 border-b border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search organisations, owners, emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#08745B]"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <span className="text-xs text-neutral-500">Status:</span>
              <div className="inline-flex rounded-lg border border-neutral-200 p-0.5 bg-neutral-50 text-xs">
                {(['all', 'active', 'inactive'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1 rounded-md capitalize font-semibold transition ${
                      filterStatus === st
                        ? 'bg-white text-neutral-900 shadow-2xs'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-600 uppercase text-[10px] tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Organisation Name</th>
                  <th className="py-3 px-4 font-semibold">Owner (Super Admin)</th>
                  <th className="py-3 px-4 font-semibold">Industry</th>
                  <th className="py-3 px-4 font-semibold">Plan</th>
                  <th className="py-3 px-4 font-semibold">Workspaces</th>
                  <th className="py-3 px-4 font-semibold">Created Date</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredOrgs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-neutral-400 text-xs">
                      No organisations found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrgs.map((org) => (
                    <tr key={org.id} className="hover:bg-neutral-50/70 transition">
                      <td className="py-3.5 px-4 font-bold text-neutral-900">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#08745B] border border-emerald-200 flex items-center justify-center font-bold">
                            {org.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div>{org.name}</div>
                            <div className="text-[10px] font-normal text-neutral-400">{org.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-neutral-800">
                          {org.owner?.name || org.owner?.email || 'N/A'}
                        </div>
                        <div className="text-[10px] text-neutral-400">{org.owner?.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-600">{org.industry || 'General'}</td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {org.subscription_plan}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-700 font-semibold">
                        {org.workspaces_count ?? 1}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-500">
                        {new Date(org.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {org.is_active ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                            <XCircle className="w-3.5 h-3.5" />
                            Suspended
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleToggleOrgStatus(org)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border ${
                            org.is_active
                              ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {org.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL: PROVISION NEW ORGANISATION & OWNER ACCOUNT */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-neutral-900">
                  Provision New Organisation &amp; Owner Account
                </h3>
                <p className="text-xs text-neutral-500">
                  Establishes the enterprise workspace, subscription, and company owner credentials.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-neutral-600 text-sm"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateOrg} className="space-y-4">
              {/* Org Information */}
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                1. Organisation Details
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Organisation Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Acme Global Corporation"
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#08745B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Industry / Category
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="Technology, Manufacturing, etc."
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#08745B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@acme.com"
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#08745B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Official Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#08745B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Registration / CIN Number
                  </label>
                  <input
                    type="text"
                    value={formData.registration_number}
                    onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                    placeholder="U72900TN2026PTC..."
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#08745B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Subscription Plan
                  </label>
                  <select
                    value={formData.subscription_plan}
                    onChange={(e) => setFormData({ ...formData, subscription_plan: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#08745B] bg-white"
                  >
                    <option value="free">Free Pilot</option>
                    <option value="starter">Starter Plan</option>
                    <option value="pro">Pro Plan</option>
                    <option value="enterprise">Enterprise Tier</option>
                  </select>
                </div>
              </div>

              {/* Owner Account Information */}
              <div className="pt-2 border-t border-neutral-100 text-xs font-bold uppercase tracking-wider text-neutral-500">
                2. Company Owner Account (Organisation Super Admin)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Owner Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.owner_name}
                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#08745B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Owner Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.owner_email}
                    onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
                    placeholder="owner@acme.com"
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#08745B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Owner Phone
                  </label>
                  <input
                    type="text"
                    value={formData.owner_phone}
                    onChange={(e) => setFormData({ ...formData, owner_phone: e.target.value })}
                    placeholder="+91 9988776655"
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#08745B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Initial Owner Password
                  </label>
                  <input
                    type="password"
                    value={formData.owner_password}
                    onChange={(e) => setFormData({ ...formData, owner_password: e.target.value })}
                    placeholder="Default: Welcome@123"
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#08745B]"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !formData.name || !formData.owner_email}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#08745B] hover:bg-[#119875] text-white shadow-2xs transition disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Provision Organisation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
