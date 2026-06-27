'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark, setIsDark, T } = useTheme();
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  if (pathname.startsWith('/dashboard')) return null;
  if (pathname === '/login' || pathname === '/signup') return null;

  const scrollTo = (id) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const linkStyle = { background: 'none', border: 'none', color: T.textSub, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", transition: 'color .2s' };

  return (
    <>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', background: isDark ? 'rgba(13,13,13,0.97)' : 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${T.border}` }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <img src="/family2.png" alt="My Family and I" style={{ height: 60, width: 'auto' }} />
        </button>

        <div className="hide-mob" style={{ gap: 32, alignItems: 'center', display: 'flex' }}>
          <button onClick={() => scrollTo('features')} style={linkStyle} onMouseEnter={(e) => (e.currentTarget.style.color = '#4ABA8B')} onMouseLeave={(e) => (e.currentTarget.style.color = T.textSub)}>{t.nav_features}</button>
          <button onClick={() => scrollTo('pricing')} style={linkStyle} onMouseEnter={(e) => (e.currentTarget.style.color = '#4ABA8B')} onMouseLeave={(e) => (e.currentTarget.style.color = T.textSub)}>{t.nav_pricing}</button>
          <button onClick={() => scrollTo('how')} style={linkStyle} onMouseEnter={(e) => (e.currentTarget.style.color = '#4ABA8B')} onMouseLeave={(e) => (e.currentTarget.style.color = T.textSub)}>{t.nav_family}</button>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                   <button onClick={() => setIsDark((d) => !d)} style={{ background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: '7px 10px', display: 'flex', alignItems: 'center', color: T.textMut, cursor: 'pointer', transition: 'all .15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4ABA8B'; e.currentTarget.style.color = '#4ABA8B'; e.currentTarget.style.background = 'rgba(74,186,139,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMut; e.currentTarget.style.background = T.surface2; }}>
            {isDark ? <Sun size={15}/> : <Moon size={15}/>}
          </button>
          <button onClick={() => router.push('/login')} className="hide-mob" style={{ background: 'none', border: `1.5px solid ${T.border}`, borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 500, color: T.textSub, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", transition: 'all .2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4ABA8B'; e.currentTarget.style.color = '#4ABA8B'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSub; }}>
            {t.login}
          </button>
          <button onClick={() => router.push('/signup')} style={{ background: '#4ABA8B', border: 'none', borderRadius: 10, padding: '9px 20px', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', boxShadow: '0 4px 14px rgba(74,186,139,0.35)', fontFamily: "'Plus Jakarta Sans',sans-serif", transition: 'all .2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#3A9A72'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#4ABA8B'; }}>
            {t.signup}
          </button>
          <button onClick={() => setOpen((o) => !o)} className="show-mob" style={{ background: 'none', border: 'none', color: T.textMut, padding: 4, display: 'none' }}>
            {open ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </nav>

      {open && (
        <div style={{ position: 'fixed', top: 62, left: 0, right: 0, zIndex: 199, background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button onClick={() => scrollTo('features')} style={{ background: 'none', border: 'none', color: T.text, fontSize: 15, textAlign: 'left', padding: '13px 0', borderBottom: `1px solid ${T.border}`, fontWeight: 500, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.nav_features}</button>
          <button onClick={() => scrollTo('pricing')} style={{ background: 'none', border: 'none', color: T.text, fontSize: 15, textAlign: 'left', padding: '13px 0', borderBottom: `1px solid ${T.border}`, fontWeight: 500, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.nav_pricing}</button>
          <button onClick={() => scrollTo('how')} style={{ background: 'none', border: 'none', color: T.text, fontSize: 15, textAlign: 'left', padding: '13px 0', borderBottom: `1px solid ${T.border}`, fontWeight: 500, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.nav_family}</button>
          <button onClick={() => { router.push('/login'); setOpen(false); }} style={{ marginTop: 10, background: 'none', border: `1.5px solid ${T.border}`, borderRadius: 12, padding: 13, fontSize: 14, color: T.text, fontWeight: 500, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.login}</button>
          <button onClick={() => { router.push('/signup'); setOpen(false); }} style={{ background: '#4ABA8B', border: 'none', borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.signup}</button>
        </div>
      )}
    </>
  );
}
