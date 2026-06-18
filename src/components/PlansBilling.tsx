import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Check, Zap, ShieldCheck, Building, Users, 
  Trash2, HelpCircle, DollarSign, Tag, Loader2, Download, 
  ArrowLeft, Sparkles, Lock, ExternalLink, Calendar, CheckCircle2,
  Headphones
} from 'lucide-react';

interface PlansBillingProps {
  addLog: (action: string, category: 'Data Access' | 'System' | 'Modification' | 'Security', details: string) => void;
  activeTier: 'Starter' | 'Professional' | 'Enterprise' | 'CustomAI';
  setActiveTier: (tier: 'Starter' | 'Professional' | 'Enterprise' | 'CustomAI') => void;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  amountGBP?: number;
  plan: string;
  status: 'Paid' | 'Pending';
  couponApplied?: string;
  transactionHash: string;
}

export interface SupportTierConfig {
  key: 'none' | 'basic' | 'standard' | 'enterprise';
  name: string;
  priceGBP: number;
  priceUSD: number;
  sla: string;
  description: string;
  channels: string[];
}

export const SUPPORT_TIERS: SupportTierConfig[] = [
  {
    key: 'none',
    name: 'No Premium SLA Support',
    priceGBP: 0,
    priceUSD: 0,
    sla: 'Standard Help Centre (Best Effort Response)',
    description: 'Self-help documentation index & global ticket pool queue.',
    channels: ['Online Documentation', 'Community Forum']
  },
  {
    key: 'basic',
    name: 'Standard SLA Support',
    priceGBP: 200,
    priceUSD: 250,
    sla: 'Response Under 12hr Guaranteed',
    description: 'Ideal support for growing businesses starting to standardise workflows.',
    channels: ['Priority Helpdesk Ticketing', 'Secure Data Access Assistance']
  },
  {
    key: 'standard',
    name: 'Elite Premium Support',
    priceGBP: 350,
    priceUSD: 440,
    sla: 'Response Under 4hr Guaranteed',
    description: 'Perfect for business hubs with critical deadlines & real-time needs.',
    channels: ['Direct Microsoft Teams / Slack shared channel', 'Phone Call Support Escalation', 'Dedicated Expert Account Representative']
  },
  {
    key: 'enterprise',
    name: 'Emergency Enterprise Support',
    priceGBP: 500,
    priceUSD: 620,
    sla: 'Response Under 1hr Guaranteed (24/7/365)',
    description: 'Dedicated engineers on-call around the clock for fail-safe operations.',
    channels: ['24/7/365 Emergency Phone Line', 'Live Pager Duty Engineer Allocation', 'System Failover SLA Guarantee (99.99%)']
  }
];

const SUPPORTED_COUPONS: Record<string, { discount: number; description: string }> = {
  'STUDIO20': { discount: 20, description: '20% off lifetime access' },
  'PROD50': { discount: 50, description: '50% off select first month billing' },
  'FREEGLOBAL': { discount: 100, description: '100% free pilot program access' }
};

export default function PlansBilling({ addLog, activeTier, setActiveTier }: PlansBillingProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('annually');
  const [checkoutPlan, setCheckoutPlan] = useState<'Professional' | 'Enterprise' | 'CustomAI' | null>(null);
  const [setupFee, setSetupFee] = useState<number>(25000); // default middle setup fee of £25,000
  const [activeSupportTier, setActiveSupportTier] = useState<'none' | 'basic' | 'standard' | 'enterprise'>(() => {
    return (localStorage.getItem('secure_hr_active_support_tier') as any) || 'none';
  });
  const [selectedSupportTier, setSelectedSupportTier] = useState<'none' | 'basic' | 'standard' | 'enterprise'>('none');
  
  // Virtual Credit Card form states
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [employeeCount, setEmployeeCount] = useState('10-50');

  // Coupon configuration
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; description: string } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Payment simulated network steps
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'processing' | 'success'>('form');
  const [processingIndex, setProcessingIndex] = useState(0);
  const [paymentError, setPaymentError] = useState('');

  // Invoice Ledger State
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('secure_hr_invoices');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'INV-2026-001',
        date: '2026-05-10',
        amount: 0,
        amountGBP: 0,
        plan: 'Starter (Sandbox Free Setup)',
        status: 'Paid',
        transactionHash: 'tr_sec_995ba1a6ce80d8ebc18',
      }
    ];
  });

  const [activeReceipt, setActiveReceipt] = useState<Invoice | null>(null);

  // Sync invoices to storage
  useEffect(() => {
    localStorage.setItem('secure_hr_invoices', JSON.stringify(invoices));
  }, [invoices]);

  // Billing rates (in GBP)
  const pricing = {
    Starter: { monthly: 0, annually: 0 },
    Professional: { monthly: 120, annually: 95 },
    Enterprise: { monthly: 400, annually: 320 },
    CustomAI: { monthly: 25000, annually: 20000 }
  };

  const currentPrice = checkoutPlan 
    ? pricing[checkoutPlan][billingPeriod]
    : 0;

  const selectedSupportPlanConfig = SUPPORT_TIERS.find(t => t.key === selectedSupportTier) || SUPPORT_TIERS[0];
  
  const supportCost = selectedSupportTier !== 'none'
    ? (billingPeriod === 'annually'
      ? selectedSupportPlanConfig.priceGBP * 0.8
      : selectedSupportPlanConfig.priceGBP)
    : 0;

  // Setup fee only applies to CustomAI
  const activeSetupFee = checkoutPlan === 'CustomAI' ? setupFee : 0;

  const subtotal = currentPrice + supportCost + activeSetupFee;

  // Calculate discount
  const discountAmount = appliedCoupon 
    ? (subtotal * appliedCoupon.discount) / 100 
    : 0;
  
  const finalPrice = Math.max(0, subtotal - discountAmount);

  // Format card input numbers cleanly
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').substring(0, 16);
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(v);
    }
  };

  // Format credit card expiry code
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (v.length >= 2) {
      setCardExpiry(`${v.substring(0, 2)}/${v.substring(2, 4)}`);
    } else {
      setCardExpiry(v);
    }
  };

  // Action: Redeem Code Promo
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const typed = couponCode.trim().toUpperCase();
    if (!typed) return;

    if (SUPPORTED_COUPONS[typed]) {
      setAppliedCoupon({
        code: typed,
        discount: SUPPORTED_COUPONS[typed].discount,
        description: SUPPORTED_COUPONS[typed].description
      });
      addLog('Promo Coupon Redeemed', 'Modification', `Applied marketing coupon code: ${typed}. Status: Verified ${SUPPORTED_COUPONS[typed].discount}% off.`);
      setCouponCode('');
    } else {
      setCouponError('Invalid coupon code. Try STUDIO20 or PROD50');
      addLog('Promo Code Declined', 'Security', `Attempted invalid coupon verification lookup for code: ${typed}`);
    }
  };

  // Stepper descriptions
  const PROCESSING_LOGS = [
    'Handshaking TLS payload to secure edge database...',
    'Performing real-time card CVV and fraud parameters verify...',
    'Authenticating sandbox merchant billing token framework...',
    'Finalizing private tenant metadata configurations...',
    'Generating cryptographically signed compliance audit invoice...'
  ];

  const [isServerConnecting, setIsServerConnecting] = useState(false);

  // Action: Submit Payment Checkout
  const handleTriggerCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardHolder || cardNumber.length < 15 || !cardExpiry || cardCvv.length < 3) {
      setPaymentError('Please fill out all payment details with valid entries.');
      return;
    }

    setPaymentError('');
    setIsServerConnecting(true);
    addLog('Subscription Purchase Initiated', 'Modification', `User initiated PayPal upgrade request for ${checkoutPlan} plan (${billingPeriod})`);

    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName: checkoutPlan,
          billingPeriod: billingPeriod,
          supportTier: selectedSupportTier,
          priceGBP: finalPrice,
        }),
      });

      const data = await response.json();

      if (data.url) {
        addLog('PayPal Redirect Handshake', 'Modification', `Redirecting client to official secure PayPal Checkout portal.`);
        window.location.href = data.url;
        return;
      }

      // Falls back to simulator if PayPal credentials are left unset
      setCheckoutStep('processing');
      setProcessingIndex(0);

      let tick = 0;
      const interval = setInterval(() => {
        tick += 1;
        if (tick < PROCESSING_LOGS.length) {
          setProcessingIndex(tick);
        } else {
          clearInterval(interval);
          completeSubscriptionUpgrade();
        }
      }, 750);
    } catch (err: any) {
      console.error("PayPal initiation error:", err);
      setPaymentError(err.message || 'PayPal server handshake rejected.');
    } finally {
      setIsServerConnecting(false);
    }
  };

  const completeSubscriptionUpgrade = () => {
    if (!checkoutPlan) return;
    
    // Set upgraded tier status
    setActiveTier(checkoutPlan);
    setActiveSupportTier(selectedSupportTier);
    localStorage.setItem('secure_hr_active_support_tier', selectedSupportTier);
    
    // Add new generated subscription ledger invoice record
    const newInvoiceId = `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`;
    const txHash = 'tr_sec_' + Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);
    
    const supportLabel = selectedSupportTier !== 'none' ? ` + ${selectedSupportPlanConfig.name}` : '';
    
    const newInvoice: Invoice = {
      id: newInvoiceId,
      date: new Date().toISOString().split('T')[0],
      amount: finalPrice,
      plan: `${checkoutPlan === 'CustomAI' ? 'Bespoke Custom AI Deployment' : checkoutPlan + ' Tier Plan'}${supportLabel} (${billingPeriod === 'annually' ? 'Billed Annually' : 'Billed Monthly'})`,
      status: 'Paid',
      couponApplied: appliedCoupon ? appliedCoupon.code : undefined,
      transactionHash: txHash
    };

    setInvoices(prev => [newInvoice, ...prev]);
    setCheckoutStep('success');
    addLog('Subscription Finalized & Active', 'Security', `Upgraded tenant workspace to plan ${checkoutPlan} with support: ${selectedSupportPlanConfig.name} successfully (Transaction: ${newInvoiceId}). Charged: £${finalPrice}`);
  };

  const handleCancelSubscription = () => {
    if (confirm("Are you sure you want to cancel your prime subscription? This will lock pro tools instantly.")) {
      setActiveTier('Starter');
      setActiveSupportTier('none');
      localStorage.setItem('secure_hr_active_support_tier', 'none');
      setAppliedCoupon(null);
      setCheckoutPlan(null);
      addLog('Subscription Terminated', 'Security', 'User executed downgrade of service nodes back to Starter tier sandbox limitations.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100" id="plans-billing-module">
      {/* Visual Identity Hero */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 relative">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-indigo-300">Monetization & Plans Console</h2>
          </div>
          <p className="text-lg font-extrabold text-white tracking-tight">Professional Upgrades & Secure Billing Portal</p>
          <p className="text-xs text-slate-400 max-w-2xl">
            A secure PayPal-competitive sandbox subscription service layout. Manage workspace features, test discount codes, and view compliant invoices.
          </p>
        </div>

        {/* Current Roster Status Badges */}
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl shrink-0 flex flex-col justify-center items-stretch md:items-end font-sans min-w-[210px] space-y-2">
          <div>
            <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider block">Active Workspace Plan</span>
            <div className="flex items-center justify-between md:justify-end gap-2 mt-1">
              <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wide rounded ${
                activeTier === 'Starter' 
                ? 'bg-slate-800 text-slate-305'
                : activeTier === 'Professional'
                  ? 'bg-gradient-to-r from-blue-700 to-indigo-600 text-white shadow-xs'
                  : 'bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 shadow-xs font-bold'
              }`}>
                {activeTier}
              </span>
              {activeTier !== 'Starter' && (
                <button
                  onClick={handleCancelSubscription}
                  className="text-[10px] font-bold text-rose-405 hover:text-rose-350 transition-colors hover:underline cursor-pointer"
                >
                  Cancel Plan
                </button>
              )}
            </div>
          </div>

          <hr className="border-slate-850" />

          <div>
            <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider block">Technical Support SLA</span>
            {activeSupportTier !== 'none' ? (
              <div className="mt-1 flex flex-col md:items-end leading-normal">
                <span className="text-emerald-400 font-extrabold text-[11px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  {SUPPORT_TIERS.find(t => t.key === activeSupportTier)?.name}
                </span>
                <span className="text-[9px] text-slate-400 italic font-mono">
                  {SUPPORT_TIERS.find(t => t.key === activeSupportTier)?.sla}
                </span>
              </div>
            ) : (
              <div className="mt-0.5 text-[10px] text-slate-450 font-medium">Standard ticket queue response</div>
            )}
          </div>
          
          <div className="text-center md:text-right pt-0.5">
            <span className="text-[8px] text-slate-500">*Local persistence active in current browser thread*</span>
          </div>
        </div>
      </div>

      {checkoutPlan === null ? (
        <>
          {/* PLANS & CAPABILITIES SECTION */}
          <div className="space-y-4">
            
            {/* Toggle Switch Period Monthly/Annual */}
            <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded-lg border border-slate-850 max-w-md mx-auto">
              <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5 select-none">
                <Calendar className="w-4 h-4 text-slate-450" />
                Billing Schedule:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                    billingPeriod === 'monthly'
                    ? 'bg-slate-950 text-slate-200 border border-slate-850 font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Billed Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('annually')}
                  className={`px-3 py-1 rounded text-xs transition-colors flex items-center gap-2 cursor-pointer ${
                    billingPeriod === 'annually'
                    ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-900/50 font-extrabold'
                    : 'text-slate-505 hover:text-slate-300'
                  }`}
                >
                  Billed Annually
                  <span className="bg-emerald-950 text-emerald-300 font-bold text-[8px] uppercase tracking-wide px-1.5 py-0.2 rounded border border-emerald-900/30">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* STARTER CARD */}
              <div className={`bg-slate-900 rounded-xl border p-5 flex flex-col justify-between transition-all relative ${
                activeTier === 'Starter' ? 'border-indigo-600 ring-1 ring-indigo-900/30' : 'border-slate-800'
              }`}>
                {activeTier === 'Starter' && (
                  <div className="absolute top-2 right-2 bg-indigo-950 text-indigo-400 font-mono text-[9px] px-1.5 py-0.5 rounded font-black border border-indigo-900/60 uppercase">
                    Active Tier
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-500 uppercase">Sandbox Mode</span>
                    <h3 className="text-md font-bold text-white mt-1">Starter</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1.5">Best for developers doing standard setup verification, trials, or early test evaluation.</p>
                  </div>

                  <div className="py-2">
                    <div className="flex items-baseline gap-1 text-white">
                      <span className="text-2xl font-black font-mono">£0</span>
                      <span className="text-xs text-slate-505">/month</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Free forever fallback deployment tier</span>
                  </div>

                  <hr className="border-slate-850" />

                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>Roster directory database (Up to 10 records)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>Basic local resume matched scoring</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-500 line-through">
                      <Check className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                      <span>High-priority custom fine-tuned Gemini model templates</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-500 line-through">
                      <Check className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                      <span>Automated labor regulatory checklists</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-500 line-through">
                      <Check className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                      <span>Infinite Secure Assistant chats</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6">
                  <button
                    disabled={activeTier === 'Starter'}
                    onClick={() => setActiveTier('Starter')}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-850 text-slate-300 text-xs font-bold rounded-lg transition-colors border border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {activeTier === 'Starter' ? 'Current Active Base' : 'Downgrade to Free'}
                  </button>
                </div>
              </div>

              {/* PROFESSIONAL CARD (BEST VALUE) */}
              <div className={`bg-slate-900 rounded-xl border p-5 flex flex-col justify-between transition-all relative ${
                activeTier === 'Professional' ? 'border-blue-600 ring-1 ring-blue-900/40' : 'border-slate-800'
              }`}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-extrabold uppercase text-[9px] px-3 py-1 rounded-full shadow-md tracking-wider">
                  ★ MOST POPULAR ★
                </div>
                {activeTier === 'Professional' && (
                  <div className="absolute top-2 right-2 bg-blue-955 text-blue-400 font-mono text-[9px] px-1.5 py-0.5 rounded font-black border border-blue-900/60 uppercase">
                    Active Tier
                  </div>
                )}
                <div className="space-y-4">
                  <div className="pt-2">
                    <span className="text-xs font-mono font-bold text-indigo-350 uppercase">Individual Professional</span>
                    <h3 className="text-md font-bold text-white mt-1 flex items-center gap-1.5">
                      Professional
                      <Zap className="w-4 h-4 text-blue-400 fill-blue-405 animate-pulse" />
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1.5">Ideal for corporate recruiters, talent scouts, and HR generalists aiming to optimize workspace workflows.</p>
                  </div>

                  <div className="py-2">
                    <div className="flex items-baseline gap-1 text-white">
                      <span className="text-3xl font-black font-mono">
                        £{pricing.Professional[billingPeriod]}
                      </span>
                      <span className="text-xs text-slate-550">/month</span>
                    </div>
                    {billingPeriod === 'annually' && (
                      <span className="text-[10px] text-emerald-300 font-mono font-bold">Billed £1,140 annually (Save 20% applied)</span>
                    )}
                    {billingPeriod === 'monthly' && (
                      <span className="text-[10px] text-slate-500">Billed monthly recurring card channel</span>
                    )}
                  </div>

                  <hr className="border-slate-850" />

                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="font-semibold text-slate-100">Roster directory database (Unlimited records)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>✨ Premium Priority match scorecards</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>⚡ AI Smart Appraisal Drafter features</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>Custom corporate checklist builders</span>
                    </li>
                    <li className="flex items-center gap-2 font-semibold">
                      <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="text-indigo-300">Unlock Unlimited AI Assistant Prompt calls</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => {
                      setCheckoutPlan('Professional');
                      setCheckoutStep('form');
                    }}
                    className={`w-full py-2.5 rounded-lg text-xs font-black tracking-wide transition-all shadow-md cursor-pointer ${
                      activeTier === 'Professional'
                      ? 'bg-slate-950 text-slate-400 border border-slate-850 font-bold'
                      : 'bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white'
                    }`}
                  >
                    {activeTier === 'Professional' ? 'Active Subscription' : 'Upgrade Professional Sub'}
                  </button>
                </div>
              </div>

              {/* ENTERPRISE CARD */}
              <div className={`bg-slate-900 rounded-xl border p-5 flex flex-col justify-between transition-all relative ${
                activeTier === 'Enterprise' ? 'border-amber-600 ring-1 ring-amber-900/40' : 'border-slate-800'
              }`}>
                {activeTier === 'Enterprise' && (
                  <div className="absolute top-2 right-2 bg-amber-955 text-amber-400 font-mono text-[9px] px-1.5 py-0.5 rounded font-black border border-amber-900/60 uppercase">
                    Active Tier
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-500 uppercase">Multi-User Corporate</span>
                    <h3 className="text-md font-bold text-white mt-1 flex items-center gap-1.5">
                      Enterprise Suite
                      <Building className="w-4 h-4 text-amber-450" />
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1.5">Tailored specifically for international agencies, teams, and high volume staffing groups requiring full ledger history.</p>
                  </div>

                  <div className="py-2">
                    <div className="flex items-baseline gap-1 text-white">
                      <span className="text-3xl font-black font-mono">
                        £{pricing.Enterprise[billingPeriod]}
                      </span>
                      <span className="text-xs text-slate-550">/month</span>
                    </div>
                    {billingPeriod === 'annually' && (
                      <span className="text-[10px] text-emerald-300 font-mono font-bold">Billed £3,840 annually (Save 20% applied)</span>
                    )}
                    {billingPeriod === 'monthly' && (
                      <span className="text-[10px] text-slate-500">Billed monthly dedicated invoice cycle</span>
                    )}
                  </div>

                  <hr className="border-slate-850" />

                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-semibold text-slate-100">Everything in Professional pack</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Dedicated isolated private backend nodes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-amber-300 font-semibold">Enterprise Audit Compliance PDF exports</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Active database real-time multi-device synchronization</span>
                    </li>
                    <li className="flex items-center gap-2 font-semibold">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-indigo-300">SLA 100% network uptime assurance</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => {
                      setCheckoutPlan('Enterprise');
                      setCheckoutStep('form');
                    }}
                    className={`w-full py-2.5 rounded-lg text-xs font-black tracking-wide transition-all shadow-md cursor-pointer ${
                      activeTier === 'Enterprise'
                      ? 'bg-slate-950 text-slate-400 border border-slate-850 font-bold'
                      : 'bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-405 text-slate-950 font-bold'
                    }`}
                  >
                    {activeTier === 'Enterprise' ? 'Active Subscription' : 'Purchase Enterprise Suite'}
                  </button>
                </div>
              </div>

              {/* CUSTOM AI DEPLOYMENT CARD */}
              <div className={`bg-slate-900 rounded-xl border p-5 flex flex-col justify-between transition-all relative ${
                activeTier === 'CustomAI' ? 'border-emerald-500 ring-1 ring-emerald-900/40' : 'border-slate-800'
              }`}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-extrabold uppercase text-[9px] px-3 py-1 rounded-full shadow-md tracking-wider">
                  ★ BESPOKE DEPLOYMENT ★
                </div>
                {activeTier === 'CustomAI' && (
                  <div className="absolute top-2 right-2 bg-emerald-950 text-emerald-400 font-mono text-[9px] px-1.5 py-0.5 rounded font-black border border-emerald-900/60 uppercase">
                    Active Tier
                  </div>
                )}
                <div className="space-y-4">
                  <div className="pt-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase">On-Hardware Enclave</span>
                    <h3 className="text-md font-bold text-white mt-1 flex items-center gap-1.5 font-sans">
                      Custom AI Deployment
                      <Sparkles className="w-4 h-4 text-emerald-450 animate-pulse" />
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1.5">Highest level of privacy and local processing. Runs directly on corporate systems under company jurisdiction.</p>
                  </div>

                  <div className="py-2">
                    <div className="flex items-baseline gap-1 text-white opacity-95">
                      <span className="text-3xl font-black font-mono">
                        £{billingPeriod === 'annually' ? '20,000' : '25,000'}
                      </span>
                      <span className="text-xs text-slate-500">/month</span>
                    </div>
                    {billingPeriod === 'annually' ? (
                      <span className="text-[10px] text-emerald-300 font-mono font-bold block">Billed £240,000 annually (Save 20% applied)</span>
                    ) : (
                      <span className="text-[10px] text-slate-500 block">Billed monthly recurring card channel</span>
                    )}
                    <div className="text-[10px] text-emerald-450 font-mono font-semibold mt-1.5">
                      + £10,000 – £50,000 one-time setup fee
                    </div>
                  </div>

                  <hr className="border-slate-850" />

                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="font-semibold text-slate-100">Full AI system deployment</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="text-indigo-300 font-semibold">Unlimited internal users</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Continuous system optimisation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="text-amber-450 font-bold">Priority support response guarantee</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Custom workflows & audit templates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Monthly performance reporting</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => {
                      setCheckoutPlan('CustomAI');
                      setSetupFee(25000); // Reset setup fee to £25k defaults
                      setCheckoutStep('form');
                    }}
                    className={`w-full py-2.5 rounded-lg text-xs font-black tracking-wide transition-all shadow-md cursor-pointer ${
                      activeTier === 'CustomAI'
                      ? 'bg-slate-950 text-slate-400 border border-slate-850 font-bold'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold'
                    }`}
                  >
                    {activeTier === 'CustomAI' ? 'Active AI Deployment' : 'Configure AI Deployment'}
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* CORPORATE SERVICE SLA SUPPORT MODULE SECTION */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-6 mt-6" id="support-sla-catalog">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-xs font-mono font-black uppercase text-indigo-400">
                  <Headphones className="w-4 h-4 text-indigo-450 stroke-[2.5]" />
                  Secure Corporate Support SLA Packages
                </span>
                <h3 className="text-md font-extrabold text-white tracking-tight">Dedicated SLA Technical Support Options</h3>
                <p className="text-xs text-slate-400 max-w-3xl">
                  Align key technical response guarantees with your clinical or corporate operations. Choose from tiered service SLA response schedules.
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-2 font-sans">
                <span className="text-[10px] uppercase font-bold text-slate-500">Current active Support:</span>
                <span className="px-2.5 py-1 bg-indigo-950 border border-indigo-900 text-indigo-300 font-mono font-bold text-xs rounded uppercase">
                  {SUPPORT_TIERS.find(t => t.key === activeSupportTier)?.name || 'Standard SLA'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {SUPPORT_TIERS.filter(tier => tier.key !== 'none').map(tier => {
                const isActive = activeSupportTier === tier.key;
                const formattedGBP = `£${tier.priceGBP}/mo`;
                
                return (
                  <div 
                    key={tier.key} 
                    className={`p-5 rounded-xl border flex flex-col justify-between transition-all duration-300 relative ${
                      isActive 
                        ? 'bg-slate-950 border-indigo-500 shadow-md ring-1 ring-indigo-950/40' 
                        : 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5 leading-none">
                            {tier.name}
                            {isActive && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            )}
                          </h4>
                          <span className="text-[8px] uppercase font-mono font-extrabold tracking-wide text-indigo-400 bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-900/60 block mt-2 text-center w-max">
                            {tier.sla}
                          </span>
                        </div>
                        <div className="text-right leading-none flex flex-col items-end">
                          <span className="text-sm font-black font-mono text-emerald-400 block">{formattedGBP}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed min-h-[33px] pt-1">{tier.description}</p>
                      
                      <hr className="border-slate-900" />
                      
                      <ul className="space-y-1.5 font-sans">
                        {tier.channels.map((chan, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-350">
                            <span className="w-1 h-1 rounded-full bg-indigo-500 shrink-0" />
                            <span className="truncate">{chan}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-5">
                      {isActive ? (
                        <div className="w-full text-center py-1.5 bg-indigo-950 text-indigo-400 text-[10px] font-bold rounded-lg border border-indigo-900 select-none">
                          ✓ Currently Subscribed SLA
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedSupportTier(tier.key);
                            // Pre-fill active system tier as base or professional
                            setCheckoutPlan(activeTier === 'Starter' ? 'Professional' : activeTier);
                            setCheckoutStep('form');
                          }}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] uppercase font-black tracking-wide rounded-lg transition-colors cursor-pointer text-center block"
                        >
                          Select Support Package
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <hr className="border-slate-900" />

          {/* SIMULATED BILLING INVOICES LEDGER INDEX */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 font-sans space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Your Active Invoice & Receipts Ledger
                </h3>
                <p className="text-[10px] text-slate-450">Private paper trail archive of localized sandbox subscription transactions.</p>
              </div>
              <span className="text-[9px] font-mono bg-slate-950 border border-slate-800 px-2 py-1 rounded text-slate-450">
                {invoices.length} Registered Transaction records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-500 text-[10px] uppercase font-mono tracking-wider">
                    <th className="py-2 pl-2">Invoice Code</th>
                    <th className="py-2">Date Triggered</th>
                    <th className="py-2">Subscription Scope</th>
                    <th className="py-2">Amount Paid</th>
                    <th className="py-2">Processing Gate Status</th>
                    <th className="py-2 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-xs">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-950/30 transition-colors">
                      <td className="py-3 pl-2 font-mono font-bold text-slate-300">{inv.id}</td>
                      <td className="py-3 text-slate-400">{inv.date}</td>
                      <td className="py-3 font-semibold text-slate-200">{inv.plan}</td>
                      <td className="py-3 font-mono font-bold text-white leading-normal">
                        {inv.amount === 0 ? (
                          <span className="text-emerald-400 font-sans">FREE TRIAL</span>
                        ) : (
                          <span className="font-mono">£{inv.amount.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.2 bg-emerald-950/40 text-emerald-300 rounded font-mono font-bold uppercase border border-emerald-950">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 text-right pr-2">
                        <button
                          onClick={() => setActiveReceipt(inv)}
                          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer ml-auto"
                        >
                          <Download className="w-3 h-3" />
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* ACTIVE MULTI-STEP UPGRADE CHECKOUT INTERACTIVE OVERLAY PANEL */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-scale-up" id="sub-billing-checkout-portal">
          
          {/* Back button link */}
          <div className="lg:col-span-12">
            <button
              onClick={() => {
                setCheckoutPlan(null);
                setAppliedCoupon(null);
                setCheckoutStep('form');
              }}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Catalog & Plan Pricing Grid
            </button>
          </div>

          {/* Stepper Side Column Form (7-cols) */}
          <div className="lg:col-span-7 bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-5 font-sans">
            
            {checkoutStep === 'form' && (
              <form onSubmit={handleTriggerCheckout} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-indigo-400" />
                      Configure Subscription Checkout
                    </h3>
                    <p className="text-[10px] text-slate-400">Secure AES-256 local testing terminal processing flow</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-900/40 animate-pulse">
                      {checkoutPlan === 'CustomAI' ? 'Bespoke Custom AI' : checkoutPlan} Plan Checkout
                    </span>
                    <button
                      type="button"
                      id="btn-auto-fill-card"
                      onClick={() => {
                        setCardHolder('Alex Morgan');
                        setCardNumber('4111 2222 3333 4444');
                        setCardExpiry('12/28');
                        setCardCvv('982');
                        setBusinessName('Sovereign Labs Corp');
                      }}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer font-mono font-bold"
                    >
                      ⚡ Auto-Fill Demo Card
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase font-bold text-slate-450">Business Target Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Studio corp"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-850 rounded text-xs text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase font-bold text-slate-450">Staffing Deployment Scale</label>
                    <select
                      value={employeeCount}
                      onChange={(e) => setEmployeeCount(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-850 rounded text-xs text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="1-9">1-9 Active Employees</option>
                      <option value="10-50">10-50 Active Employees</option>
                      <option value="51-200">51-200 Active Employees</option>
                      <option value="200+">200+ Corporate Enterprise</option>
                    </select>
                  </div>
                </div>

                {checkoutPlan === 'CustomAI' && (
                  <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-850 space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] uppercase font-bold text-emerald-400">One-time Deployment & Custom SLA Setup Fee</label>
                      <span className="font-mono font-black text-white text-xs px-2.5 py-0.5 rounded bg-emerald-950/50 border border-emerald-900/40">£{setupFee.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Under agreed contract terms, select the designated one-time system deployment, offline encryption setup, and staff onboarding calibration fee (£10,000 to £50,000).
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-500 font-mono font-bold">£10k</span>
                      <input
                        type="range"
                        min="10000"
                        max="50000"
                        step="5000"
                        value={setupFee}
                        onChange={(e) => setSetupFee(parseInt(e.target.value))}
                        className="flex-1 accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                      />
                      <span className="text-[10px] text-slate-500 font-mono font-bold">£50k</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                      <span>Minimum Standard Setup: £10,000</span>
                      <span>Maximum Multi-Site Setup: £50,000</span>
                    </div>
                  </div>
                )}

                {/* Select Corporate Support Level Add-On Option */}
                <div className="space-y-2.5 p-3.5 bg-slate-950/40 border border-slate-850 rounded-lg">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-350 uppercase select-none">
                    <Headphones className="w-3.5 h-3.5 text-indigo-450 stroke-[2]" />
                    Corporate SLA Support Service Level Upgrade
                  </div>
                  <p className="text-[10px] text-slate-450 leading-tight">
                    Add custom operations engineers, response schedule guidelines, and round-the-clock hotline monitors directly to this checkout subscription.
                  </p>
                  <div className="grid grid-cols-1 gap-2 pt-1 font-sans">
                    {SUPPORT_TIERS.map((tier) => {
                      const isSel = selectedSupportTier === tier.key;
                      const displayPrice = billingPeriod === 'annually' 
                        ? `${tier.priceGBP === 0 ? 'No Charge' : `£${Math.round(tier.priceGBP * 0.8)}/mo`} (Save 20%)`
                        : `${tier.priceGBP === 0 ? 'None' : `£${tier.priceGBP}/mo`}`;

                      return (
                        <label 
                          key={tier.key}
                          className={`flex items-start justify-between p-2.5 rounded-lg border cursor-pointer transition-colors text-xs select-none ${
                            isSel 
                              ? 'bg-indigo-950/30 border-indigo-500 text-slate-105 ring-1 ring-indigo-950' 
                              : 'bg-slate-950/65 border-slate-850 text-slate-400 hover:bg-slate-950'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <input 
                              type="radio" 
                              name="checkout-support"
                              checked={isSel}
                              onChange={() => setSelectedSupportTier(tier.key)}
                              className="mt-0.5 accent-indigo-500 cursor-pointer"
                            />
                            <div>
                              <div className="font-bold flex items-center gap-1.5 leading-none text-slate-200">
                                {tier.name}
                                {tier.key !== 'none' && (
                                  <span className="text-[7px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-900/60 px-1 py-0.2 rounded uppercase font-black">
                                    {tier.sla}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-450 mt-1">{tier.description}</p>
                            </div>
                          </div>
                          <span className="font-mono font-black text-emerald-400 shrink-0 pl-2">
                            {displayPrice}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Secure virtual credit card input entries */}
                <div className="space-y-3 p-3 bg-slate-950/40 border border-slate-850 rounded-lg">
                  <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                    <Lock className="w-3.5 h-3.5 text-indigo-400" />
                    Simulated Ledger Card Authorization
                  </p>
                  
                  <div className="space-y-2 pt-1">
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase font-bold text-slate-500">Cardholder Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-855 rounded text-xs text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase font-bold text-slate-500">Credit Card Number</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="4111 2222 3333 4444"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          className="w-full pl-8 pr-2.5 py-1.5 bg-slate-950 border border-slate-855 rounded text-xs text-slate-200 font-mono outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <CreditCard className="w-3.5 h-3.5 text-slate-550 absolute left-2.5 top-2.5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[9px] uppercase font-bold text-slate-500">Exp Date (MM/YY)</label>
                        <input
                          type="text"
                          required
                          placeholder="12/29"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-855 rounded text-xs text-slate-205 font-mono outline-none focus:ring-1 focus:ring-indigo-505"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[9px] uppercase font-bold text-slate-500">Security Code CVV</label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-855 rounded text-xs text-slate-205 font-mono outline-none focus:ring-1 focus:ring-indigo-505 animate-pulse"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {paymentError && (
                  <p className="text-[10px] text-rose-450 font-bold bg-rose-950/20 px-2 py-1 border border-rose-900/30 rounded">{paymentError}</p>
                )}

                <button
                  type="submit"
                  disabled={isServerConnecting}
                  className={`w-full py-2.5 text-xs font-black tracking-wide uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    checkoutPlan === 'Enterprise'
                    ? 'bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-405 text-slate-950'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isServerConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-current" />
                      Contacting Gateway Handshake...
                    </>
                  ) : (
                    `Confirm Secure Payment Authorization • £${finalPrice.toLocaleString()} ${billingPeriod === 'annually' ? 'yr' : 'mo'}`
                  )}
                </button>
              </form>
            )}

            {checkoutStep === 'processing' && (
              <div className="space-y-6 py-6 text-center font-sans">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                  <h4 className="text-sm font-semibold text-white">Handshaking Merchant Authorization...</h4>
                  <p className="text-[10px] text-slate-450">PayPal Sandbox Connection Layer Dispatch</p>
                </div>

                {/* Simulated Server Stepper Progression Logs */}
                <div className="max-w-md mx-auto p-4 bg-slate-950 border border-slate-850 rounded-lg text-left space-y-2.5">
                  {PROCESSING_LOGS.map((log, lIdx) => {
                    const status = lIdx < processingIndex 
                      ? 'completed' 
                      : lIdx === processingIndex 
                        ? 'active' 
                        : 'pending';
                    
                    return (
                      <div key={lIdx} className="flex items-center justify-between text-[11px] font-mono transition-opacity duration-300">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            status === 'completed' 
                            ? 'bg-emerald-500' 
                            : status === 'active' 
                              ? 'bg-indigo-400 animate-pulse' 
                              : 'bg-slate-700'
                          }`} />
                          <span className={`${
                            status === 'completed' 
                            ? 'text-slate-400 line-through decoration-indigo-900/40' 
                            : status === 'active' 
                              ? 'text-white font-bold' 
                              : 'text-slate-550'
                          }`}>
                            {log}
                          </span>
                        </div>
                        <span className={`text-[9px] uppercase font-bold ${
                          status === 'completed' 
                          ? 'text-emerald-400 font-bold' 
                          : status === 'active' 
                            ? 'text-indigo-300 animate-ping' 
                            : 'text-slate-550'
                        }`}>
                          {status === 'completed' ? '[OK]' : status === 'active' ? '[WIP]' : '[WAIT]'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {checkoutStep === 'success' && (
              <div className="space-y-5 py-6 text-center font-sans">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-950/50 border border-emerald-900/40 text-emerald-400 flex items-center justify-center animate-scale-up">
                  <Check className="w-6 h-6" />
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-md font-extrabold text-white">Subscription Active!</h4>
                  <p className="text-xs text-slate-350 px-6">
                    Congratulations! Your workspace is upgraded directly to <span className="text-indigo-400 font-bold">{checkoutPlan === 'CustomAI' ? 'Bespoke Custom AI Deployment' : checkoutPlan}</span>. Fully featured compliant elements are unlocked.
                  </p>
                </div>

                <div className="p-4 bg-slate-950 border border-emerald-950/30 rounded-xl max-w-sm mx-auto space-y-2.5 text-xs text-slate-300">
                  <div className="flex justify-between border-b border-slate-850 pb-2">
                    <span className="text-slate-500">Authorization Code</span>
                    <span className="font-mono text-[10px] text-slate-200">AUTH-{Math.random().toString(36).substring(4, 9).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-850 pb-2">
                    <span className="text-slate-500">Billed Premium Level</span>
                    <span className="font-black text-white">{checkoutPlan === 'CustomAI' ? 'Bespoke Custom AI Deployment' : checkoutPlan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Charge Total</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      £{finalPrice.toLocaleString()} {billingPeriod === 'annually' ? 'yr' : 'mo'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCheckoutPlan(null);
                    setAppliedCoupon(null);
                    setCheckoutStep('form');
                  }}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer select-none"
                >
                  Return to Plans Dashboard
                </button>
              </div>
            )}

          </div>

          {/* Checkout Right Side Basket Panel (5-cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Elegant Virtual Credit Card Graphic Element */}
            <div className={`rounded-2xl p-5 text-white shadow-lg relative overflow-hidden flex flex-col justify-between h-44 font-mono select-none ${
              checkoutPlan === 'Enterprise'
              ? 'bg-gradient-to-br from-slate-950 via-amber-950/50 to-slate-900 border border-amber-900/30'
              : 'bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 border border-blue-900/40'
            }`}>
              {/* Card glossy circular overlays */}
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
              <div className="absolute left-1/3 bottom-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />

              <div className="flex justify-between items-start z-10">
                <div>
                  <div className="text-[10px] font-sans font-black text-slate-400 uppercase tracking-widest">
                    {checkoutPlan === 'Enterprise' ? 'Enterprise Gold Vault' : 'Studio Premium Card'}
                  </div>
                  <div className="text-[8px] text-slate-500">AES-256 SANDBOX INTENT</div>
                </div>
                <div className="w-10 h-7 bg-white/10 rounded border border-white/20 flex items-center justify-center text-[10px] text-slate-300 font-bold font-sans">
                  PROD
                </div>
              </div>

              {/* Card chip and NFC signals */}
              <div className="flex items-center gap-3 z-10">
                <div className="w-8 h-6 bg-amber-500/20 border border-amber-500/40 rounded-sm" />
                <div className="flex flex-col leading-none">
                  <span className="text-[7px] text-slate-300">SECURE LOCAL CONNECTION</span>
                  <span className="text-[8px] font-bold text-slate-100">AUTHORIZED MEMORY BLOCK</span>
                </div>
              </div>

              <div className="space-y-1 z-10">
                <div className="text-sm font-bold tracking-widest text-slate-200">
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>
                <div className="flex justify-between text-[9px] uppercase tracking-wider text-slate-400 font-sans">
                  <span className="truncate max-w-[130px]">{cardHolder || 'CARDHOLDER NAME'}</span>
                  <span>EXP: {cardExpiry || 'MM/YY'}</span>
                </div>
              </div>
            </div>

            {/* Shopping Cart breakdown and discount codes */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-4 font-sans">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 animate-pulse">Order Bill Breakdown</h4>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-850 pb-1.5 mb-1.5 select-none">
                  <span className="text-slate-405 font-semibold text-[10px] uppercase">Service Level Agreement</span>
                  <span className="text-[8px] font-mono font-bold bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded uppercase">
                    Billed in GBP (£)
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">
                    {checkoutPlan === 'CustomAI' ? 'Bespoke Custom AI Deployment' : checkoutPlan + ' Platform Plan'} ({billingPeriod === 'annually' ? 'Annual' : 'Monthly'})
                  </span>
                  <span className="font-bold font-mono text-white text-[11px]">£{currentPrice.toLocaleString()}</span>
                </div>

                {checkoutPlan === 'CustomAI' && (
                  <div className="flex justify-between border-t border-slate-855/50 pt-2 text-emerald-400">
                    <div className="text-left">
                      <span className="block font-semibold select-none">One-Time AI Deployment Setup Fee</span>
                      <span className="text-[9px] font-mono text-emerald-500 uppercase font-extrabold">Hardware Calibration & Enclave Setup</span>
                    </div>
                    <span className="font-bold font-mono text-[11px]">£{setupFee.toLocaleString()}</span>
                  </div>
                )}

                {selectedSupportTier !== 'none' && (
                  <div className="flex justify-between border-t border-slate-855/50 pt-2">
                    <div className="text-left">
                      <span className="text-slate-400 block">{selectedSupportPlanConfig.name} Add-On</span>
                      <span className="text-[9px] font-mono text-indigo-400 uppercase font-extrabold">{selectedSupportPlanConfig.sla}</span>
                    </div>
                    <span className="font-bold font-mono text-emerald-400 text-[11px]">£{Math.round(supportCost).toLocaleString()}</span>
                  </div>
                )}

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-450 bg-emerald-950/20 px-2.5 py-1 rounded-md border border-emerald-900/30">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      Promo Code ({appliedCoupon.code}) Applied:
                    </span>
                    <span className="font-mono font-bold">-{appliedCoupon.discount}%</span>
                  </div>
                )}

                <hr className="border-slate-850" />

                <div className="flex justify-between text-sm pt-1">
                  <span className="font-bold text-slate-350">Total Charged Today:</span>
                  <div className="text-right">
                    <div className="font-mono font-black text-white text-md">
                      £{finalPrice.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-slate-550 mt-1">Recurring billing cycle active</div>
                  </div>
                </div>
              </div>

              <hr className="border-slate-850" />

              {/* Promo code redeemer form */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-slate-450">Promo Code Discount Coupon</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Code (e.g. STUDIO20)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-850 focus:border-slate-800 text-xs rounded text-white outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 bg-slate-955 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded font-semibold text-xs cursor-pointer"
                  >
                    Redeem
                  </button>
                </div>
                {couponError && (
                  <p className="text-[9px] text-rose-405 font-medium">{couponError}</p>
                )}
                <div className="bg-slate-950 p-2 rounded text-[9px] text-slate-450 leading-relaxed font-sans space-y-0.5">
                  <div className="font-semibold text-slate-400">Available sandbox demo discount codes:</div>
                  <div>• <span className="font-mono font-bold text-slate-300">STUDIO20</span> to get 20% off plans lifecycle</div>
                  <div>• <span className="font-mono font-bold text-slate-300">PROD50</span> to secure 50% discount</div>
                  <div>• <span className="font-mono font-bold text-slate-300">FREEGLOBAL</span> to simulate 100% free pilot program access</div>
                </div>
              </form>

            </div>

          </div>

        </div>
      )}

      {/* DETAILED PDF INVOICE RECEIPT MODAL LIGHTBOX OVERLAY */}
      {activeReceipt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans select-none animate-fade-in" id="receipt-modal-lightbox">
          <div className="bg-slate-900 rounded-2xl border border-slate-805 max-w-lg w-full p-5 space-y-4 shadow-xl select-text relative">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-mono font-bold text-slate-300">TRANSACTION RECORD</span>
              </div>
              <button
                onClick={() => setActiveReceipt(null)}
                className="text-slate-500 hover:text-white text-xs p-1 cursor-pointer select-none font-sans font-bold"
              >
                ✕ Close
              </button>
            </div>

            {/* Printable Area Graphic Receipt */}
            <div className="p-5 bg-white text-slate-900 rounded-xl space-y-4 font-sans border border-slate-300 shadow-inner select-text" id="invoice-printable-node">
              
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-md font-extrabold tracking-tight text-slate-950">STUDIOBUILDAI Rec</h3>
                  <p className="text-[10px] text-slate-550">Edge Sandbox payment terminal engine</p>
                  <p className="text-[10px] text-slate-550">Client-Side Private Secure Node</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] tracking-wide font-mono font-black uppercase rounded border border-emerald-300 select-none">
                    PAID IN FULL
                  </span>
                  <div className="text-[11px] font-mono font-bold text-slate-500 mt-2">{activeReceipt.id}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <span className="block text-[9px] uppercase font-bold text-slate-500 font-sans">Payment Channel</span>
                  <span className="font-semibold text-slate-800">PayPal Sandbox Secure Node</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-bold text-slate-500 font-sans">Invoice Date</span>
                  <span className="font-mono font-semibold text-slate-800">{activeReceipt.date}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-[9px] uppercase font-bold text-slate-500 font-sans">Private Cryptographical Receipt Authorization</span>
                  <span className="font-mono text-[9px] text-indigo-805 select-all whitespace-pre-wrap leading-tight break-all">
                    {activeReceipt.transactionHash}
                  </span>
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Items Breakdown List */}
              <div className="space-y-2 text-xs pt-1">
                <div className="flex justify-between font-extrabold text-slate-900">
                  <span>Target Service Line Item</span>
                  <span>Amount Due</span>
                </div>

                <div className="flex justify-between text-slate-700">
                  <div>
                    <span className="font-medium text-slate-950 block">{activeReceipt.plan}</span>
                    <span className="text-[9px] text-slate-550 block leading-tight">Full access workspace tier nodes synchronized</span>
                  </div>
                  <span className="font-mono">£{activeReceipt.amount.toLocaleString()}</span>
                </div>

                {activeReceipt.couponApplied && (
                  <div className="flex justify-between text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100 font-medium">
                    <span>Discount Coupon ({activeReceipt.couponApplied})</span>
                    <span>Redeemed OK</span>
                  </div>
                )}

                <hr className="border-slate-200 mt-1" />

                <div className="flex justify-between text-xs pt-2">
                  <span className="font-extrabold text-slate-600 uppercase font-sans tracking-wider">Net Charged Today (GBP £):</span>
                  <span className="font-mono font-extrabold text-md text-slate-950 font-bold text-slate-900">
                    {activeReceipt.amount === 0 ? 'FREE PILOT COMPLIMENTARY' : `£${activeReceipt.amount.toLocaleString()}`}
                  </span>
                </div>
              </div>

              <p className="text-[9px] text-slate-500 text-center uppercase tracking-wider font-semibold font-mono pt-4 leading-relaxed">
                Thank you for supporting private-first enterprise operations with STUDIOBUILDAI
              </p>

            </div>

            <div className="flex justify-between gap-3 pt-2">
              <button
                onClick={() => {
                  window.print();
                  addLog('Printed PDF Receipt', 'Data Access', `dispatched receipt ${activeReceipt.id} printing pipeline successfully.`);
                }}
                className="flex-1 py-1.5 bg-slate-955 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-xs rounded border border-slate-800 hover:border-slate-705 flex items-center justify-center gap-1.5 cursor-pointer selection:none"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF/Print Rec
              </button>
              <button
                onClick={() => setActiveReceipt(null)}
                className="px-4 py-1.5 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-slate-100 font-semibold text-xs rounded border border-slate-855 cursor-pointer"
              >
                Dismiss Modal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
