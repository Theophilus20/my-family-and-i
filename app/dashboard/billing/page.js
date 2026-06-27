'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Zap, AlertTriangle, CreditCard, RefreshCw } from 'lucide-react';
import FadeIn from '@/components/FadeIn';
import { useTheme } from '@/context/ThemeContext';
import { BRAND } from '@/lib/tokens';
import { useCurrentUser } from '@/lib/useCurrentUser';
import { api } from '@/lib/api';
import { SkeletonBox } from '@/components/Skeleton';

const PLANS = [
  { id: 'free',    name: 'Free',    monthly: '0',     yearly: '0',      color: '#888',      features: ['1 GB storage', '30 memories', 'Basic timeline', '1 future capsule'] },
  { id: 'premium', name: 'Premium', monthly: '4.99',  yearly: '59.88',  color: BRAND.green, features: ['Unlimited memories', 'AI Biography generator', 'Unlimited capsules', 'Wisdom Engine', 'Family Vault (3 members)'] },
  { id: 'family',  name: 'Family',  monthly: '14.99', yearly: '179.88', color: BRAND.lav,   features: ['Everything in Premium', 'Unlimited members', 'Digital Personality AI', 'Unlimited Family Vault'] },
];
const PLAN_RANK = { free: 0, premium: 1, family: 2 };

const hover = {
  onMouseEnter: (e) => { e.currentTarget.style.filter = 'brightness(0.9)'; },
  onMouseLeave: (e) => { e.currentTarget.style.filter = 'brightness(1)'; },
};

function fmtDate(d) {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); }
  catch { return ''; }
}

export default function Billing() {
  const { T } = useTheme();
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();

  const [current, setCurrent] = useState('free');
  const [interval, setIntervalState] = useState('monthly');
  const [status, setStatus] = useState('active');
  const [periodEnd, setPeriodEnd] = useState(null);
  const [scheduled, setScheduled] = useState(null);
  const [showCancel, setShowCancel] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!user) return;
    if (user.plan) setCurrent(user.plan);
    if (user.billing_interval) setIntervalState(user.billing_interval);
    setStatus(user.subscription_status || 'active');
    setPeriodEnd(user.current_period_end || null);
    setScheduled(user.scheduled_plan || null);
  }, [user]);

  // Any change TO a paid plan (upgrade, downgrade to paid, cycle switch) → checkout.
  const goToCheckout = (planId, cycle) => {
    router.push(`/checkout?plan=${planId}&interval=${cycle || interval}`);
  };

  const handleCancel = async () => {
    setBusy(true);
    try {
      const r = await api.cancelSubscription();
      setStatus('cancelling');
      if (r.current_period_end) setPeriodEnd(r.current_period_end);
      setScheduled(null);
      setNotice(`Your plan will stay active until ${fmtDate(r.current_period_end)}, then move to Free. You won't be charged again.`);
    } catch (e) {
      setNotice(e.message || 'Could not cancel.');
    } finally {
      setBusy(false);
      setShowCancel(false);
    }
  };

  const handleDowngrade = async (planId) => {
    if (planId === 'free') { setShowCancel(true); return; }
    setBusy(true);
    try {
      const r = await api.scheduleDowngrade(planId);
      setScheduled(planId);
      if (r.current_period_end) setPeriodEnd(r.current_period_end);
      setNotice(`You'll keep your current plan until ${fmtDate(r.current_period_end)}, then move to ${PLANS.find((p) => p.id === planId)?.name}.`);
    } catch (e) {
      setNotice(e.message || 'Could not schedule downgrade.');
    } finally {
      setBusy(false);
    }
  };

  if (userLoading) {
    return (
      <div>
        <SkeletonBox width={260} height={28} radius={8} />
        <div style={{ height: 16 }} />
        <SkeletonBox height={120} radius={20} />
        <div style={{ height: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
          {[0, 1, 2].map((i) => <SkeletonBox key={i} height={200} radius={20} />)}
        </div>
      </div>
    );
  }

  const currentPlan = PLANS.find((p) => p.id === current);
  const currentPrice = current === 'free' ? '0' : (interval === 'yearly' ? currentPlan?.yearly : currentPlan?.monthly);
  const isCancelling = status === 'cancelling' && current !== 'free';
  const isPaid = current !== 'free';
  const otherCycle = interval === 'yearly' ? 'monthly' : 'yearly';

  return (
    <div>
      <FadeIn>
        <h2 style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: 800, color: T.text, marginBottom: 4, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Subscription &amp; Billing</h2>
        <p style={{ fontSize: 14, color: T.textMut, marginBottom: 32, fontWeight: 500 }}>Manage your plan, payment, and billing preferences</p>
      </FadeIn>

      <FadeIn delay={60}>
        <div style={{ background: `linear-gradient(135deg,${BRAND.greenD},#0F2820)`, borderRadius: 20, padding: '28px 28px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Current plan</p>
            <h3 style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 4 }}>
              {currentPlan?.name} Plan
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
              {current === 'free'
                ? 'Free forever'
                : isCancelling
                  ? `Active until ${fmtDate(periodEnd)} · then Free`
                  : scheduled
                    ? `Active until ${fmtDate(periodEnd)} · then ${PLANS.find((p) => p.id === scheduled)?.name}`
                    : `$${currentPrice} per ${interval === 'yearly' ? 'year' : 'month'}${periodEnd ? ` · renews ${fmtDate(periodEnd)}` : ''}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {isPaid && !isCancelling && (
              <button onClick={() => setShowCancel(true)} {...hover} style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', transition: 'opacity .15s', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                Cancel plan
              </button>
            )}
          </div>
        </div>
      </FadeIn>

      {notice && (
        <FadeIn>
          <div style={{ background: `${BRAND.green}0F`, border: `1.5px solid ${BRAND.green}33`, borderRadius: 14, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Check size={16} color={BRAND.green}/>
            <p style={{ fontSize: 13, color: T.textSub, fontWeight: 500 }}>{notice}</p>
          </div>
        </FadeIn>
      )}

      {isCancelling && (
        <FadeIn>
          <div style={{ background: 'rgba(240,160,48,0.08)', border: '1.5px solid rgba(240,160,48,0.3)', borderRadius: 14, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <AlertTriangle size={16} color="#F0A030"/>
              <p style={{ fontSize: 13, color: T.textSub, fontWeight: 500 }}>Your plan is set to cancel on {fmtDate(periodEnd)}. You&apos;ll keep full access until then.</p>
            </div>
            <button onClick={() => goToCheckout(current, interval)} {...hover} style={{ background: BRAND.green, border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Keep my plan
            </button>
          </div>
        </FadeIn>
      )}

      {/* Manage billing — only for paid plans */}
      {isPaid && !isCancelling && (
        <FadeIn delay={90}>
          <p style={{ fontSize: 12, fontWeight: 700, color: T.textMut, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 16 }}>Manage billing</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14, marginBottom: 32 }} className="manage-grid">
            {/* Change billing cycle */}
            <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 18, padding: '20px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `${BRAND.green}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <RefreshCw size={19} color={BRAND.green}/>
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Billing cycle</p>
                  <p style={{ fontSize: 13, color: T.textMut }}>Currently <strong style={{ color: T.text }}>{interval === 'yearly' ? 'Yearly' : 'Monthly'}</strong> — ${currentPrice}/{interval === 'yearly' ? 'yr' : 'mo'}</p>
                </div>
              </div>
              <button onClick={() => goToCheckout(current, otherCycle)} {...hover} style={{ background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 11, padding: '10px 18px', fontSize: 13, fontWeight: 700, color: T.text, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", whiteSpace: 'nowrap' }}>
                Switch to {otherCycle === 'yearly' ? 'Yearly' : 'Monthly'}
              </button>
            </div>
            {/* Update payment method */}
            <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 18, padding: '20px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `${BRAND.green}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CreditCard size={19} color={BRAND.green}/>
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Payment method</p>
                  <p style={{ fontSize: 13, color: T.textMut }}>Update the card used for your subscription</p>
                </div>
              </div>
              <button onClick={() => goToCheckout(current, interval)} {...hover} style={{ background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 11, padding: '10px 18px', fontSize: 13, fontWeight: 700, color: T.text, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", whiteSpace: 'nowrap' }}>
                Update payment
              </button>
            </div>
          </div>
        </FadeIn>
      )}

      <FadeIn delay={120}>
        <p style={{ fontSize: 12, fontWeight: 700, color: T.textMut, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 16 }}>{isPaid ? 'Change plan' : 'Choose a plan'}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14, marginBottom: 32 }} className="bill-grid">
          {PLANS.map((plan) => {
            const isCurrent = current === plan.id;
            const isDowngrade = PLAN_RANK[plan.id] < PLAN_RANK[current];
            const isScheduled = scheduled === plan.id;
            // Show prices in the user's current cycle (or monthly default for free users).
            const cycle = isPaid ? interval : 'monthly';
            const price = plan.id === 'free' ? '0' : (cycle === 'yearly' ? plan.yearly : plan.monthly);
            const period = plan.id === 'free' ? 'forever' : (cycle === 'yearly' ? '/ year' : '/ month');
            return (
              <div key={plan.id} style={{ background: T.surface, border: `1.5px solid ${isCurrent ? plan.color : T.border}`, borderRadius: 20, padding: '24px 24px', transition: 'all .2s', boxShadow: isCurrent ? `0 4px 20px ${plan.color}20` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: T.text, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{plan.name}</h3>
                      {isCurrent && <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: BRAND.green, borderRadius: 100, padding: '4px 11px', textTransform: 'uppercase', letterSpacing: .5 }}>Current</span>}
                      {isScheduled && <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: '#F0A030', borderRadius: 100, padding: '4px 11px', textTransform: 'uppercase', letterSpacing: .5 }}>Scheduled</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontSize: 32, fontWeight: 800, color: T.text, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>${price}</span>
                      <span style={{ fontSize: 13, color: T.textMut, fontWeight: 500 }}>{period}</span>
                    </div>
                  </div>
                  {!isCurrent && !isScheduled && (
                    plan.id === 'free' || isDowngrade ? (
                      <button onClick={() => handleDowngrade(plan.id)} disabled={busy} {...hover} style={{ background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '10px 22px', fontSize: 13, fontWeight: 700, color: T.text, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", whiteSpace: 'nowrap', transition: 'opacity .15s' }}>
                        Downgrade
                      </button>
                    ) : (
                      <button onClick={() => goToCheckout(plan.id, isPaid ? interval : 'monthly')} disabled={busy} {...hover} style={{ background: `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})`, border: 'none', borderRadius: 12, padding: '10px 22px', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: '0 4px 14px rgba(74,186,139,0.35)', whiteSpace: 'nowrap', transition: 'opacity .15s' }}>
                        <Zap size={13}/> Upgrade
                      </button>
                    )
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '6px 16px' }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.textSub, fontWeight: 500 }}>
                      <Check size={12} color={isCurrent ? plan.color : BRAND.green} strokeWidth={2.5}/> {f}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </FadeIn>

      {showCancel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 24, padding: 32, maxWidth: 420, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,100,100,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <AlertTriangle size={24} color="#FF6464"/>
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 10, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Cancel your plan?</h3>
            <p style={{ fontSize: 14, color: T.textMut, lineHeight: 1.65, marginBottom: 24 }}>
              You&apos;ll keep full access to your <strong style={{ color: T.text }}>{currentPlan?.name}</strong> plan until <strong style={{ color: T.text }}>{fmtDate(periodEnd) || 'the end of your billing period'}</strong>. After that you&apos;ll move to Free and won&apos;t be charged again. Your memories and data stay safe.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleCancel} disabled={busy} {...hover} style={{ flex: 1, background: 'rgba(255,100,100,0.1)', border: '1.5px solid rgba(255,100,100,0.3)', borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, color: '#FF6464', cursor: 'pointer', transition: 'opacity .15s', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                {busy ? 'Cancelling…' : 'Yes, cancel'}
              </button>
              <button onClick={() => setShowCancel(false)} disabled={busy} {...hover} style={{ flex: 1, background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, color: T.text, cursor: 'pointer', transition: 'opacity .15s', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                Keep my plan
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media(min-width:700px){ .bill-grid{grid-template-columns:repeat(3,1fr)!important} }
        @media(min-width:700px){ .manage-grid{grid-template-columns:repeat(2,1fr)!important} }
      `}</style>
    </div>
  );
}