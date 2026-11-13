'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import { X, Check, Sparkles, CreditCard, ShieldCheck } from 'lucide-react';

export function BillingModal({ onClose }: { onClose: () => void }) {
  const { currentWorkspace, refreshState, t } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const plansData = await api.getPlans();
      setPlans(plansData);
    } catch (err) {
      console.error('Error loading plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planSlug: string) => {
    if (!currentWorkspace) return;
    setProcessingPlan(planSlug);
    setSuccessMsg('');
    try {
      // 1. Create order
      const order = await api.createOrder(currentWorkspace.id, {
        plan_slug: planSlug,
        billing_cycle: cycle,
      });

      if (order.status === 'success') {
        setSuccessMsg(order.message);
        await refreshState();
        return;
      }

      // 2. Confirm payment simulation (Razorpay)
      const confirmation = await api.confirmPayment(currentWorkspace.id, {
        order_id: order.order_id,
        plan_slug: planSlug,
        billing_cycle: cycle,
        payment_id: `pay_rzp_${Date.now().toString().slice(-8)}`,
      });

      setSuccessMsg(confirmation.message);
      await refreshState();
    } catch (err: any) {
      alert(err?.data?.error || err.message || 'Payment failed');
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-4xl w-full max-h-[92vh] overflow-y-auto p-8 text-xs">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⚡</span>
              <h2 className="text-2xl font-bold text-gray-900">Upgrade Seyal Workspace</h2>
            </div>
            <p className="text-gray-500 text-xs mt-1">
              INR Pricing with Razorpay, UPI, Credit Cards, NetBanking.
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Billing cycle toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs">
            <button
              onClick={() => setCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg font-semibold transition ${cycle === 'monthly' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setCycle('yearly')}
              className={`px-4 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1 ${cycle === 'yearly' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
            >
              <span>Yearly Billing</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-center font-bold">
            🎉 {successMsg}
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p) => {
            const price = cycle === 'yearly' ? p.price_inr_yearly : p.price_inr_monthly;
            const isCurrent = currentWorkspace?.plan === p.slug;
            const isPopular = p.slug === 'business';

            return (
              <div
                key={p.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between relative transition ${isPopular ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-md bg-blue-50/20' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow">
                    Most Popular
                  </span>
                )}

                <div>
                  <h3 className="font-bold text-gray-900 text-base">{p.name}</h3>
                  <div className="mt-3 flex items-baseline">
                    <span className="text-2xl font-black text-gray-900">₹{price}</span>
                    <span className="text-gray-500 text-[11px] ml-1">/{cycle === 'yearly' ? 'year' : 'month'}</span>
                  </div>

                  <p className="text-[11px] text-gray-500 mt-2 pb-4 border-b border-gray-100">
                    Up to {p.max_members} members · {p.max_storage_mb >= 1024 ? `${Math.round(p.max_storage_mb / 1024)}GB` : `${p.max_storage_mb}MB`} storage
                  </p>

                  <ul className="mt-4 space-y-2 text-[11px] text-gray-600">
                    {p.features?.map((f: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <button
                    disabled={isCurrent || processingPlan === p.slug}
                    onClick={() => handleSubscribe(p.slug)}
                    className={`w-full py-2 px-3 rounded-lg font-semibold text-xs shadow-sm transition ${isCurrent ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : isPopular ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}
                  >
                    {isCurrent ? 'Active Plan' : processingPlan === p.slug ? 'Processing...' : 'Upgrade Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-center space-x-4 text-gray-400 text-[11px]">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure 256-bit Razorpay Payments</span>
          </span>
          <span>·</span>
          <span>Instant Activation</span>
          <span>·</span>
          <span>GST Invoice Available</span>
        </div>
      </div>
    </div>
  );
}

