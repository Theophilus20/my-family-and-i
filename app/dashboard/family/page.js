'use client';

import { useState, useEffect } from 'react';
import { Plus, Mail, Shield, Eye, Edit3, Crown, X, Check, Trash2, Copy, Link2 } from 'lucide-react';
import FadeIn from '@/components/FadeIn';
import UpgradeGate from '@/components/UpgradeGate';
import { useTheme } from '@/context/ThemeContext';
import { BRAND } from '@/lib/tokens';
import { FEATURE_REQUIREMENTS, planAllows } from '@/lib/plans';
import { api } from '@/lib/api';
import { useCurrentUser } from '@/lib/useCurrentUser';
import { SkeletonGrid, SkeletonBox } from '@/components/Skeleton';
import FeatureGate from '@/components/FeatureGate';

const ROLES = {
  viewer: { label: 'Viewer', desc: 'Can read memories, wisdom, and timeline', Icon: Eye },
  access: { label: 'Access', desc: 'Can read, chat, and open unlocked capsules', Icon: Edit3 },
};

function FamilyInner(){
  const { T } = useTheme();
  const { user, loading: userLoading } = useCurrentUser();
  const plan = user?.plan || 'free';
  const allowed = planAllows(plan, FEATURE_REQUIREMENTS.familyVault);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [inviting, setInviting] = useState(false);
  const [form, setForm] = useState({ email: '', role: 'viewer' });
  const [saved, setSaved] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [error, setError] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  const loadMembers = () => {
    setLoading(true);
    return api.getFamily()
      .then((rows) => setMembers(rows.map((r) => ({
        id: r.id,
        email: r.member_email || r.invite_email,
        name: r.member_name || r.invite_email.split('@')[0],
        role: r.role,
        status: r.status,
      }))))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (allowed) loadMembers(); }, [allowed]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
if (userLoading) {
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <SkeletonBox width={200} height={28} radius={8} />
          <div style={{ height: 8 }} />
          <SkeletonBox width={140} height={14} radius={6} />
        </div>
        <SkeletonGrid count={3} />
      </div>
    );
  }
  if (!allowed) {
    return (
      <FadeIn>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: 800, color: T.text, marginBottom: 4, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Family Vault</h2>
          <p style={{ fontSize: 14, color: T.textMut, fontWeight: 500 }}>Invite family and control who can access your legacy</p>
        </div>
        <UpgradeGate
          title="Invite your family"
          desc="Family Vault lets you invite family members and assign roles to control exactly who can read and interact with your My Family and I. Available on the Premium and Family plans."
          perks={[
            'Invite family members',
            'Assign Viewer or Access roles',
            'Send capsules that unlock to a specific person',
            'Control who can read, chat, and open capsules',
          ]}
        />
      </FadeIn>
    );
  }

  const handleInvite = async () => {
    if (!emailValid) return;
    setError('');
    try {
      const row = await api.inviteFamily({ email: form.email.trim(), role: form.role });
      setSaved(true);
      if (row?.invite_token) {
        setInviteLink(`${window.location.origin}/invite/${row.invite_token}`);
      }
      await loadMembers();
      setTimeout(() => { setSaved(false); }, 1500);
    } catch (e) {
      setError(e.message);
    }
  };

  const removeMember = async (id) => {
    try { await api.removeFamily(id); await loadMembers(); }
    catch (e) { setError(e.message); }
  };

  const changeRole = async (id, role) => {
    setMembers((m) => m.map((x) => (x.id === id ? { ...x, role } : x)));
    try { await api.updateFamilyRole(id, role); }
    catch (e) { setError(e.message); loadMembers(); }
  };

  return (
    <div>
      <FadeIn>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: 800, color: T.text, marginBottom: 4, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Family Vault</h2>
            <p style={{ fontSize: 14, color: T.textMut, fontWeight: 500 }}>Unlimited</p>
          </div>
          <button onClick={() => setInviting(true)}
            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
            style={{ background: `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})`, border: 'none', borderRadius: 12, padding: '10px 20px', fontSize: 13, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', boxShadow: '0 4px 14px rgba(74,186,139,0.35)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            <Plus size={15}/> Invite member
          </button>
        </div>
      </FadeIn>

      {inviting && (
        <FadeIn>
          <div style={{ background: T.surface, border: `1.5px solid ${BRAND.green}40`, borderRadius: 20, padding: 24, marginBottom: 20, boxShadow: `0 8px 32px ${BRAND.green}12` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: T.text, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Invite a family member</h3>
              <button onClick={() => setInviting(false)} style={{ background: 'none', border: 'none', color: T.textMut, cursor: 'pointer', display: 'flex' }}><X size={18}/></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: T.textMut, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 6 }}>Email address</p>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} color={T.textMut} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
                  <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="family@email.com" type="email"
                    style={{ width: '100%', background: T.surface2, border: `1.5px solid ${form.email && !emailValid ? '#FF5050' : T.border}`, borderRadius: 12, padding: '12px 14px 12px 40px', fontSize: 14, color: T.text, fontFamily: "'Plus Jakarta Sans',sans-serif", outline: 'none' }}
                    onFocus={(e) => { if (!(form.email && !emailValid)) e.target.style.borderColor = BRAND.green; }} onBlur={(e) => (e.target.style.borderColor = form.email && !emailValid ? '#FF5050' : T.border)}/>
                </div>
                {form.email && !emailValid && (
                  <p style={{ fontSize: 12, color: '#FF5050', marginTop: 6, fontWeight: 500 }}>Please enter a valid email address.</p>
                )}
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: T.textMut, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 8 }}>Role</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {Object.entries(ROLES).map(([key, { label, desc, Icon }]) => (
                    <button key={key} onClick={() => setForm((f) => ({ ...f, role: key }))} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${form.role === key ? BRAND.green : T.border}`, background: form.role === key ? `${BRAND.green}0F` : T.surface2, cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: T.surface, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={16} color={form.role === key ? BRAND.green : '#6B7280'} strokeWidth={1.8}/>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{label}</p>
                        <p style={{ fontSize: 12, color: T.textMut }}>{desc}</p>
                      </div>
                      {form.role === key && <Check size={16} color={BRAND.green}/>}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleInvite} disabled={!emailValid} style={{ background: saved ? `${BRAND.green}15` : !emailValid ? T.surface2 : `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})`, border: saved ? `1.5px solid ${BRAND.green}` : !emailValid ? `1.5px solid ${T.border}` : 'none', borderRadius: 12, padding: '12px 24px', fontSize: 13, fontWeight: 700, color: saved ? BRAND.green : !emailValid ? T.textMut : '#fff', cursor: !emailValid ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Plus Jakarta Sans',sans-serif", transition: 'all .2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}>
                  {saved ? <><Check size={14}/> Invite created</> : <><Mail size={14}/> Send invite</>}
                </button>
                <button onClick={() => { setInviting(false); setForm({ email: '', role: 'viewer' }); }} style={{ background: 'none', border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '12px 24px', fontSize: 13, color: T.textSub, cursor: 'pointer', fontWeight: 500, fontFamily: "'Plus Jakarta Sans',sans-serif", transition: 'all .15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.textMut; e.currentTarget.style.color = T.text; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSub; }}>Cancel</button>
              </div>
            </div>
          </div>
        </FadeIn>
      )}

      {error && (
        <div style={{ background: 'rgba(255,80,80,0.08)', border: '1.5px solid rgba(255,80,80,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF5050', flexShrink: 0 }}/>
          <p style={{ fontSize: 13, color: '#FF5050', fontWeight: 500 }}>{error}</p>
        </div>
      )}

      {inviteLink && (
        <div style={{ background: `${BRAND.green}0C`, border: `1.5px solid ${BRAND.green}33`, borderRadius: 14, padding: '14px 16px', marginBottom: 16, position: 'relative' }}>
          <button onClick={() => { setInviteLink(''); setCopied(false); }}
            style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: T.textMut, cursor: 'pointer', display: 'flex', padding: 4 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = T.text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = T.textMut)}>
            <X size={16}/>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Link2 size={14} color={BRAND.green}/>
            <p style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Invite link ready</p>
          </div>
          <p style={{ fontSize: 12, color: T.textMut, marginBottom: 10, lineHeight: 1.5 }}>
            Share this link with your family member so they can accept the invite.
          </p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input readOnly value={inviteLink} style={{ flex: 1, background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: '9px 12px', fontSize: 12, color: T.textSub, fontFamily: 'monospace', outline: 'none' }}/>
            <button onClick={() => { navigator.clipboard?.writeText(inviteLink); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              style={{ background: copied ? `${BRAND.green}15` : `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})`, border: copied ? `1.5px solid ${BRAND.green}` : 'none', borderRadius: 10, padding: '9px 14px', fontSize: 12, fontWeight: 700, color: copied ? BRAND.green : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Plus Jakarta Sans',sans-serif", flexShrink: 0 }}>
              {copied ? <><Check size={13}/> Copied</> : <><Copy size={13}/> Copy</>}
            </button>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          <SkeletonGrid count={3} />
        ) : members.length === 0 ? (
          <p style={{ color: T.textMut, fontSize: 14, padding: '20px 0' }}>No family members yet. Invite someone to share your My Family and I.</p>
        ) : members.map((m, i) => {
          const RoleIcon = ROLES[m.role].Icon;
          return (
            <FadeIn key={m.id} delay={i * 50}>
              <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: T.surface2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: T.textSub, flexShrink: 0, textTransform: 'uppercase' }}>
                  {m.name.slice(0, 2)}
                </div>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: T.text, textTransform: 'capitalize' }}>{m.name}</p>
                  <p style={{ fontSize: 12, color: T.textMut }}>{m.email}</p>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, color: m.status === 'active' ? BRAND.green : '#F0A030', background: m.status === 'active' ? `${BRAND.green}15` : 'rgba(240,160,48,0.12)', borderRadius: 100, padding: '3px 10px' }}>{m.status}</span>
                <select value={m.role} onChange={(e) => changeRole(m.id, e.target.value)} style={{ background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: '7px 10px', fontSize: 12, fontWeight: 600, color: T.text, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", outline: 'none' }}>
                  {Object.entries(ROLES).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
                </select>
                <button onClick={() => setConfirmRemove(m)} style={{ background: 'none', border: 'none', color: T.textMut, cursor: 'pointer', display: 'flex', padding: 4 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#FF5050')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = T.textMut)}>
                  <Trash2 size={15}/>
                </button>
              </div>
            </FadeIn>
          );
        })}
      </div>

      {confirmRemove && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 24, padding: 32, maxWidth: 420, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 10, fontFamily: "'Plus Jakarta Sans',sans-serif", textTransform: 'capitalize' }}>Remove {confirmRemove.name}?</h3>
            <p style={{ fontSize: 14, color: T.textMut, lineHeight: 1.65, marginBottom: 24, maxWidth: 640 }}>
              They&apos;ll lose access to your My Family and I vault. You can always invite them again later.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmRemove(null)}
                onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                style={{ flex: 1, background: `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})`, border: 'none', borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                Keep member
              </button>
              <button onClick={() => { removeMember(confirmRemove.id); setConfirmRemove(null); }}
                onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                style={{ flex: 1, background: 'none', border: '1.5px solid rgba(255,80,80,0.4)', borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, color: '#FF5050', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                Yes, remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default function Family() {
  return (
    <FeatureGate feature="family">
      <FamilyInner />
    </FeatureGate>
  );
}