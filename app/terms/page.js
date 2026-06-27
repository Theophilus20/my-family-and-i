'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { BRAND } from '@/lib/tokens';

const SECTIONS = [
  ['Acceptance of terms', 'By creating an account or using My Family and I, you agree to these Terms of Service. If you do not agree, please do not use the service.'],
  ['Your account', 'You are responsible for keeping your login credentials secure and for all activity under your account. You must provide accurate information and be old enough to form a binding contract in your jurisdiction.'],
  ['Your content', 'You retain ownership of the memories, photos, lessons, and other material you upload. You grant My Family and I the limited rights needed to store, process, and display that content to you and the family members you authorize, including AI processing to generate features you use.'],
  ['Acceptable use', 'You agree not to upload unlawful content, infringe others’ rights, or attempt to disrupt or gain unauthorized access to the service. We may suspend accounts that violate these terms.'],
  ['Subscriptions and billing', 'Paid plans renew automatically each billing period until cancelled. You can cancel anytime; access continues until the end of the current period. Prices are shown at checkout and may change with notice.'],
  ['AI features', 'AI-generated content is produced from your own recorded material and is provided as-is. It may contain inaccuracies and should not be relied upon as professional, legal, medical, or financial advice.'],
  ['Termination', 'You may delete your account at any time. We may suspend or terminate access for violations of these terms. On deletion, your stored content is permanently removed.'],
  ['Disclaimer', 'My Family and I is provided on an “as available” basis without warranties of any kind. We are not liable for loss of data or indirect damages to the extent permitted by law.'],
  ['Contact', 'Questions about these terms can be sent through the Contact page.'],
];

export default function Terms() {
  const router = useRouter();
  const { T } = useTheme();
  return (
    <div style={{ minHeight: '100vh', background: T.bg, padding: '40px 24px', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <button onClick={() => router.back()} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: T.textMut, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 28, fontFamily: 'inherit' }}>
          <ArrowLeft size={16}/> Back
        </button>
        <h1 style={{ fontSize: 'clamp(28px,5vw,42px)', fontWeight: 800, color: T.text, marginBottom: 8, letterSpacing: -1 }}>Terms of Service</h1>
        <p style={{ fontSize: 14, color: T.textMut, marginBottom: 40 }}>Last updated: June 2026</p>
        {SECTIONS.map(([title, body], i) => (
          <div key={i} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 10 }}>{title}</h2>
            <p style={{ fontSize: 15, color: T.textSub, lineHeight: 1.8 }}>{body}</p>
          </div>
        ))}
        <p style={{ fontSize: 13, color: T.textMut, marginTop: 40, paddingTop: 24, borderTop: `1px solid ${T.border}` }}>
          These terms are provided for a demonstration.
        </p>
      </div>
    </div>
  );
}
