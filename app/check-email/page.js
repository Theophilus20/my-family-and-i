'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail } from 'lucide-react';

function CheckEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  const isPaidPlan = plan === 'premium' || plan === 'family';
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [justSent, setJustSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let active = true;
    const next = searchParams.get('next');
    const dest = next ? next : isPaidPlan ? `/checkout?plan=${plan}` : '/dashboard';
    const check = () => fetch('/api/auth/me').then((r) => r.json()).then((d) => {
      if (!active || !d.user) return;
      setEmail(d.user.email || '');
      if (d.user.email_verified) { router.push(dest); }
    }).catch(() => {});
    check();
    const id = setInterval(check, 4000);
    return () => { active = false; clearInterval(id); };
  }, [router, isPaidPlan, plan]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const resend = async () => {
    if (sending || cooldown > 0) return;
    setSending(true);
    try {
      await fetch('/api/auth/resend-verification', { method: 'POST' });
      setJustSent(true);
      setCooldown(30);
      setTimeout(() => setJustSent(false), 3000);
    } catch {}
    finally { setSending(false); }
  };

  const logout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    router.push('/login');
  };

  const disabled = sending || cooldown > 0;
  const label = sending
    ? 'Sending…'
    : cooldown > 0
      ? (justSent ? `Sent resend in ${cooldown}s` : `Resend in ${cooldown}s`)
      : 'Resend verification email';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F7F4', padding: 24, fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      <div style={{ background: '#fff', border: '1.5px solid #E3ECE8', borderRadius: 24, padding: '44px 36px', maxWidth: 460, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(20,40,30,0.08)' }}>
        <div style={{ marginBottom: 28 }}>
          <img src="/family.png" alt="My Family and I" style={{ height: 60, width: 'auto' }} />
        </div>

        <div style={{ width: 64, height: 64, margin: '0 auto 24px', borderRadius: '50%', background: 'rgba(74,186,139,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Mail size={28} color="#4ABA8B" strokeWidth={2}/>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#14281E', marginBottom: 12 }}>Check your email</h2>
        <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.65, marginBottom: 8 }}>
          We&apos;ve sent a verification link to
        </p>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#4ABA8B', marginBottom: 24 }}>{email || 'your email'}</p>
        <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.65, marginBottom: 28 }}>
          Click the link in that email to activate your account. This page will continue automatically once you&apos;re verified.
        </p>

        <button onClick={resend} disabled={disabled}
          style={{ width: '100%', background: disabled ? 'transparent' : 'linear-gradient(135deg,#4ABA8B,#3A9A72)', border: disabled ? '1.5px solid #4ABA8B' : 'none', borderRadius: 12, padding: '13px', fontSize: 15, fontWeight: 700, color: disabled ? '#4ABA8B' : '#fff', cursor: disabled ? 'default' : 'pointer', fontFamily: 'inherit', marginBottom: 12, boxShadow: disabled ? 'none' : '0 4px 14px rgba(74,186,139,0.35)', opacity: sending ? 0.7 : 1 }}>
          {label}
        </button>

        <button onClick={logout} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          Use a different account
        </button>
      </div>
    </div>
  );
}

export default function CheckEmail() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F0F7F4' }} />}>
      <CheckEmailContent />
    </Suspense>
  );
}
