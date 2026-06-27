'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, User, Mail, LogIn, UserPlus, ChevronLeft } from 'lucide-react';
import LottiePlayer from '@/components/LottiePlayer';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';
import { LOTTIE, BRAND } from '@/lib/tokens';

function Field({ label, fieldKey, type, Icon, placeholder, form, setForm, showPass, setShowPass }) {
  const { T } = useTheme();
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: T.textMut, textTransform: 'uppercase', letterSpacing: .5 }}>{label}</span>
      <div style={{ position: 'relative' }}>
        <Icon size={14} color={T.textMut} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
        <input
          value={form[fieldKey]}
          onChange={(e) => setForm((f) => ({ ...f, [fieldKey]: e.target.value }))}
          placeholder={placeholder}
          type={(fieldKey === 'password' || fieldKey === 'confirm') ? (showPass ? 'text' : 'password') : type}
          style={{ width: '100%', background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '13px 13px 13px 40px', fontSize: 14, color: T.text, transition: 'border-color .2s', fontFamily: "'Plus Jakarta Sans',sans-serif", outline: 'none' }}
          onFocus={(e) => (e.target.style.borderColor = BRAND.green)}
          onBlur={(e) => (e.target.style.borderColor = T.border)}
        />
        {(fieldKey === 'password' || fieldKey === 'confirm') && (
          <button type="button" onClick={() => setShowPass((s) => !s)} style={{ background: 'none', border: 'none', position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', color: T.textMut, display: 'flex', cursor: 'pointer' }}>
            {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
          </button>
        )}
      </div>
    </label>
  );
}

export default function Auth({ mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  const next = searchParams.get('next');
  const isPaidPlan = plan === 'premium' || plan === 'family';
  const { T, isDark } = useTheme();
  const { t } = useLang();
  const isLogin = mode === 'login';
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  
  // Force a re-render for Lottie when the mode changes
  const [lottieKey, setLottieKey] = useState(0);
  useEffect(() => {
    setLottieKey(prev => prev + 1);
  }, [mode]);

  const checkoutPath = isPaidPlan ? `/checkout?plan=${plan}` : null;
  const destination = !isLogin
    ? (next
        ? `/check-email?next=${encodeURIComponent(next)}`
        : isPaidPlan ? `/check-email?plan=${plan}` : '/check-email')
    : (next || checkoutPath || '/dashboard');
  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin) {
      if (!form.name.trim()) { setError('Please enter your name.'); return; }
      if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
      if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const body = isLogin
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password, plan: plan || null };
        
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      setLoading(false);
      if (!isLogin) {
        router.push(destination);
        return;
      }
      setDone(true);
      setTimeout(() => router.push(destination), 1600);
    } catch (err) {
      setError('Could not reach the server. Please try again.');
      setLoading(false);
    }
  };

  if (done) return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{ width: 200, height: 200 }}><LottiePlayer src={LOTTIE.success} loop={false}/></div>
      <h2 style={{ fontSize: 30, fontWeight: 800, color: T.text, marginBottom: 10 }}>{isLogin ? t.welcome_back : t.account_created}</h2>
      <p style={{ fontSize: 14, color: T.textMut }}>{next ? 'Taking you back…' : isLogin ? 'Taking you to your dashboard...' : 'Check your email to verify your account...'}</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: T.bg }}>
      <div className="auth-left" style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 52, position: 'relative', overflow: 'hidden', background: isDark ? '#162420' : '#F0F7F4', display: 'none' }}>
        <div style={{ position: 'absolute', top: -80, left: -80, width: 320, height: 320, background: BRAND.lav, borderRadius: '50%', opacity: .08 }}/>
        <div style={{ position: 'absolute', bottom: -60, right: -60, width: 220, height: 220, background: BRAND.green, borderRadius: '50%', opacity: .08 }}/>
        
        <div className="float" style={{ width: '100%', maxWidth: 340, position: 'relative', zIndex: 2 }}>
          <LottiePlayer key={`lottie-${mode}-${lottieKey}`} src={isLogin ? LOTTIE.login : LOTTIE.signup} />
        </div>
        
        <div style={{ textAlign: 'center', zIndex: 2, marginTop: 20, position: 'relative' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 10 }}>{isLogin ? 'Welcome back' : 'Start your legacy'}</h2>
          <p style={{ fontSize: 14, color: T.textSub, lineHeight: 1.7, maxWidth: 300 }}>
            {isLogin ? 'Your memories and wisdom are safely waiting for you.' : 'Thousands of families are already preserving their stories.'}
          </p>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '80px 28px 48px', overflowY: 'auto', minHeight: '100vh' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <button onClick={() => router.push('/')} style={{ background: BRAND.green, border: 'none', borderRadius: 100, color: '#fff', fontSize: 15, fontWeight: 700, marginBottom: 32, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 26px 11px 20px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: '0 4px 14px rgba(74,186,139,0.35)', transition: 'background .15s, transform .15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = BRAND.greenD; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = BRAND.green; e.currentTarget.style.transform = 'translateY(0)'; }}>
            <ChevronLeft size={18} strokeWidth={2.5}/> Back
          </button>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: T.text, marginBottom: 8, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{isLogin ? t.login : 'Create account'}</h1>
          <p style={{ fontSize: 14, color: T.textMut, marginBottom: 32 }}>
            {isLogin ? 'No account yet? ' : 'Already have one? '}
            <button onClick={() => router.push(`${isLogin ? '/signup' : '/login'}${next ? `?next=${encodeURIComponent(next)}` : ''}`)} style={{ background: 'none', border: 'none', color: BRAND.green, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", transition: 'color .15s', textDecoration: 'underline', textDecorationColor: 'transparent', textUnderlineOffset: 3 }}
              onMouseEnter={(e) => { e.currentTarget.style.color = BRAND.greenD; e.currentTarget.style.textDecorationColor = BRAND.greenD; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = BRAND.green; e.currentTarget.style.textDecorationColor = 'transparent'; }}>
              {isLogin ? t.signup : t.login}
            </button>
          </p>
          {!isLogin && isPaidPlan && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '11px 14px', marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: T.textSub, fontWeight: 500 }}>
                You selected the <strong style={{ color: BRAND.green, textTransform: 'capitalize' }}>{plan}</strong> plan Create your account to continue to payment.
              </p>
            </div>
          )}
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {!isLogin && <Field label={t.full_name} fieldKey="name" type="text" Icon={User} placeholder="Your name" form={form} setForm={setForm} showPass={showPass} setShowPass={setShowPass}/>}
            <Field label={t.email} fieldKey="email" type="email" Icon={Mail} placeholder="you@example.com" form={form} setForm={setForm} showPass={showPass} setShowPass={setShowPass}/>
            <Field label={t.password} fieldKey="password" type="password" Icon={Lock} placeholder="********" form={form} setForm={setForm} showPass={showPass} setShowPass={setShowPass}/>
            {!isLogin && (
              <Field label="Confirm password" fieldKey="confirm" type="password" Icon={Lock} placeholder="********" form={form} setForm={setForm} showPass={showConfirm} setShowPass={setShowConfirm}/>
            )}
            {isLogin && <div style={{ textAlign: 'right', marginTop: -8 }}><a onClick={() => router.push('/forgot-password')} style={{ fontSize: 13, color: BRAND.green, fontWeight: 500, cursor: 'pointer', transition: 'color .15s', textDecoration: 'underline', textDecorationColor: 'transparent', textUnderlineOffset: 3 }}
              onMouseEnter={(e) => { e.currentTarget.style.color = BRAND.greenD; e.currentTarget.style.textDecorationColor = BRAND.greenD; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = BRAND.green; e.currentTarget.style.textDecorationColor = 'transparent'; }}>{t.forgot_password}</a></div>}
            {error && (
              <div style={{ background: 'rgba(255,80,80,0.08)', border: '1.5px solid rgba(255,80,80,0.25)', borderRadius: 12, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF5050', flexShrink: 0 }}/>
                <p style={{ fontSize: 13, color: '#FF5050', fontWeight: 500 }}>{error}</p>
              </div>
            )}
            <button type="submit" disabled={loading} style={{ background: `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})`, border: 'none', borderRadius: 12, padding: 15, fontWeight: 700, fontSize: 15, color: '#fff', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, opacity: loading ? .8 : 1, cursor: 'pointer', boxShadow: '0 4px 16px rgba(74,186,139,0.35)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              {loading ? <><span style={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite' }}/> {t.processing}</> : isLogin ? <><LogIn size={16}/> {t.login}</> : <><UserPlus size={16}/> Create account</>}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: T.border }}/>
              <span style={{ fontSize: 12, color: T.textMut, fontWeight: 500 }}>{t.or_continue}</span>
              <div style={{ flex: 1, height: 1, background: T.border }}/>
            </div>
            <button type="button" onClick={() => { window.location.href = `/api/auth/google${plan ? `?plan=${encodeURIComponent(plan)}` : ''}`; }} style={{background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '12px 16px', fontSize: 14, color: T.text, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer', transition: 'border-color .2s', fontFamily: "'Plus Jakarta Sans',sans-serif", width: '100%' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#4285F4')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.border)}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
          </form>
          <p style={{ fontSize: 12, color: T.textMut, marginTop: 20, lineHeight: 1.6, textAlign: 'center' }}>
            {isLogin ? 'By logging in ' : 'By signing up '}
            you agree to our <button onClick={() => router.push('/terms')} style={{ background: 'none', border: 'none', color: BRAND.green, fontWeight: 600, fontSize: 12, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Terms</button> and <button onClick={() => router.push('/privacy')} style={{ background: 'none', border: 'none', color: BRAND.green, fontWeight: 600, fontSize: 12, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Privacy Policy</button>.
          </p>
        </div>
      </div>
      <style>{`@media(min-width:760px){ .auth-left{ display:flex!important; } }`}</style>
    </div>
  );
}
