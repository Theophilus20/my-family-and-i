'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, Plus, X, ArrowLeft, Check, AlertCircle, Trash2, Pencil } from 'lucide-react';
import FadeIn from '@/components/FadeIn';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';
import { BRAND } from '@/lib/tokens';
import { api } from '@/lib/api';
import { useVault } from '@/context/VaultContext';
import { vaultRole, canEdit } from '@/lib/permissions';
import { SkeletonGrid } from '@/components/Skeleton';
import FeatureGate from '@/components/FeatureGate';

const CATS = ['All', 'Business', 'Relationships', 'Finance', 'Career', 'Parenting', 'Life'];
const COLORS = { Business: BRAND.green, Relationships: BRAND.lav, Finance: BRAND.lime, Career: BRAND.lav, Parenting: BRAND.green, Life: BRAND.gold };
const GREY = '#6B7280';
function fmt(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function WisdomInner() {
  const { T } = useTheme();
  const { t } = useLang();
  const { activeVault, isOwnerView } = useVault();
  const role = vaultRole(isOwnerView, activeVault);
  const editable = canEdit(role);
  const [cat, setCat] = useState('All');
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [newLesson, setNewLesson] = useState({ cat: 'Business', lesson: '', source: '' });
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  // Load from Aurora via the API on mount.
  useEffect(() => {
    let active = true;
    setLoading(true);
    api.getWisdom(undefined, isOwnerView ? null : activeVault?.id)
      .then((rows) => { if (active) { setLessons(rows); setError(null); } })
      .catch((e) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [activeVault?.id, isOwnerView]);

  const visible = cat === 'All' ? lessons : lessons.filter((d) => d.category === cat);
  const startEdit = (item) => {
    setNewLesson({ cat: item.category, lesson: item.lesson, source: item.source || '' });
    setEditingId(item.id);
    setShowAdd(true);
    setSelected(null);
  };
  const handleAdd = async () => {
    if (!newLesson.lesson.trim()) return;
    try {
      const payload = { category: newLesson.cat, lesson: newLesson.lesson, source: newLesson.source };
      if (editingId) {
        const row = await api.updateWisdom(editingId, payload);
        setLessons((l) => l.map((x) => (x.id === editingId ? row : x)));
      } else {
        const row = await api.createWisdom(payload);
        setLessons((l) => [row, ...l]);
      }
      setNewLesson({ cat: 'Business', lesson: '', source: '' });
      setEditingId(null);
      setSaved(true);
      setTimeout(() => { setSaved(false); setShowAdd(false); }, 1500);
    } catch (e) {
      setError(e.message);
    }
    
  };
  
  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await api.deleteWisdom(confirmDelete.id);
      setLessons((l) => l.filter((x) => x.id !== confirmDelete.id));
      setConfirmDelete(null);
      setSelected(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  if (selected) return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <button onClick={() => setSelected(null)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: T.textMut, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          <ArrowLeft size={16}/> Back to wisdom
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
            <Lightbulb size={22} color={GREY} strokeWidth={1.8}/>
          </div>
          <div>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8, color: GREY, background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 100, padding: '2px 8px' }}>{selected.category}</span>
            <p style={{ fontSize: 12, color: T.textMut, marginTop: 4, fontWeight: 500 }}>{fmt(selected.created_at)}</p>
          </div>
        </div>
        <p style={{ fontSize: 22, fontWeight: 700, color: T.text, lineHeight: 1.6, marginBottom: 20, fontStyle: 'italic', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>&ldquo;{selected.lesson}&rdquo;</p>
        <div style={{ padding: '14px 16px', background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 12 }}>
          <p style={{ fontSize: 12, color: T.textMut, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>Source</p>
          <p style={{ fontSize: 14, color: T.text, fontWeight: 500 }}>{selected.source}</p>
        </div>
      </div>

      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 24, padding: 32, maxWidth: 420, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: T.text, marginBottom: 10, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Delete this lesson?</h3>
            <p style={{ fontSize: 14, color: T.textMut, lineHeight: 1.6, marginBottom: 24 }}>
              This lesson will be permanently removed. This cannot be undone.
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

  return (
    <div>
      <FadeIn>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
          <div>
            <h2 style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: 800, color: T.text, marginBottom: 4, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.wisdom}</h2>
            <p style={{ fontSize: 14, color: T.textMut, fontWeight: 500 }}>{lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'} · {isOwnerView ? 'from your life' : `from ${activeVault?.name?.split(' ')[0] || 'their'}'s life`}</p>
          </div>
          {editable && (
            <button onClick={() => setShowAdd(true)}
              onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
              style={{ background: `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})`, border: 'none', borderRadius: 12, padding: '10px 20px', fontSize: 13, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', boxShadow: '0 4px 14px rgba(74,186,139,0.35)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              <Plus size={15}/> {t.log_wisdom}
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

      {showAdd && (
        <FadeIn>
          <div style={{ background: T.surface, border: `1.5px solid ${BRAND.green}40`, borderRadius: 20, padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: T.text, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Log a Wisdom</h3>
              <button onClick={() => setShowAdd(false)}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                  style={{ background: 'none', border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '12px 24px', fontSize: 13, color: T.textSub, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Cancel</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: T.textMut, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 8 }}>Category</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {CATS.filter((c) => c !== 'All').map((c) => (
                  <button key={c} onClick={() => setNewLesson((l) => ({ ...l, cat: c }))}
                      onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                      style={{ background: newLesson.cat === c ? BRAND.green : T.surface2, border: `1.5px solid ${newLesson.cat === c ? BRAND.green : T.border}`, borderRadius: 100, padding: '6px 14px', fontSize: 12, fontWeight: 700, color: newLesson.cat === c ? '#fff' : T.textSub, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", transition: 'all .2s' }}>{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: T.textMut, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 6 }}>The lesson</p>
                <textarea value={newLesson.lesson} onChange={(e) => setNewLesson((l) => ({ ...l, lesson: e.target.value }))} placeholder="Write the wisdom or lesson you learned..." rows={3} style={{ width: '100%', background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '12px 14px', fontSize: 14, color: T.text, fontFamily: "'Plus Jakarta Sans',sans-serif", outline: 'none', resize: 'vertical' }}
                  onFocus={(e) => (e.target.style.borderColor = BRAND.green)} onBlur={(e) => (e.target.style.borderColor = T.border)}/>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: T.textMut, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 6 }}>Source (optional)</p>
                <input value={newLesson.source} onChange={(e) => setNewLesson((l) => ({ ...l, source: e.target.value }))} placeholder="e.g. From a conversation with my father" style={{ width: '100%', background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '12px 14px', fontSize: 14, color: T.text, fontFamily: "'Plus Jakarta Sans',sans-serif", outline: 'none' }}
                  onFocus={(e) => (e.target.style.borderColor = BRAND.green)} onBlur={(e) => (e.target.style.borderColor = T.border)}/>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleAdd}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                  style={{ background: saved ? `${BRAND.green}15` : `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})`, border: saved ? `1.5px solid ${BRAND.green}` : 'none', borderRadius: 12, padding: '12px 24px', fontSize: 13, fontWeight: 700, color: saved ? BRAND.green : '#fff', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", transition: 'all .3s', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {saved ? <><Check size={14} color={BRAND.green}/> Saved</> : 'Save lesson'}
                </button>
      
              </div>
            </div>
          </div>
        </FadeIn>
      )}

      <FadeIn delay={60}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
              style={{ background: cat === c ? BRAND.green : T.surface, border: `1.5px solid ${cat === c ? BRAND.green : T.border}`, borderRadius: 100, padding: '7px 16px', fontSize: 12, fontWeight: cat === c ? 700 : 500, color: cat === c ? '#fff' : T.textSub, cursor: 'pointer', transition: 'all .2s', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{c}</button>
          ))}
        </div>
      </FadeIn>

      {loading ? (
        <SkeletonGrid count={6} className="wis-grid" />
      ) : visible.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '60px 0', color: T.textMut, fontSize: 14, fontWeight: 500 }}>No lessons yet. Add your first one.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }} className="wis-grid">
          {visible.map((item, i) => {
            const color = COLORS[item.category] || BRAND.green;
            return (
              <FadeIn key={item.id || i} delay={i * 40}>
                <div onClick={() => setSelected(item)} style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 16, padding: '20px 22px', transition: 'all .2s', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.textMut; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 11, background: T.surface2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <Lightbulb size={18} color={GREY} strokeWidth={1.8}/>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8, color: GREY, background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 100, padding: '3px 10px' }}>{item.category}</span>
                        <span style={{ fontSize: 11, color: T.textMut, fontWeight: 500 }}>{fmt(item.created_at)}</span>
                      </div>
                      <p style={{ fontSize: 14, color: T.text, lineHeight: 1.7, marginBottom: 10, fontStyle: 'italic', fontWeight: 500 }}>&ldquo;{item.lesson}&rdquo;</p>
                      <p style={{ fontSize: 12, color: T.textMut, fontWeight: 500 }}>From: {item.source}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      )}
     <style>{`@media(min-width:700px){ .wis-grid{grid-template-columns:repeat(2,1fr)!important} }`}</style>
    </div>
  );
}

export default function Wisdom() {
  return (
    <FeatureGate feature="wisdom">
      <WisdomInner />
    </FeatureGate>
  );
}