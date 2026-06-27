'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Brain, Clock, Lightbulb, ArrowRight, TrendingUp } from 'lucide-react';
import FadeIn from '@/components/FadeIn';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';
import { BRAND } from '@/lib/tokens';
import { api } from '@/lib/api';
import { useVault } from '@/context/VaultContext';
import { SkeletonBox, SkeletonGrid } from '@/components/Skeleton';

const GREY = '#6B7280';
const SCORE_FILL = '#2F6B52';
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};


function Ring({ pct, size = 120, stroke = 9 }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(47,107,82,0.12)" strokeWidth={stroke}/>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={SCORE_FILL} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1)' }}/>
    </svg>
  );
}

function Card({ children, style = {}, ...rest }) {
  const { T } = useTheme();
  return (
    <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 20, ...style }} {...rest}>
      {children}
    </div>
  );
}

export default function Overview() {
  const router = useRouter();
  const { T } = useTheme();
  const { t } = useLang();
  const { activeVault, isOwnerView } = useVault();
  const vaultId = isOwnerView ? null : activeVault?.id;

  const [counts, setCounts] = useState({ memories: 0, capsules: 0, wisdom: 0, chapters: 0 });
  const [memTypes, setMemTypes] = useState({ story: 0, photo: 0 });
  const [recent, setRecent] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(true);

  // Name: own account when on your vault, otherwise the vault owner's name.
  useEffect(() => {
    let active = true;
    if (isOwnerView) {
      fetch('/api/auth/me')
        .then((r) => r.json())
        .then((d) => { if (active && d.user?.name) setFirstName(d.user.name.split(' ')[0]); })
        .catch(() => {});
    } else {
      setFirstName((activeVault?.name || '').split(' ')[0]);
    }
    return () => { active = false; };
  }, [activeVault?.id, isOwnerView]);

  // Data: pull from the active vault (Theo's when viewing his).
  useEffect(() => {
    let active = true;
    Promise.all([
      api.getMemories(undefined, vaultId).catch(() => []),
      api.getCapsules(vaultId).catch(() => []),
      api.getWisdom(undefined, vaultId).catch(() => []),
      api.getChapters(vaultId).catch(() => []),
    ]).then(([mem, caps, wis, chaps]) => {
      if (!active) return;
      setCounts({ memories: mem.length, capsules: caps.length, wisdom: wis.length, chapters: chaps.length });
      setMemTypes({
        story: mem.filter((m) => m.type === 'Story' || m.type === 'Letter' || m.type === 'Lesson').length,
        photo: mem.filter((m) => m.type === 'Photo').length,
      });
      setRecent(mem.slice(0, 4).map((m) => ({
        id: m.id,
        type: m.type,
        title: m.title,
        date: new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        Icon: m.type === 'Lesson' ? Lightbulb : m.type === 'Letter' ? Clock : BookOpen,
      })));
      setLoading(false);
    });
    return () => { active = false; };
  }, [activeVault?.id, isOwnerView]);

  const pctOf = (n, target) => Math.min(100, Math.round((n / target) * 100));
  const SCORES = [
    { label: 'Stories',      pct: pctOf(memTypes.story, 10) },
    { label: 'Photos',       pct: pctOf(memTypes.photo, 10) },
    { label: 'Life Lessons', pct: pctOf(counts.wisdom, 10) },
    { label: 'Capsules',     pct: pctOf(counts.capsules, 5) },
  ];
  const overall = Math.round(SCORES.reduce((s, i) => s + i.pct, 0) / SCORES.length);

  const ACTIONS = [
    { Icon: BookOpen,  label: t.add_memory,   path: '/dashboard/vault' },
    { Icon: Brain,     label: t.generate_bio, path: '/dashboard/biographer' },
    { Icon: Clock,     label: t.new_capsule,  path: '/dashboard/capsules' },
    { Icon: Lightbulb, label: t.log_wisdom,   path: '/dashboard/wisdom' },
  ];

  const STAT_TILES = [
    [String(counts.memories), t.memory_vault, BookOpen],
    [String(counts.capsules), t.capsules, Clock],
    [String(counts.wisdom), t.wisdom, Lightbulb],
    [String(counts.chapters), t.ai_biographer, Brain],
  ];

  const greetingName = isOwnerView ? firstName : (activeVault?.name?.split(' ')[0] || firstName);

  // Navigate to a specific memory in the vault
  const handleMemoryClick = (memoryId) => {
    // Store the memory ID in session storage so MemoryVault can open it
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedMemoryId', memoryId);
    }
    router.push('/dashboard/vault');
  };

  return (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
    <FadeIn>
      <div>
        <h1 style={{ fontSize: 'clamp(22px,4vw,30px)', fontWeight: 800, color: T.text, marginBottom: 4 }}>
          {isOwnerView ? (firstName ? `${t.greeting}, ${firstName}` : '\u00A0') : `${greetingName ? `${greetingName}'s` : 'Legacy'}`}
        </h1>

        <p style={{ fontSize: 14, color: T.textMut }}>
          {isOwnerView ? (firstName ? t.tagline : '\u00A0') : 'Viewing this legacy'}
        </p>
      </div>
    </FadeIn>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SkeletonBox height={180} radius={20} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }} className="ov-stats">
            {[0,1,2,3].map((i) => <SkeletonBox key={i} height={110} radius={20} />)}
          </div>
          <SkeletonBox height={220} radius={20} />
        </div>
      ) : (
        <>
        <FadeIn delay={60}>
          <Card style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Ring pct={overall}/>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: T.text, lineHeight: 1 }}>{overall}%</span>
                <span style={{ fontSize: 10, color: T.textMut, marginTop: 2, fontWeight: 500 }}>{t.complete}</span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <TrendingUp size={15} color={SCORE_FILL}/>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{t.My_Family_and_I_score}</span>
              </div>
              {SCORES.map(({ label, pct }) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: T.textMut, marginBottom: 5, fontWeight: 500 }}>
                    <span>{label}</span><span style={{ fontWeight: 700, color: T.text }}>{pct}%</span>
                  </div>
                  <div style={{ height: 6, background: T.surface2, borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ height: 6, width: `${pct}%`, background: SCORE_FILL, borderRadius: 100, transition: 'width 1.2s cubic-bezier(.4,0,.2,1)' }}/>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }} className="ov-stats">
          {STAT_TILES.map(([n, l, Icon], i) => (
            <FadeIn key={l} delay={80 + i * 40}>
              <Card style={{ padding: '20px 18px', cursor: 'pointer', transition: 'transform .2s, box-shadow .2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: T.surface2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icon size={18} color={GREY} strokeWidth={1.8}/>
                </div>
                <div style={{ fontSize: 30, fontWeight: 800, color: T.text, lineHeight: 1, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{n}</div>
                <div style={{ fontSize: 12, color: T.textMut, marginTop: 4, fontWeight: 500 }}>{l}</div>
              </Card>
            </FadeIn>
          ))}
        </div>
            <FadeIn delay={160}>
        <p style={{ fontSize: 11, fontWeight: 700, color: T.textMut, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12 }}>{t.quick_actions}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }} className="ov-actions">
          {ACTIONS.map(({ Icon, label, path }) => (
            <button key={label} onClick={() => router.push(path)}
              style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: '15px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'all .2s', textAlign: 'left' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = GREY; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: T.surface2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={17} color={GREY} strokeWidth={1.8}/>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{label}</span>
              <ArrowRight size={13} color={T.textMut} style={{ marginLeft: 'auto' }}/>
            </button>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={220}>
        <Card>
          <div style={{ padding: '18px 22px', borderBottom: `1.5px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{t.recent_memories}</p>
            <button onClick={() => router.push('/dashboard/vault')} style={{ background: 'none', border: 'none', fontSize: 12, color: SCORE_FILL, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              {t.view_all} <ArrowRight size={12}/>
            </button>
          </div>
          {recent.length === 0 ? (
            <div style={{ padding: '28px 22px', color: T.textMut, fontSize: 13 }}>No memories yet.</div>
          ) : recent.map(({ id, type, title, date, Icon }, i) => (
            <div key={id} onClick={() => handleMemoryClick(id)} style={{ padding: '14px 22px', borderBottom: i < recent.length - 1 ? `1px solid ${T.border}` : 'none', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'background .15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = T.hover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: T.surface2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} color={GREY} strokeWidth={1.8}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</p>
                <p style={{ fontSize: 11, color: T.textMut, marginTop: 2 }}>{type} · {date}</p>
              </div>
              <ArrowRight size={13} color={T.textMut} style={{ flexShrink: 0 }}/>
            </div>
          ))}
        </Card>
      </FadeIn>

        </>
      )}

      <style>{`
        @media(min-width:900px){ .ov-top{grid-template-columns:1fr 1fr!important} }
        @media(min-width:600px){ .ov-stats{grid-template-columns:repeat(4,1fr)!important} .ov-actions{grid-template-columns:repeat(4,1fr)!important} }
      `}</style>
    </div>
  );
}
