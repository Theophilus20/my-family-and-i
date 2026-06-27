'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

function ResetInner() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);

  // Validate the token on load so used/expired links don't show the form.
  useEffect(() => {
    if (!token) { setChecking(false); setValid(false); return; }
    fetch(`/api/auth/reset-password/validate?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => { setValid(!!d.valid); setChecking(false); })
      .catch(() => { setValid(false); setChecking(false); });
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Could not reset password.'); setLoading(false); return; }
      setDone(true);
    } catch { setError('Something went wrong.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F7F4', padding: 24, fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      <div style={{ background: '#fff', border: '1.5px solid #E3ECE8', borderRadius: 24, padding: '44px 36px', maxWidth: 440, width: '100%', boxShadow: '0 24px 64px rgba(20,40,30,0.08)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#14281E', marginBottom: 28, textAlign: 'center' }}>
          My Family <span style={{ color: '#4ABA8B' }}>and I</span>
        </h1>

        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, margin: '0 auto 20px', borderRadius: '50%', background: 'rgba(74,186,139,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={32} color="#4ABA8B" strokeWidth={2}/>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#14281E', marginBottom: 10 }}>Password reset!</h2>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, marginBottom: 26 }}>Your password has been updated. You can now log in with your new password.</p>
            <button onClick={() => router.push('/login')} style={{ background: 'linear-gradient(135deg,#4ABA8B,#3A9A72)', border: 'none', borderRadius: 12, padding: '13px 28px', fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(74,186,139,0.35)' }}>
              Go to login
            </button>
          </div>
        ) : checking ? (
          null
        ) : !valid ? (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#14281E', marginBottom: 10 }}>Invalid or expired link</h2>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, marginBottom: 24 }}>This reset link is invalid, has expired, or has already been used. Please request a new one.</p>
            <button onClick={() => router.push('/forgot-password')} style={{ background: 'linear-gradient(135deg,#4ABA8B,#3A9A72)', border: 'none', borderRadius: 12, padding: '13px 28px', fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
              Request new link
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#14281E', marginBottom: 8 }}>Set a new password</h2>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, marginBottom: 28 }}>Choose a strong password you haven&apos;t used before.</p>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#9ca3af" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
                <input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password"
                  style={{ width: '100%', background: '#F7FAF9', border: '1.5px solid #E3ECE8', borderRadius: 12, padding: '13px 42px', fontSize: 14, color: '#14281E', fontFamily: 'inherit', outline: 'none' }}
                  onFocus={(e) => (e.target.style.borderColor = '#4ABA8B')} onBlur={(e) => (e.target.style.borderColor = '#E3ECE8')}/>
                <button type="button" onClick={() => setShow((s) => !s)} style={{ background: 'none', border: 'none', position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', display: 'flex', cursor: 'pointer' }}>
                  {show ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#9ca3af" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
                <input type={show ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password"
                  style={{ width: '100%', background: '#F7FAF9', border: '1.5px solid #E3ECE8', borderRadius: 12, padding: '13px 42px', fontSize: 14, color: '#14281E', fontFamily: 'inherit', outline: 'none' }}
                  onFocus={(e) => (e.target.style.borderColor = '#4ABA8B')} onBlur={(e) => (e.target.style.borderColor = '#E3ECE8')}/>
                <button type="button" onClick={() => setShow((s) => !s)} style={{ background: 'none', border: 'none', position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', display: 'flex', cursor: 'pointer' }}>
                  {show ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
              {error && (
                <div style={{ background: 'rgba(255,80,80,0.08)', border: '1.5px solid rgba(255,80,80,0.25)', borderRadius: 12, padding: '11px 14px' }}>
                  <p style={{ fontSize: 13, color: '#FF5050', fontWeight: 500 }}>{error}</p>
                </div>
              )}
              <button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg,#4ABA8B,#3A9A72)', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, color: '#fff', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.8 : 1, fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(74,186,139,0.35)' }}>
                {loading ? 'Resetting…' : 'Reset password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetInner />
    </Suspense>
  );
}