'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Users, Check, AlertCircle, LogIn } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { BRAND } from '@/lib/tokens';
import { useCurrentUser } from '@/lib/useCurrentUser';

const ROLE_LABEL = { viewer: 'Viewer', access: 'Access' };
const ROLE_DESC = {
  viewer: 'You can read their memories and chat with their Digital Personality.',
  contributor: 'You can read their memories and add new ones to their vault.',
};

export default function AcceptInvite() {
  const router = useRouter();
  const { token } = useParams();
  const { T } = useTheme();
  const { user, loading: userLoading } = useCurrentUser();

  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/invite/${token}`)
      .then((r) => r.json())
      .then((d) => { if (d.error) setError(d.error); else setInvite(d); })
      .catch(() => setError('Could not load this invite.'))
      .finally(() => setLoading(false));
  }, [token]);

  const accept = async () => {
    setAccepting(true);
    setError('');
    try {
      const res = await fetch(`/api/invite/${token}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not accept invite.');
      setDone(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (e) {
      setError(e.message);
    } finally {
      setAccepting(false);
    }
  };

  // Auto-accept once the user is logged in and the invite has loaded.
  useEffect(() => {
    if (user && invite && invite.status !== 'revoked' && !accepting && !done) {
      accept();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, invite]);

  const wrap = (children) => (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 24, padding: 36, boxShadow: '0 16px 48px rgba(0,0,0,0.1)' }}>
        {children}
      </div>
    </div>
  );

  if (loading || userLoading) return wrap(<p style={{ textAlign: 'center', color: T.textMut, fontSize: 14 }}>Loading invite…</p>);

  if (error && !invite && !done) return wrap(
    <div style={{ textAlign: 'center' }}>
      <AlertCircle size={36} color="#FF5050" style={{ marginBottom: 14 }}/>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, marginBottom: 8, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Invite unavailable</h2>
      <p style={{ fontSize: 14, color: T.textMut, marginBottom: 24 }}>{error}</p>
      <button onClick={() => router.push('/')} style={{ background: `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})`, border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Go home</button>
    </div>
  );

  if (done) return wrap(
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 60, height: 60, borderRadius: '50%', background: `${BRAND.green}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <Check size={30} color={BRAND.green}/>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 8, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>You&apos;re connected!</h2>
      <p style={{ fontSize: 14, color: T.textMut }}>Taking you to the dashboard…</p>
    </div>
  );

  return wrap(
    <div>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: `${BRAND.green}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <Users size={26} color={BRAND.green}/>
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 8, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
        {invite?.owner_name || 'Someone'} invited you
      </h2>
      <p style={{ fontSize: 14, color: T.textSub, lineHeight: 1.7, marginBottom: 20 }}>
        You&apos;ve been invited to join <strong style={{ color: T.text }}>{invite?.owner_name || 'their'}</strong>&apos;s Family vault on My Family and I as a <strong style={{ color: BRAND.green }}>{ROLE_LABEL[invite?.role] || 'member'}</strong>.
      </p>
      <div style={{ background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 24 }}>
        <p style={{ fontSize: 13, color: T.textSub, lineHeight: 1.6 }}>{ROLE_DESC[invite?.role] || ''}</p>
      </div>

      {error && (
        <div style={{ background: 'rgba(255,80,80,0.08)', border: '1.5px solid rgba(255,80,80,0.25)', borderRadius: 12, padding: '11px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={14} color="#FF5050"/>
          <p style={{ fontSize: 13, color: '#FF5050' }}>{error}</p>
        </div>
      )}

      {invite?.status === 'revoked' ? (
        <p style={{ fontSize: 14, color: T.textMut, textAlign: 'center' }}>This invite has been revoked.</p>
      ) : !user ? (
        <div>
          <p style={{ fontSize: 13, color: T.textMut, marginBottom: 14, textAlign: 'center' }}>Log in or create an account to accept this invite.</p>
          <button onClick={() => router.push(`/login?next=${encodeURIComponent(`/invite/${token}`)}`)} style={{ width: '100%', background: `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})`, border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', marginBottom: 10, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            <LogIn size={16}/> Log in to accept
          </button>
          <button onClick={() => router.push(`/signup?next=${encodeURIComponent(`/invite/${token}`)}`)} style={{ width: '100%', background: 'none', border: `1.5px solid ${T.border}`, borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 600, color: T.text, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Create an account
          </button>
        </div>
      ) : (
        <button onClick={accept} disabled={accepting} style={{ width: '100%', background: `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})`, border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: accepting ? 'default' : 'pointer', opacity: accepting ? 0.8 : 1, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          {accepting ? 'Accepting…' : <><Check size={16}/> Accept invite</>}
        </button>
      )}
    </div>
  );
}