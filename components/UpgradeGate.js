'use client';

import { useRouter } from 'next/navigation';
import { Lock, ArrowRight } from 'lucide-react';
import LottiePlayer from '@/components/LottiePlayer';
import { useTheme } from '@/context/ThemeContext';
import { BRAND, LOTTIE } from '@/lib/tokens';

export default function UpgradeGate({ title, desc, perks = [] }) {
  const router = useRouter();
  const { T } = useTheme();
  return (
    <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 20, padding: '40px 28px', textAlign: 'center', maxWidth: 520, margin: '0 auto' }}>
      <div style={{ width: 96, height: 96, margin: '0 auto 16px' }}>
        <LottiePlayer src={LOTTIE.family}/>
      </div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 100, padding: '4px 12px', marginBottom: 14 }}>
        <Lock size={11} color={T.textMut}/>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.textMut, textTransform: 'uppercase', letterSpacing: .5 }}>Family plan</span>
      </div>
      <h3 style={{ fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 10, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{title}</h3>
      <p style={{ fontSize: 14, color: T.textMut, lineHeight: 1.65, marginBottom: 22, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>{desc}</p>
      {perks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 320, margin: '0 auto 26px', textAlign: 'left' }}>
          {perks.map((p) => (
            <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: T.surface2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#9CA3AF' }}/>
              </div>
              <span style={{ fontSize: 13, color: T.textSub, fontWeight: 500 }}>{p}</span>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => router.push('/dashboard/billing')} style={{ background: `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})`, border: 'none', borderRadius: 12, padding: '13px 28px', fontSize: 14, fontWeight: 700, color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', boxShadow: '0 4px 14px rgba(74,186,139,0.35)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
        Upgrade to Family <ArrowRight size={15}/>
      </button>
    </div>
  );
}