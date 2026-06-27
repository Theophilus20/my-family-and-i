'use client';

import { useState, useEffect } from 'react';
import { Brain, BookOpen, ChevronDown, ChevronUp, AlertCircle, Copy, Check, Trash2 } from 'lucide-react';
import FadeIn from '@/components/FadeIn';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';
import { BRAND } from '@/lib/tokens';
import { api } from '@/lib/api';
import { SkeletonGrid } from '@/components/Skeleton';
import FeatureGate from '@/components/FeatureGate';

const GREY = '#6B7280';

const hover = {
  onMouseEnter: (e) => { e.currentTarget.style.filter = 'brightness(0.9)'; },
  onMouseLeave: (e) => { e.currentTarget.style.filter = 'brightness(1)'; },
};

function BiographerInner() {
  const { T } = useTheme();
  const { t } = useLang();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.getChapters()
      .then((rows) => { if (active) { setChapters(rows); setOpen(rows[0]?.chapter_num ?? null); setError(null); } })
      .catch((e) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleGenerate = () => {
    if (generating) return;
    setGenerating(true);
    setDone(false);
    setProgress(0);

    const steps = [10, 25, 45, 60, 75, 88, 95, 100];
    steps.forEach((p, i) => {
      setTimeout(() => {
        setProgress(p);
        if (p === 100) {
          setTimeout(async () => {
            try {
              const row = await api.generateChapter();
              setChapters((c) => [...c, row]);
              setOpen(row.chapter_num);
              setDone(true);
            } catch (e) {
              setError(e.message);
            } finally {
              setGenerating(false);
              setProgress(0);
              setTimeout(() => setDone(false), 3000);
            }
          }, 600);
        }
      }, i * 400);
    });
  };

  const handleCopy = (ch) => {
    const lessons = Array.isArray(ch.lessons) ? ch.lessons : [];
    const text = `Chapter ${ch.chapter_num}: ${ch.title}${ch.years ? ` (${ch.years})` : ''}\n\n${ch.summary}${lessons.length ? `\n\nKey lessons:\n${lessons.map((l) => `• ${l}`).join('\n')}` : ''}`;
    navigator.clipboard?.writeText(text);
    setCopiedId(ch.id || ch.chapter_num);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await api.deleteChapter(confirmDelete.id);
      setChapters((c) => c.filter((x) => x.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const complete = chapters.length;

  return (
    <div>
      <FadeIn>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: 800, color: T.text, marginBottom: 4, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.ai_biographer}</h2>
            <p style={{ fontSize: 14, color: T.textMut, fontWeight: 500 }}>{complete} chapters complete</p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            onMouseEnter={(e) => { if (!generating) e.currentTarget.style.filter = 'brightness(0.9)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
            style={{ background: done ? `${BRAND.green}15` : generating ? T.surface2 : `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})`, border: done ? `1.5px solid ${BRAND.green}` : generating ? `1.5px solid ${T.border}` : 'none', borderRadius: 12, padding: '10px 20px', fontSize: 13, fontWeight: 700, color: done ? BRAND.green : generating ? T.textMut : '#fff', display: 'flex', alignItems: 'center', gap: 8, cursor: generating ? 'not-allowed' : 'pointer', boxShadow: (!generating && !done) ? '0 4px 14px rgba(74,186,139,0.35)' : 'none', fontFamily: "'Plus Jakarta Sans',sans-serif", transition: 'all .3s' }}>
            {done
              ? 'Chapter generated'
              : generating
                ? <><span style={{ width: 14, height: 14, border: `2px solid ${T.textMut}`, borderTopColor: BRAND.green, borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'block' }}/> Generating...</>
                : 'Generate chapter'}
          </button>
        </div>
      </FadeIn>

      {error && (
        <div style={{ background: 'rgba(255,80,80,0.08)', border: '1.5px solid rgba(255,80,80,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={15} color="#FF5050"/>
          <p style={{ fontSize: 13, color: '#FF5050' }}>{error}</p>
        </div>
      )}

      {generating && (
        <FadeIn>
          <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 16, padding: '20px 22px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Brain size={16} color={GREY}/>
                <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>AI is reading your memories...</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: BRAND.green }}>{progress}%</span>
            </div>
            <div style={{ height: 6, background: T.surface2, borderRadius: 100, overflow: 'hidden' }}>
              <div style={{ height: 6, width: `${progress}%`, background: `linear-gradient(90deg,${BRAND.green},${BRAND.lime})`, borderRadius: 100, transition: 'width .4s ease' }}/>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
              {['Reading memories', 'Finding themes', 'Writing draft', 'Polishing'].map((step, i) => (
                <span key={step} style={{ fontSize: 11, color: progress > i * 25 ? BRAND.green : T.textMut, fontWeight: progress > i * 25 ? 600 : 400, transition: 'color .3s' }}>{step}</span>
              ))}
            </div>
          </div>
        </FadeIn>
      )}

      <FadeIn delay={60}>
        <div style={{ background: `${BRAND.green}08`, border: `1.5px solid ${BRAND.green}25`, borderRadius: 14, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Brain size={16} color={GREY} strokeWidth={1.8}/>
          <p style={{ fontSize: 13, color: T.textSub, lineHeight: 1.55, fontWeight: 500 }}>All content is AI-generated from your stored memories nothing is assumed.</p>
        </div>
      </FadeIn>

      {loading ? (
        <SkeletonGrid count={3} />
      ) : chapters.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '60px 0', color: T.textMut, fontSize: 14, fontWeight: 500 }}>No chapters yet. Generate your first one.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {chapters.map((ch, i) => {
            const isOpen = open === ch.chapter_num;
            const lessons = Array.isArray(ch.lessons) ? ch.lessons : [];
            const isCopied = copiedId === (ch.id || ch.chapter_num);
            return (
              <FadeIn key={ch.id || ch.chapter_num} delay={i * 60}>
                <div style={{ background: T.surface, border: `1.5px solid ${isOpen ? `${BRAND.green}50` : T.border}`, borderRadius: 18, overflow: 'hidden', transition: 'all .2s', boxShadow: isOpen ? `0 4px 20px ${BRAND.green}12` : 'none' }}>
                  <button
                    onClick={() => setOpen(isOpen ? null : ch.chapter_num)}
                    style={{ width: '100%', padding: '18px 22px', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: T.surface2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BookOpen size={17} color={GREY} strokeWidth={1.8}/>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8, color: BRAND.green }}>Chapter {ch.chapter_num}</span>
                        <span style={{ fontSize: 11, color: T.textMut, fontWeight: 500 }}>{ch.years}</span>
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, marginTop: 3, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{ch.title}</h3>
                    </div>
                    {isOpen ? <ChevronUp size={16} color={GREY}/> : <ChevronDown size={16} color={GREY}/>}
                  </button>

                  {isOpen && (
                    <div style={{ padding: '0 22px 22px', borderTop: `1px solid ${T.border}`, paddingTop: 18 }}>
                      <p style={{ fontSize: 14, color: T.textSub, lineHeight: 1.78, marginBottom: 20 }}>{ch.summary}</p>
                      {lessons.length > 0 && (
                        <>
                          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: BRAND.green, marginBottom: 12 }}>Key lessons</p>
                          {lessons.map((l) => (
                            <div key={l} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                              <span style={{ width: 7, height: 7, borderRadius: '50%', background: BRAND.green, flexShrink: 0, marginTop: 6 }}/>
                              <p style={{ fontSize: 13, color: T.text, lineHeight: 1.6, fontWeight: 500 }}>{l}</p>
                            </div>
                          ))}
                        </>
                      )}
                      <div style={{ display: 'flex', gap: 8, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
                        <button onClick={() => handleCopy(ch)}
                          onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: '8px 14px', color: isCopied ? BRAND.green : T.textSub, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                          {isCopied ? <><Check size={14}/> Copied</> : <><Copy size={14} color={GREY}/> Copy text</>}
                        </button>
                        <button onClick={() => setConfirmDelete(ch)}
                          onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,80,80,0.08)', border: '1.5px solid rgba(255,80,80,0.25)', borderRadius: 10, padding: '8px 14px', color: '#FF5050', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                          <Trash2 size={14}/> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </FadeIn>
            );
          })}
        </div>
      )}

      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 24, padding: 32, maxWidth: 420, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: T.text, marginBottom: 10, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Delete this chapter?</h3>
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
export default function Biographer() {
  return (
    <FeatureGate feature="biographer">
      <BiographerInner />
    </FeatureGate>
  );
}