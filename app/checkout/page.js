'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, ArrowRight, Shield, Lock } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { BRAND } from '@/lib/tokens';
import { useCurrentUser } from '@/lib/useCurrentUser';
import { api } from '@/lib/api';

const PLANS = {
  premium: {
    name: 'Premium',
    monthly: '4.99',
    yearly: '59.88',
    features: ['Unlimited memories', 'AI Biography generator', 'Unlimited capsules', 'Family Vault (3 members)'],
  },
  family: {
    name: 'Family',
    monthly: '14.99',
    yearly: '179.88',
    features: ['Everything in Premium', 'Unlimited members', 'Digital Personality AI', 'Unlimited Family Vault'],
  },
};

function CheckoutInner() {
  const router = useRouter();
  const params = useSearchParams();
  const planId = params.get('plan');
  const reference = params.get('transaction_id');
  const urlInterval = params.get('interval') === 'yearly' ? 'yearly' : 'monthly';
  const { T } = useTheme();
  const { firstName } = useCurrentUser();
  const [interval, setInterval] = useState(urlInterval);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const plan = PLANS[planId];

  // If Flutterwave redirected back with a transaction_id, verify it.
  useEffect(() => {
    if (!reference) return;
    setVerifying(true);
    api.flutterwaveVerify(reference)
      .then(() => { router.push('/dashboard?upgraded=1'); })
      .catch((e) => { setError(e.message || 'Payment verification failed.'); setVerifying(false); });
  }, [reference, router]);

  const startPayment = async () => {
    setProcessing(true);
    setError('');
    try {
      const { link } = await api.flutterwaveInit(planId, interval);
      window.location.href = link;
    } catch (e) {
      setError(e.message || 'Could not start payment.');
      setProcessing(false);
    }
  };

  if (!plan) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: T.text, marginBottom: 16 }}>No plan selected.</p>
          <button onClick={() => router.push('/dashboard')} style={{ background: BRAND.green, border: 'none', borderRadius: 12, padding: '12px 24px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Go to dashboard</button>
        </div>
      </div>
    );
  }

  if (verifying) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: T.bg, gap: 16 }}>
        <div style={{ width: 44, height: 44, border: `3px solid ${T.border}`, borderTopColor: BRAND.green, borderRadius: '50%', animation: 'spin .8s linear infinite' }}/>
        <p style={{ fontSize: 15, color: T.text, fontWeight: 600 }}>Confirming your payment…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const price = interval === 'yearly' ? plan.yearly : plan.monthly;
  const period = interval === 'yearly' ? '/year' : '/month';

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 460, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 24, padding: 36, boxShadow: '0 16px 48px rgba(0,0,0,0.08)' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: BRAND.green, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Almost done</p>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: T.text, marginBottom: 6, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          Welcome{firstName ? `, ${firstName}` : ''}!
        </h1>
        <p style={{ fontSize: 14, color: T.textMut, marginBottom: 24, lineHeight: 1.6 }}>
          Complete your payment to activate your <strong style={{ color: T.text }}>{plan.name}</strong> subscription.
        </p>

        {/* Billing period toggle */}
        <div style={{ display: 'flex', background: T.surface2, borderRadius: 12, padding: 4, marginBottom: 20 }}>
          {['monthly', 'yearly'].map((opt) => (
            <button key={opt} onClick={() => setInterval(opt)}
              style={{ flex: 1, padding: '9px 0', borderRadius: 9, border: 'none', background: interval === opt ? T.surface : 'transparent', color: interval === opt ? T.text : T.textMut, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: interval === opt ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', textTransform: 'capitalize', transition: 'all .15s' }}>
              {opt}{opt === 'yearly' ? ' ' : ''}
            </button>
          ))}
        </div>

        <div style={{ background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{plan.name} Plan</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: T.text }}>${price}<span style={{ fontSize: 13, color: T.textMut, fontWeight: 500 }}>{period}</span></span>
          </div>
          {plan.features.map((f) => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
              <Check size={14} color={BRAND.green} strokeWidth={3}/>
              <span style={{ fontSize: 13, color: T.textSub }}>{f}</span>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ background: 'rgba(255,80,80,0.08)', border: '1.5px solid rgba(255,80,80,0.25)', borderRadius: 12, padding: '11px 14px', marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: '#FF5050', fontWeight: 500 }}>{error}</p>
          </div>
        )}

        <button onClick={startPayment} disabled={processing} style={{ width: '100%', background: `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})`, border: 'none', borderRadius: 12, padding: 15, fontSize: 15, fontWeight: 700, color: '#fff', cursor: processing ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, boxShadow: '0 4px 16px rgba(74,186,139,0.35)', fontFamily: "'Plus Jakarta Sans',sans-serif", opacity: processing ? 0.8 : 1 }}>
          {processing ? 'Redirecting…' : <>Proceed to Payment <ArrowRight size={16}/></>}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 18 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: T.textMut }}><Shield size={12} color={BRAND.green}/> Secure</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: T.textMut }}><Lock size={12} color={BRAND.green}/> Encrypted</span>
        </div>

        <button onClick={() => router.push('/dashboard')} style={{ width: '100%', background: 'none', border: 'none', color: T.textMut, fontSize: 13, marginTop: 16, cursor: 'pointer', fontWeight: 500 }}>
          Skip for now
        </button>
      </div>
    </div>
  );
}

export default function Checkout() {
  return (
    <Suspense fallback={null}>
      <CheckoutInner />
    </Suspense>
  );
}