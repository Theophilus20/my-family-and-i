'use client';

import { useState, useEffect } from 'react';
import { Plus, Lock, Unlock, Calendar, X, Check, ArrowLeft, AlertCircle, User, Crown, Trash2, Pencil } from 'lucide-react';
import FadeIn from '@/components/FadeIn';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';
import { BRAND } from '@/lib/tokens';
import { api } from '@/lib/api';
import { FEATURE_REQUIREMENTS, planAllows } from '@/lib/plans';
import { useVault } from '@/context/VaultContext';
import { useCurrentUser } from '@/lib/useCurrentUser';
import { vaultRole, canEdit } from '@/lib/permissions';
import { SkeletonGrid } from '@/components/Skeleton';

const COLORS = [BRAND.lav, BRAND.green, BRAND.lime, BRAND.gold];
const GREY = '#6B7280';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}
function colorFor(id, i) {
  const key = String(id ?? i);
  let h = 0;
  for (let c = 0; c < key.length; c++) h = (h * 31 + key.charCodeAt(c)) % COLORS.length;
  return COLORS[h];
}

export default function Capsules() {
  const { T } = useTheme();
  const { t } = useLang();
  const { activeVault, isOwnerView } = useVault();
  const role = vaultRole(isOwnerView, activeVault);
  const editable = canEdit(role);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { user } = useCurrentUser();
  const plan = user?.plan || 'free';
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', unlock: '', recipient_id: '' });
  const [members, setMembers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const canTarget = planAllows(plan, FEATURE_REQUIREMENTS.targetedCapsule);
  

  // Re-fetch whenever the active vault changes.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setSelected(null);
    api.getCapsules(isOwnerView ? null : activeVault?.id)
      .then((rows) => { if (active) { setCapsules(rows); setError(null); } })
      .catch((e) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [activeVault?.id]);
  useEffect(() => {
    if (!isOwnerView) return;
    api.getFamily().then((rows) => {
      setMembers((rows || []).filter((m) => m.status === 'active' && m.member_id));
    }).catch(() => {});
  }, [isOwnerView]);
 const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await api.deleteCapsule(confirmDelete.id);
      setCapsules((c) => c.filter((x) => x.id !== confirmDelete.id));
      setConfirmDelete(null);
      setSelected(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  };
  const startEdit = (cap) => {
    const d = cap.unlock_date ? new Date(cap.unlock_date) : null;
    const localDT = d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : '';
    setForm({ title: cap.title, message: cap.message || '', unlock: localDT, recipient: '' });
    setEditingId(cap.id);
    setCreating(true);
    setSelected(null);
  };
  const handleLock = async () => {
    if (!form.title.trim() || !form.unlock) return;
    try {
      const unlockISO = form.unlock ? new Date(form.unlock).toISOString() : null;
      const payload = { title: form.title, message: form.message, unlock_date: unlockISO };
      if (editingId) {
        const row = await api.updateCapsule(editingId, payload);
        setCapsules((c) => c.map((x) => (x.id === editingId ? row : x)));
      } else {
        const row = await api.createCapsule(payload);
        setCapsules((c) => [row, ...c]);
      }
      setSaved(true);
      setEditingId(null);
      setTimeout(() => {
        setSaved(false);
        setCreating(false);
        setForm({ title: '', message: '', unlock: '', recipient: '' });
      }, 1500);
    } catch (e) {
      setError(e.message);
    }
  };

  const locked = capsules.filter((c) => c.status === 'locked').length;
  const unlocked = capsules.filter((c) => c.status === 'unlocked').length;

  if (selected) {
    const color = colorFor(selected.id, 0);
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <button onClick={() => setSelected(null)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: T.textMut, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            <ArrowLeft size={16}/> Back to capsules
          </button>
          {editable && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => startEdit(selected)}
                onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: '8px 14px', color: T.textSub, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                <Pencil size={14}/> Edit
              </button>
              <button onClick={() => setConfirmDelete(selected)}
                onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,80,80,0.08)', border: '1.5px solid rgba(255,80,80,0.25)', borderRadius: 10, padding: '8px 14px', color: '#FF5050', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                <Trash2 size={14}/> Delete
              </button>
            </div>
          )}
        </div>
        <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 20, padding: '32px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: T.surface2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Unlock size={22} color={GREY} strokeWidth={1.8}/>
            </div>
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8, color: GREY, background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 100, padding: '2px 8px' }}>Unlocked</span>
              <p style={{ fontSize: 12, color: T.textMut, marginTop: 4, fontWeight: 500 }}>Opened {formatDate(selected.unlock_date)}</p>
            </div>
          </div>
          <h2 style={{ fontSize: 'clamp(20px,4vw,30px)', fontWeight: 800, color: T.text, marginBottom: 20, fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1.3 }}>{selected.title}</h2>
          <p style={{ fontSize: 15, color: T.textSub, lineHeight: 1.9, maxWidth: 640 }}>{selected.message || 'No message recorded for this capsule.'}</p>
        </div>
        {confirmDelete && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 24, padding: 32, maxWidth: 420, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: T.text, marginBottom: 10, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Delete this capsule?</h3>
              <p style={{ fontSize: 14, color: T.textMut, lineHeight: 1.6, marginBottom: 24 }}>
                &ldquo;{confirmDelete.title}&rdquo; will be permanently removed. This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setConfirmDelete(null)} disabled={deleting}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                  style={{ flex: 1, background: 'none', border: `1.5px solid ${T.border}`, borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, color: T.textSub, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                  style={{ flex: 1, background: '#FF5050', border: 'none', borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, color: '#fff', cursor: deleting ? 'default' : 'pointer', opacity: deleting ? 0.7 : 1, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <FadeIn>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
          <div>
            <h2 style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: 800, color: T.text, marginBottom: 4, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.capsules}</h2>
            <p style={{ fontSize: 14, color: T.textMut, fontWeight: 500 }}>{locked} {t.locked} · {unlocked} {t.unlocked}</p>
          </div>
          {isOwnerView && (
            <button onClick={() => setCreating(true)}
              onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
              style={{ background: `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})`, border: 'none', borderRadius: 12, padding: '10px 20px', fontSize: 13, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', boxShadow: '0 4px 14px rgba(74,186,139,0.35)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              <Plus size={15}/> {t.new_capsule}
            </button>
          )}
        </div>
      </FadeIn>

      {error && (
        <div style={{ background: 'rgba(255,80,80,0.08)', border: '1.5px solid rgba(255,80,80,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={15} color="#FF5050"/>
          <p style={{ fontSize: 13, color: '#FF5050' }}>{error}</p>
        </div>
      )}

      {creating && isOwnerView && (
        <FadeIn>
          <div style={{ background: T.surface, border: `1.5px solid ${BRAND.green}40`, borderRadius: 20, padding: 24, marginBottom: 24, boxShadow: `0 8px 32px ${BRAND.green}12` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: T.text, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Create a capsule</h3>
              <button onClick={() => setCreating(false)}
                onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                style={{ background: 'none', border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '12px 24px', fontSize: 13, color: T.textSub, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Cancel</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: T.textMut, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 6 }}>Title</p>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Letter to my son on graduation day"
                  style={{ width: '100%', background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '12px 14px', fontSize: 14, color: T.text, fontFamily: "'Plus Jakarta Sans',sans-serif", outline: 'none' }}
                  onFocus={(e) => (e.target.style.borderColor = BRAND.green)} onBlur={(e) => (e.target.style.borderColor = T.border)}/>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: T.textMut, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 6 }}>Message</p>
                <textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="Write your message here... it will be locked until the unlock date." rows={5}
                  style={{ width: '100%', background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '12px 14px', fontSize: 14, color: T.text, fontFamily: "'Plus Jakarta Sans',sans-serif", outline: 'none', resize: 'vertical' }}
                  onFocus={(e) => (e.target.style.borderColor = BRAND.green)} onBlur={(e) => (e.target.style.borderColor = T.border)}/>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: T.textMut, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 6 }}>Unlock date</p>
                <input type="datetime-local" value={form.unlock} onChange={(e) => setForm((f) => ({ ...f, unlock: e.target.value }))} min={new Date().toISOString().slice(0, 16)}
                  style={{ background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '12px 14px', fontSize: 14, color: T.text, fontFamily: "'Plus Jakarta Sans',sans-serif", outline: 'none', width: '100%' }}
                  onFocus={(e) => (e.target.style.borderColor = BRAND.green)} onBlur={(e) => (e.target.style.borderColor = T.border)}/>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: T.textMut, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Deliver to {!canTarget && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: BRAND.green, fontWeight: 700 }}><Crown size={11}/> Family</span>}
                </p>
                {canTarget ? (
                  <select
                    value={form.recipient_id}
                    onChange={(e) => setForm((f) => ({ ...f, recipient_id: e.target.value }))}
                    style={{ width: '100%', background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '12px 14px', fontSize: 14, color: T.text, fontFamily: "'Plus Jakarta Sans',sans-serif", outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="">Everyone with access</option>
                    {members.map((m) => (
                      <option key={m.member_id} value={m.member_id}>{m.member_name || m.member_email}</option>
                    ))}
                  </select>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: T.surface2, border: `1.5px dashed ${T.border}`, borderRadius: 12, padding: '12px 14px' }}>
                    <Lock size={14} color={T.textMut}/>
                    <p style={{ fontSize: 13, color: T.textMut, flex: 1 }}>Unlock capsules to a specific family member with the Family plan.</p>
                  </div>
                )}
              </div>
              {form.unlock && (
                <div style={{ background: `${BRAND.green}08`, border: `1.5px solid ${BRAND.green}25`, borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Lock size={13} color={BRAND.green}/>
                  <p style={{ fontSize: 13, color: T.textSub, fontWeight: 500 }}>
                    This capsule will unlock on <strong style={{ color: BRAND.green }}>{formatDate(form.unlock)}</strong>{canTarget && form.recipient_id ? <> for <strong style={{ color: BRAND.green }}>{members.find((m) => m.member_id === form.recipient_id)?.member_name || 'them'}</strong></> : null}
                  </p>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleLock} disabled={!form.title.trim() || !form.unlock}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                  style={{ background: saved ? `${BRAND.green}15` : (!form.title.trim() || !form.unlock) ? T.surface2 : `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})`, border: saved ? `1.5px solid ${BRAND.green}` : (!form.title.trim() || !form.unlock) ? `1.5px solid ${T.border}` : 'none', borderRadius: 12, padding: '12px 24px', fontSize: 13, fontWeight: 700, color: saved ? BRAND.green : (!form.title.trim() || !form.unlock) ? T.textMut : '#fff', cursor: (!form.title.trim() || !form.unlock) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Plus Jakarta Sans',sans-serif", transition: 'all .3s' }}>
                  {saved ? <><Check size={14}/> Locked</> : <><Lock size={13}/> Lock capsule</>}
                </button>
              </div>
            </div>
          </div>
        </FadeIn>
      )}

      {loading ? (
        <SkeletonGrid count={6} className="caps-grid" />
      ) : capsules.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '60px 0', color: T.textMut, fontSize: 14, fontWeight: 500 }}>No capsules yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }} className="caps-grid">
          {capsules.map((cap, i) => {
            const color = colorFor(cap.id, i);
            return (
              <FadeIn key={cap.id || i} delay={i * 50}>
                <div
                  onClick={() => cap.status === 'unlocked' && setSelected(cap)}
                  style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 18, padding: '20px 22px', cursor: cap.status === 'unlocked' ? 'pointer' : 'default', transition: 'all .2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.textMut; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 13, background: T.surface2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {cap.status === 'locked'
                        ? <Lock size={19} color={GREY} strokeWidth={1.8}/>
                        : <Unlock size={19} color={GREY} strokeWidth={1.8}/>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8, color: GREY, background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 100, padding: '2px 8px' }}>
                          {cap.status === 'locked' ? t.locked : t.unlocked}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: T.textMut, fontWeight: 500 }}>
                          <Calendar size={10}/> {formatDate(cap.unlock_date)}
                        </div>
                      </div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, lineHeight: 1.3, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 6 }}>{cap.title}</h3>
                      <p style={{ fontSize: 13, color: T.textMut, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {cap.status === 'locked'
                          ? <><Lock size={12} color={T.textMut}/> Content hidden until unlock date</>
                          : <><Unlock size={12} color={T.textMut}/> Tap to read</>}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      )}

      <style>{`@media(min-width:700px){ .caps-grid{grid-template-columns:repeat(2,1fr)!important} }`}</style>
    </div>
  );
}
