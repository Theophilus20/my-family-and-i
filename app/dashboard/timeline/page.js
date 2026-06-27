'use client';

import { useState, useEffect } from 'react';
import { Calendar, AlertCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import FadeIn from '@/components/FadeIn';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';
import { BRAND } from '@/lib/tokens';
import { api } from '@/lib/api';
import { useVault } from '@/context/VaultContext';
import { SkeletonGrid } from '@/components/Skeleton';

const DARK_GREEN = '#2F6B52';

export default function Timeline() {
  const { T } = useTheme();
  const { t } = useLang();
  const { activeVault, isOwnerView } = useVault();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [notice, setNotice] = useState('');
  const [openId, setOpenId] = useState(null);

  const loadTimeline = () =>
    api.getTimeline(isOwnerView ? null : activeVault?.id)
      .then((rows) => { setEvents(rows); setError(null); })
      .catch((e) => setError(e.message));

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.getTimeline(isOwnerView ? null : activeVault?.id)
      .then((rows) => { if (active) { setEvents(rows); setError(null); } })
      .catch((e) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [activeVault?.id, isOwnerView]);

  const handleExtract = async () => {
    setExtracting(true);
    setError(null);
    setNotice('');
    try {
      const { added } = await api.extractTimeline();
      await loadTimeline();
      setNotice(added > 0 ? `Added ${added} event${added === 1 ? '' : 's'} from your memories.` : 'No new dated events found in your memories yet.');
    } catch (e) {
      setError(e.message);
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div>
      <FadeIn>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 36 }}>
          <div>
            <h2 style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: 800, color: T.text, marginBottom: 4, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.timeline}</h2>
            <p style={{ fontSize: 14, color: T.textMut, fontWeight: 500 }}>{isOwnerView ? 'Your life, organized by year · AI-extracted from your memories' : `${activeVault?.name?.split(' ')[0] || 'Their'}'s life, organized by year · AI-extracted from their memories`}</p>
          </div>
          {isOwnerView && (
            <button onClick={handleExtract} disabled={extracting} style={{ background: `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})`, border: 'none', borderRadius: 12, padding: '11px 18px', fontSize: 13, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8, cursor: extracting ? 'default' : 'pointer', opacity: extracting ? 0.8 : 1, fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: '0 4px 14px rgba(74,186,139,0.35)' }}>
              {extracting
                ? <><span style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite' }}/> Extracting…</>
                : 'Extract from memories'}
            </button>
          )}
        </div>
      </FadeIn>

      {notice && (
        <div style={{ background: `${BRAND.green}12`, border: `1.5px solid ${BRAND.green}33`, borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sparkles size={15} color={BRAND.green}/>
          <p style={{ fontSize: 13, color: T.textSub, fontWeight: 500 }}>{notice}</p>
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(255,80,80,0.08)', border: '1.5px solid rgba(255,80,80,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={15} color="#FF5050"/>
          <p style={{ fontSize: 13, color: '#FF5050' }}>{error}</p>
        </div>
      )}

      {loading ? (
        <SkeletonGrid count={5} />
      ) : events.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '60px 0', color: T.textMut, fontSize: 14, fontWeight: 500 }}>No events yet. Add some memories, then click &quot;Extract from memories&quot;.</p>
      ) : (
        <div style={{ position: 'relative', paddingLeft: 32 }}>
          <div style={{ position: 'absolute', left: 9, top: 8, bottom: 8, width: 2, background: DARK_GREEN, borderRadius: 2, opacity: .35 }}/>
          {events.map(({ year, items }, yi) => (
            <FadeIn key={year} delay={yi * 70}>
              <div style={{ position: 'relative', marginBottom: 36 }}>
                <div style={{ position: 'absolute', left: -29, top: 8, width: 14, height: 14, borderRadius: '50%', background: DARK_GREEN, border: `3px solid ${T.bg}`, boxShadow: `0 0 0 3px ${DARK_GREEN}40` }}/>
                <div style={{ fontSize: 24, fontWeight: 800, color: DARK_GREEN, marginBottom: 12, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{year}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {items.map((ev, i) => {
                    const key = ev.id || `${year}-${i}`;
                    const isOpen = openId === key;
                    return (
                      <div key={key} onClick={() => setOpenId(isOpen ? null : key)}
                        style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 16, padding: '16px 20px', transition: 'all .2s', cursor: 'pointer' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = T.hover; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = T.surface; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Calendar size={13} color={DARK_GREEN} strokeWidth={1.8}/>
                          <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: "'Plus Jakarta Sans',sans-serif", flex: 1 }}>{ev.title}</h3>
                          {isOpen ? <ChevronUp size={15} color={T.textMut}/> : <ChevronDown size={15} color={T.textMut}/>}
                        </div>
                        {isOpen && (
                          <p style={{ fontSize: 13, color: T.textSub, lineHeight: 1.7, fontWeight: 400, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>{ev.description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}