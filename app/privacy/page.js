'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { BRAND } from '@/lib/tokens';

const SECTIONS = [
  ['Information we collect', 'When you create a My Family and I account, we collect your name, email address, and the content you choose to store memories, photos, life lessons, time capsules, and biographical details. We also store account settings and, for paid plans, billing metadata processed through our payment provider.'],
  ['How we use your information', 'We use your information to operate your My Family and I vault, generate AI-assisted content from material you provide, deliver time capsules, enable family sharing you explicitly set up, and process subscriptions. We do not sell your personal data.'],
  ['AI processing', 'AI features (the Biographer and Digital Personality) generate content strictly from the memories and lessons you record. Responses are clearly labeled as AI-generated and are grounded only in your own stored material.'],
  ['Data sharing', 'Your vault is private by default. Content is shared only with family members you personally invite, and only at the access level you assign. We use trusted third-party services for hosting, email, and payments, which process data on our behalf under their own safeguards.'],
  ['Data security', 'Data is transmitted over encrypted connections and stored in a managed cloud database. We restrict access to your data and take reasonable measures to protect it, though no system can guarantee absolute security.'],
  ['Your rights', 'You can access, edit, or delete your content at any time from your account. You may delete your account entirely, which permanently removes your stored memories, capsules, wisdom, and biography.'],
  ['Contact', 'For privacy questions or data requests, reach us through the Contact page.'],
];

export default function Privacy() {
  const router = useRouter();
  const { T } = useTheme();
  return (
    <div style={{ minHeight: '100vh', background: T.bg, padding: '40px 24px', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <button onClick={() => router.back()} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: T.textMut, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 28, fontFamily: 'inherit' }}>
          <ArrowLeft size={16}/> Back
        </button>
        <h1 style={{ fontSize: 'clamp(28px,5vw,42px)', fontWeight: 800, color: T.text, marginBottom: 8, letterSpacing: -1 }}>Privacy Policy</h1>
        <p style={{ fontSize: 14, color: T.textMut, marginBottom: 40 }}>Last updated: June 2026</p>
        {SECTIONS.map(([title, body], i) => (
          <div key={i} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 10 }}>{title}</h2>
            <p style={{ fontSize: 15, color: T.textSub, lineHeight: 1.8 }}>{body}</p>
          </div>
        ))}
        <p style={{ fontSize: 13, color: T.textMut, marginTop: 40, paddingTop: 24, borderTop: `1px solid ${T.border}` }}>
          This policy is provided for a demonstration.
        </p>
      </div>
    </div>
  );
}
