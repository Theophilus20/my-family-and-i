'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';
import { LANGUAGES } from '@/lib/tokens';

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const { T } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen((o) => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 7, background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 10, padding: '7px 12px', fontSize: 13, fontWeight: 500, color: T.textSub, cursor: 'pointer', transition: 'all .15s' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = T.hover; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = T.surface2; }}
      >
        <Globe size={14} color={T.textMut}/>
        <span className="hide-mob">{current.label}</span>
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 6, zIndex: 999, minWidth: 190, maxHeight: 340, overflowY: 'auto', boxShadow: '0 12px 32px rgba(0,0,0,0.10)' }}>
          {LANGUAGES.map((l) => {
            const active = lang === l.code;
            return (
              <button key={l.code} onClick={() => { setLang(l.code); setOpen(false); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, border: 'none', background: active ? T.hover : 'transparent', color: active ? T.text : T.textSub, fontSize: 13, fontWeight: active ? 600 : 500, cursor: 'pointer', textAlign: 'left', transition: 'background .12s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = T.hover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = active ? T.hover : 'transparent')}
              >
                {l.label}
                {active && <Check size={13} color="#4ABA8B" style={{ marginLeft: 'auto' }}/>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
