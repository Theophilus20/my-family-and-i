'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle } from 'lucide-react';

function VerifyInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState('verifying');
  const [message, setMessage] = useState('');
  const didRun = useRef(false);

  const plan = params.get('plan');
  const isPaidPlan = plan === 'premium' || plan === 'family';
  const dest = isPaidPlan ? `/checkout?plan=${plan}` : '/dashboard';

  useEffect(() => {
    if (didRun.current) return; // prevent React StrictMode double-call
    didRun.current = true;
    const token = params.get('token');
    if (!token) { setState('error'); setMessage('No verification token found.'); return; }
    fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setState('success');
        else { setState('error'); setMessage(d.error || 'Verification failed.'); }
      })
      .catch(() => { setState('error'); setMessage('Something went wrong.'); });
  }, [params]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F7F4', padding: 24, fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      <div style={{ background: '#fff', border: '1.5px solid #E3ECE8', borderRadius: 24, padding: '44px 36px', maxWidth: 460, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(20,40,30,0.08)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#14281E', marginBottom: 28 }}>
          My Family and <span style={{ color: '#4ABA8B' }}>and I</span>
        </h1>

        {state === 'verifying' && (
          <>
            <div style={{ width: 44, height: 44, margin: '8px auto 20px', border: '3px solid #E3ECE8', borderTopColor: '#4ABA8B', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
            <p style={{ fontSize: 15, color: '#6b7280' }}>Verifying your email…</p>
          </>
        )}

        {state === 'success' && (
          <>
            <div style={{ width: 64, height: 64, margin: '0 auto 20px', borderRadius: '50%', background: 'rgba(74,186,139,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={32} color="#4ABA8B" strokeWidth={2}/>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#14281E', marginBottom: 10 }}>Email verified!</h2>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 26, lineHeight: 1.6 }}>
              {isPaidPlan
                ? `Your email is confirmed. Complete your payment to activate your ${plan.charAt(0).toUpperCase() + plan.slice(1)} subscription.`
                : 'Your email is confirmed. Your My Family and I vault is now fully secured.'}
            </p>
            <button onClick={() => router.push(dest)} style={{ background: 'linear-gradient(135deg,#4ABA8B,#3A9A72)', border: 'none', borderRadius: 12, padding: '13px 28px', fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(74,186,139,0.35)' }}>
              {isPaidPlan ? 'Continue to Payment' : 'Go to dashboard'}
            </button>
          </>
        )}

        {state === 'error' && (
          <>
            <div style={{ width: 64, height: 64, margin: '0 auto 20px', borderRadius: '50%', background: 'rgba(255,80,80,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <XCircle size={32} color="#FF5050" strokeWidth={2}/>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#14281E', marginBottom: 10 }}>Verification failed</h2>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 26, lineHeight: 1.6 }}>{message}</p>
            <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: '1.5px solid #E3ECE8', borderRadius: 12, padding: '13px 28px', fontSize: 15, fontWeight: 700, color: '#6b7280', cursor: 'pointer', fontFamily: 'inherit' }}>
              Go to dashboard
            </button>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyInner />
    </Suspense>
  );
}