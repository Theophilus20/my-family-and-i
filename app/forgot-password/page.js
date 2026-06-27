'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F7F4', padding: 24, fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      <div style={{ background: '#fff', border: '1.5px solid #E3ECE8', borderRadius: 24, padding: '44px 36px', maxWidth: 440, width: '100%', boxShadow: '0 24px 64px rgba(20,40,30,0.08)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#14281E', marginBottom: 28, textAlign: 'center' }}>
          My Family and I<span style={{ color: '#4ABA8B' }}>and I</span>
        </h1>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, margin: '0 auto 20px', borderRadius: '50%', background: 'rgba(74,186,139,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={32} color="#4ABA8B" strokeWidth={2}/>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#14281E', marginBottom: 10 }}>Check your email</h2>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, marginBottom: 26 }}>
              If an account exists for <strong style={{ color: '#14281E' }}>{email}</strong>, we&apos;ve sent a link to reset your password. The link expires in 1 hour.
            </p>
            <button onClick={() => router.push('/login')} style={{ background: 'linear-gradient(135deg,#4ABA8B,#3A9A72)', border: 'none', borderRadius: 12, padding: '13px 28px', fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(74,186,139,0.35)' }}>
              Back to login
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#14281E', marginBottom: 8 }}>Forgot password?</h2>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, marginBottom: 28 }}>
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="#9ca3af" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                  style={{ width: '100%', background: '#F7FAF9', border: '1.5px solid #E3ECE8', borderRadius: 12, padding: '13px 14px 13px 42px', fontSize: 14, color: '#14281E', fontFamily: 'inherit', outline: 'none' }}
                  onFocus={(e) => (e.target.style.borderColor = '#4ABA8B')} onBlur={(e) => (e.target.style.borderColor = '#E3ECE8')}
                />
              </div>
              <button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg,#4ABA8B,#3A9A72)', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, color: '#fff', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.8 : 1, fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(74,186,139,0.35)' }}>
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
            <button onClick={() => router.push('/login')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', margin: '20px auto 0' }}>
              <ArrowLeft size={14}/> Back to login
            </button>
          </>
        )}
      </div>
    </div>
  );
}