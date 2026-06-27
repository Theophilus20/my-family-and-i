'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Mail, Calendar, Camera, Check, Lock, Eye, EyeOff } from 'lucide-react';
import FadeIn from '@/components/FadeIn';
import { useTheme } from '@/context/ThemeContext';
import { BRAND } from '@/lib/tokens';
import { useVault } from '@/context/VaultContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { SkeletonGrid, SkeletonBox } from '@/components/Skeleton';
const hover = {
  onMouseEnter: (e) => { e.currentTarget.style.filter = 'brightness(0.9)'; },
  onMouseLeave: (e) => { e.currentTarget.style.filter = 'brightness(1)'; },
};
function InputField({ label, value, onChange, Icon, placeholder, type = 'text', disabled }) {
  const { T } = useTheme();
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: T.textMut, textTransform: 'uppercase', letterSpacing: .5 }}>{label}</span>
      <div style={{ position: 'relative' }}>
        <Icon size={14} color={T.textMut} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
        <input
          value={value}
          onChange={(e) => !disabled && onChange(e.target.value)}
          placeholder={placeholder}
          type={type}
          readOnly={disabled}
          style={{ width: '100%', background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '13px 13px 13px 40px', fontSize: 14, color: disabled ? T.textMut : T.text, fontFamily: "'Plus Jakarta Sans',sans-serif", outline: 'none', transition: 'border-color .2s', cursor: disabled ? 'default' : 'text', opacity: disabled ? 0.7 : 1 }}
          onFocus={(e) => { if (!disabled) e.target.style.borderColor = BRAND.green; }}
          onBlur={(e) => { e.target.style.borderColor = T.border; }}
        />
      </div>
    </label>
  );
}

function Toggle({ on, onChange }) {
  const { T } = useTheme();
  return (
    <div onClick={() => onChange(!on)}
      style={{ width: 48, height: 26, borderRadius: 100, background: on ? BRAND.green : T.surface2, border: `2px solid ${on ? BRAND.green : T.border}`, cursor: 'pointer', position: 'relative', transition: 'all .25s', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 2, left: on ? 22 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .25s', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', display: 'block' }}/>
    </div>
  );
}

function SaveBtn({ onClick, saved, style = {} }) {
  return (
    <button onClick={onClick}
      onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
      style={{ background: saved ? `${BRAND.green}15` : `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})`, border: saved ? `1.5px solid ${BRAND.green}` : 'none', borderRadius: 12, padding: '11px 24px', fontSize: 14, fontWeight: 700, color: saved ? BRAND.green : '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all .3s', fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: saved ? 'none' : '0 4px 14px rgba(74,186,139,0.35)', ...style }}>
      {saved ? <><Check size={14}/> Saved</> : 'Save changes'}
    </button>
  );
}

export default function Profile() {
  const { T } = useTheme();
  const { activeVault, isOwnerView } = useVault();
  const [activeTab, setActiveTab] = useState('personal');
  const [personalSaved, setPersonalSaved] = useState(false);
  const [securitySaved, setSecuritySaved] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);
  const [privacySaved, setPrivacySaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [error, setError] = useState(null);
  const avatarInputRef = useRef(null);
  const [avatar, setAvatar] = useState(null);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const router = useRouter();
  const [profile, setProfile] = useState({ name: '', email: '', bio: '', birthdate: '' });
  const [draft, setDraft] = useState({ ...profile });
  const [loading, setLoading] = useState(true);

  // Load own profile on own vault; the vault owner's public profile otherwise.
  useEffect(() => {
    let active = true;
    setEditing(false);
    setActiveTab('personal');
    const load = isOwnerView
      ? fetch('/api/auth/me').then((r) => r.json()).then((d) => d.user || {})
      : api.getVaultProfile(activeVault?.id).catch(() => ({}));
    Promise.resolve(load).then((u) => {
      if (!active) return;
      const data = {
        name: u.name || '',
        email: u.email || '',
        bio: u.bio || '',
        birthdate: u.birthdate ? String(u.birthdate).slice(0, 10) : '',
      };
      setProfile(data);
      setDraft(data);
      setAvatar(u.avatar_url || null);
      setLoading(false);
    });
    return () => { active = false; };
  }, [activeVault?.id, isOwnerView]);

  const [password, setPassword] = useState({ current: '', newPass: '', confirm: '' });
  const [notifs, setNotifs] = useState({ capsules: true, weekly: true, family: false, bio: true, billing: true });
  const [privacy, setPrivacy] = useState({ visibility: true, sharing: false, aiOptOut: true, twoFactor: false });

  const handleSavePersonal = () => { setProfile({ ...draft }); setEditing(false); setPersonalSaved(true); setTimeout(() => setPersonalSaved(false), 2000); };
  const handleSaveSecurity = () => { setPassword({ current: '', newPass: '', confirm: '' }); setSecuritySaved(true); setTimeout(() => setSecuritySaved(false), 2000); };
  const handleSaveNotif = () => { setNotifSaved(true); setTimeout(() => setNotifSaved(false), 2000); };
  const handleSavePrivacy = () => { setPrivacySaved(true); setTimeout(() => setPrivacySaved(false), 2000); };

  // Read the chosen image, downscale it to <=512px, and save as base64.
  const handleAvatarPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = async () => {
        const max = 512;
        let { width, height } = img;
        if (width > height && width > max) { height = Math.round(height * max / width); width = max; }
        else if (height > max) { width = Math.round(width * max / height); height = max; }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setAvatar(dataUrl);
        setAvatarSaving(true);
        try {
          await api.saveAvatar(dataUrl);
        } catch (err) {
          setError(err.message || 'Could not save photo');
        } finally {
          setAvatarSaving(false);
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Family members only see the Personal tab (read-only).
  const TABS = isOwnerView ? ['personal', 'security', 'notifications', 'privacy'] : ['personal'];
  const setD = (key) => (val) => setDraft((d) => ({ ...d, [key]: val }));

  return (
    <div>
      <FadeIn>
        {loading && !isOwnerView ? (
          <div style={{ marginBottom: 28 }}>
            <SkeletonBox width={240} height={32} radius={8} />
            <div style={{ height: 10 }} />
            <SkeletonBox width={180} height={16} radius={6} />
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: 800, color: T.text, marginBottom: 4, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{isOwnerView ? 'My Profile' : `${profile.name}'s Profile`}</h2>
            <p style={{ fontSize: 14, color: T.textMut, marginBottom: 28, fontWeight: 500 }}>{isOwnerView ? 'Manage your personal information and account settings' : 'Viewing this profile (read-only)'}</p>
          </>
        )}
      </FadeIn>

      {error && (
        <div style={{ background: 'rgba(255,80,80,0.08)', border: '1.5px solid rgba(255,80,80,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: '#FF5050' }}>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <SkeletonBox height={120} radius={20} />
          <SkeletonGrid count={3} />
        </div>
      ) : (
        <>

      <FadeIn delay={40}>
        <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 20, padding: '24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              onClick={() => { if (avatar && !isOwnerView) setAvatarOpen(true); }}
              style={{ width: 80, height: 80, borderRadius: '50%', background: T.surface2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: T.textSub, overflow: 'hidden', cursor: (avatar && !isOwnerView) ? 'pointer' : 'default' }}>
              {avatar
                ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                : profile.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('')}
            </div>
            {isOwnerView && (
              <>
                <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarPick} style={{ display: 'none' }}/>
                <button onClick={() => avatarInputRef.current?.click()} disabled={avatarSaving}
                  style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: T.surface2, border: `1.5px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: avatarSaving ? 'default' : 'pointer', opacity: avatarSaving ? 0.6 : 1 }}>
                  <Camera size={12} color="#6B7280"/>
                </button>
              </>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 2, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{profile.name}</h3>
            {isOwnerView && <p style={{ fontSize: 13, color: T.textMut, marginBottom: 10 }}>{profile.email}</p>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: isOwnerView ? 0 : 8 }}>
              {isOwnerView
                ? <span style={{ fontSize: 11, fontWeight: 700, color: BRAND.green, background: `${BRAND.green}15`, borderRadius: 100, padding: '4px 12px' }}>Account owner</span>
                : <span style={{ fontSize: 11, fontWeight: 700, color: BRAND.green, background: `${BRAND.green}15`, borderRadius: 100, padding: '4px 12px' }}>Vault owner</span>}
            </div>
          </div>
        </div>
      </FadeIn>

      {TABS.length > 1 && (
        <FadeIn delay={60}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: T.surface2, borderRadius: 14, padding: 4, flexWrap: 'wrap' }}>
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, minWidth: 80, padding: '9px 12px', borderRadius: 10, border: 'none', background: activeTab === tab ? T.surface : 'transparent', color: activeTab === tab ? T.text : T.textMut, fontSize: 13, fontWeight: activeTab === tab ? 700 : 500, cursor: 'pointer', transition: 'all .2s', textTransform: 'capitalize', fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
                {tab}
              </button>
            ))}
          </div>
        </FadeIn>
      )}

      {activeTab === 'personal' && (
        <FadeIn delay={80}>
          <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 20, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Personal Information</h3>
              {isOwnerView && !editing && (
                <button onClick={() => { setDraft({ ...profile }); setEditing(true); }}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                  style={{ background: 'none', border: `1.5px solid ${T.border}`, borderRadius: 10, padding: '7px 16px', fontSize: 13, fontWeight: 600, color: T.textSub, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  Edit
                </button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14, marginBottom: 14 }} className="profile-grid">
              <InputField label="Full name" value={editing ? draft.name : profile.name} onChange={setD('name')} Icon={User} placeholder="Full name" disabled={!editing}/>
              {isOwnerView && <InputField label="Email address" value={editing ? draft.email : profile.email} onChange={setD('email')} Icon={Mail} placeholder="your@email.com" type="email" disabled={!editing}/>}
              <InputField label="Date of birth" value={editing ? draft.birthdate : profile.birthdate} onChange={setD('birthdate')} Icon={Calendar} placeholder="YYYY-MM-DD" type="date" disabled={!editing}/>
            </div>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.textMut, textTransform: 'uppercase', letterSpacing: .5 }}>Bio</span>
              <textarea value={editing ? draft.bio : profile.bio} onChange={(e) => editing && setD('bio')(e.target.value)} readOnly={!editing} rows={3} placeholder={isOwnerView ? 'Tell your story...' : ''}
                style={{ width: '100%', background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '13px 14px', fontSize: 14, color: editing ? T.text : T.textMut, fontFamily: "'Plus Jakarta Sans',sans-serif", outline: 'none', resize: editing ? 'vertical' : 'none', cursor: editing ? 'text' : 'default', opacity: editing ? 1 : 0.7 }}
                onFocus={(e) => { if (editing) e.target.style.borderColor = BRAND.green; }} onBlur={(e) => (e.target.style.borderColor = T.border)}/>
            </label>
            {isOwnerView && editing && (
              <div style={{ display: 'flex', gap: 10 }}>
                <SaveBtn onClick={handleSavePersonal} saved={personalSaved}/>
                <button onClick={() => { setEditing(false); setDraft({ ...profile }); }} style={{ background: 'none', border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '11px 20px', fontSize: 14, fontWeight: 600, color: T.textSub, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </FadeIn>
      )}

      {isOwnerView && activeTab === 'security' && (
        <FadeIn delay={80}>
          <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 20, padding: '24px' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 20 }}>Change Password</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              {[['Current password', 'current', showPass, setShowPass], ['New password', 'newPass', showNew, setShowNew]].map(([lbl, key, show, setShow]) => (
                <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: T.textMut, textTransform: 'uppercase', letterSpacing: .5 }}>{lbl}</span>
                  <div style={{ position: 'relative' }}>
                    <Lock size={14} color={T.textMut} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
                    <input value={password[key]} onChange={(e) => setPassword((p) => ({ ...p, [key]: e.target.value }))} type={show ? 'text' : 'password'} placeholder="********"
                      style={{ width: '100%', background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '13px 40px', fontSize: 14, color: T.text, fontFamily: "'Plus Jakarta Sans',sans-serif", outline: 'none' }}
                      onFocus={(e) => (e.target.style.borderColor = BRAND.green)} onBlur={(e) => (e.target.style.borderColor = T.border)}/>
                    <button type="button" onClick={() => setShow((s) => !s)} style={{ background: 'none', border: 'none', position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', color: T.textMut, display: 'flex', cursor: 'pointer' }}>
                      {show ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                </label>
              ))}
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: T.textMut, textTransform: 'uppercase', letterSpacing: .5 }}>Confirm new password</span>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} color={T.textMut} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
                  <input value={password.confirm} onChange={(e) => setPassword((p) => ({ ...p, confirm: e.target.value }))} type="password" placeholder="********"
                    style={{ width: '100%', background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '13px 13px 13px 40px', fontSize: 14, color: T.text, fontFamily: "'Plus Jakarta Sans',sans-serif", outline: 'none' }}
                    onFocus={(e) => (e.target.style.borderColor = BRAND.green)} onBlur={(e) => (e.target.style.borderColor = T.border)}/>
                </div>
              </label>
            </div>
            <SaveBtn onClick={handleSaveSecurity} saved={securitySaved}/>
            <div style={{ marginTop: 28, padding: '20px', background: 'rgba(255,80,80,0.05)', border: '1.5px solid rgba(255,80,80,0.2)', borderRadius: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#FF5050', marginBottom: 6 }}>Danger zone</h4>
              <p style={{ fontSize: 13, color: T.textMut, marginBottom: 14, lineHeight: 1.6, maxWidth: 640 }}>Permanently delete your account. All your memories will be lost forever.</p>
              <button onClick={() => setShowDelete(true)}
                onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                style={{ background: 'rgba(255,80,80,0.1)', border: '1.5px solid rgba(255,80,80,0.3)', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 700, color: '#FF5050', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                Delete account
              </button>
            </div>
          </div>
        </FadeIn>
      )}

      {isOwnerView && activeTab === 'notifications' && (
        <FadeIn delay={80}>
          <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 20, padding: '24px' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 20 }}>Notification Preferences</h3>
            {[
              { key: 'capsules', label: 'Capsule unlock reminders', desc: 'Get notified when a time capsule is about to unlock' },
              { key: 'weekly', label: 'Weekly memory prompts', desc: 'Receive weekly prompts to add new memories' },
              { key: 'family', label: 'Family activity', desc: 'Get notified when family members add memories' },
              { key: 'bio', label: 'AI biography updates', desc: 'Notify me when a new biography chapter is generated' },
              { key: 'billing', label: 'Billing reminders', desc: 'Receive billing and subscription notifications' },
            ].map(({ key, label, desc }) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${T.border}`, gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 3 }}>{label}</p>
                  <p style={{ fontSize: 12, color: T.textMut }}>{desc}</p>
                </div>
                <Toggle on={notifs[key]} onChange={(val) => setNotifs((n) => ({ ...n, [key]: val }))}/>
              </div>
            ))}
            <div style={{ marginTop: 20 }}><SaveBtn onClick={handleSaveNotif} saved={notifSaved}/></div>
          </div>
        </FadeIn>
      )}

      {isOwnerView && activeTab === 'privacy' && (
        <FadeIn delay={80}>
          <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 20, padding: '24px' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 20 }}>Privacy Settings</h3>
            {[
              { key: 'visibility', label: 'Profile visibility', desc: 'Allow family members to see your profile' },
              { key: 'sharing', label: 'Memory sharing', desc: 'Allow invited members to share your public memories' },
              { key: 'aiOptOut', label: 'AI training opt-out', desc: 'Do not use my memories to train AI models' },
            ].map(({ key, label, desc }) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${T.border}`, gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 3 }}>{label}</p>
                  <p style={{ fontSize: 12, color: T.textMut }}>{desc}</p>
                </div>
                <Toggle on={privacy[key]} onChange={(val) => setPrivacy((p) => ({ ...p, [key]: val }))}/>
              </div>
            ))}
            <div style={{ marginTop: 20 }}><SaveBtn onClick={handleSavePrivacy} saved={privacySaved}/></div>
          </div>
        </FadeIn>
      )}
{showDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 24, padding: 32, maxWidth: 420, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 10, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Delete your account?</h3>
            <p style={{ fontSize: 14, color: T.textMut, lineHeight: 1.65, marginBottom: 24, maxWidth: 640 }}>
              This is permanent. All your memories, capsules, wisdom, and biography will be <strong style={{ color: '#FF5050' }}>erased forever</strong> and cannot be recovered.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowDelete(false)} style={{ flex: 1, background: `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})`, border: 'none', borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                Keep my account
              </button>
              <button onClick={async () => { try { await api.deleteAccount(); router.push('/'); } catch (e) { setError(e.message); setShowDelete(false); } }} style={{ flex: 1, background: 'none', border: '1.5px solid rgba(255,80,80,0.4)', borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, color: '#FF5050', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                Yes, delete it
              </button>
            </div>
          </div>
        </div>
      )}

      {avatarOpen && avatar && !isOwnerView && (
        <div
          onClick={() => setAvatarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, cursor: 'zoom-out' }}
        >
          <button
            onClick={() => setAvatarOpen(false)}
            style={{ position: 'absolute', top: 24, right: 24, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ×
          </button>
        </div>
      )}

        </>
      )}

      <style>{`@media(min-width:700px){ .profile-grid{grid-template-columns:repeat(2,1fr)!important} }`}</style>
    </div>
  );
}