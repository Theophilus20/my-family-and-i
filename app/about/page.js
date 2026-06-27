'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Shield, Cpu, Users, ArrowRight } from 'lucide-react';
import FadeIn from '@/components/FadeIn';
import LottiePlayer from '@/components/LottiePlayer';
import { useTheme } from '@/context/ThemeContext';
import { BRAND, LOTTIE } from '@/lib/tokens';

const GREY = '#6B7280'; // Tailwind gray-500
const VALUES = [
  { Icon: Heart, title: 'Memory is love', desc: 'The stories we keep are how the people we love stay close. We build to protect that.' },
  { Icon: Shield, title: 'Privacy first', desc: 'Your life is yours. Your vault is private by default, shared only with those you invite.' },
  { Icon: Cpu, title: 'AI with integrity', desc: 'Our AI speaks only from what you actually recorded.' },
  { Icon: Users, title: 'Built for families', desc: 'Memories are meant to be shared. We make passing it on simple and meaningful.' },
];

export default function About() {
  const router = useRouter();
  const { T, isDark } = useTheme();

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      {/* Hero */}
      <section style={{ background: isDark ? '#0D0D0D' : '#F0F7F4', padding: '40px 24px 72px', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <button onClick={() => router.push('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: T.textMut, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 40, fontFamily: 'inherit' }}>
            <ArrowLeft size={16}/> Back home
          </button>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 48, alignItems: 'center' }} className="about-hero">
            <div>
              <FadeIn>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#fff', border: `1.5px solid ${T.border}`, borderRadius: 100, padding: '8px 18px', marginBottom: 24 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: GREY, letterSpacing: '.4px', textTransform: 'uppercase' }}>Our story</span>
                </div>
                <h1 style={{ fontSize: 'clamp(34px,6vw,58px)', fontWeight: 800, color: T.text, lineHeight: 1.08, letterSpacing: -1.5, marginBottom: 22 }}>
                  Helping every life<br/><span style={{ color: BRAND.green }}>be remembered</span>
                </h1>
                <p style={{ fontSize: 18, color: T.textSub, lineHeight: 1.8, maxWidth: 480 }}>
                  My Family and I began with a simple regret: too many stories are lost when the people who lived them are gone. We set out to build a place where memories, wisdom, and love can be preserved and passed on, intelligently and securely, for generations.
                </p>
              </FadeIn>
            </div>
            <FadeIn delay={150} style={{ width: '100%', maxWidth: 460, margin: '0 auto' }}>
              <div style={{ position: 'relative', aspectRatio: '1' }}>
                <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle,${BRAND.green}18 0%,transparent 70%)`, borderRadius: '50%', pointerEvents: 'none' }}/>
                <LottiePlayer src={LOTTIE.hero}/>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section style={{ padding: '80px 24px', background: T.bg }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <FadeIn>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: BRAND.green, marginBottom: 14 }}>Our mission</p>
            <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 800, color: T.text, lineHeight: 1.2, letterSpacing: -1, marginBottom: 20 }}>
              A story worth preserving deserves a place that lasts
            </h2>
            <p style={{ fontSize: 17, color: T.textSub, lineHeight: 1.85 }}>
              We combine secure cloud storage with thoughtful AI so that anyone, regardless of technical skill, can capture a lifetime of memories and share them with the people who matter most.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: '40px 24px 96px', background: T.surface2 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <FadeIn>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: BRAND.green, marginBottom: 12, textAlign: 'center' }}>What we believe</p>
            <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 800, color: T.text, lineHeight: 1.2, letterSpacing: -1, marginBottom: 52, textAlign: 'center' }}>
              The values behind everything we build
            </h2>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }} className="values-grid">
            {VALUES.map(({ Icon, title, desc }, i) => (
              <FadeIn key={title} delay={i * 60}>
                <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 20, padding: '28px 24px', height: '100%' }}>
                  <div style={{ width: 50, height: 50, borderRadius: 14, background: T.surface2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <Icon size={22} color={GREY} strokeWidth={1.8}/>
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 10 }}>{title}</h3>
                  <p style={{ fontSize: 14, color: T.textMut, lineHeight: 1.7 }}>{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', background: `linear-gradient(135deg,${BRAND.greenD},#0F2820)` }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <FadeIn>
            <h2 style={{ fontSize: 'clamp(26px,4vw,42px)', color: '#fff', lineHeight: 1.15, letterSpacing: -1, fontWeight: 800, marginBottom: 16 }}>Start preserving your story today</h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, marginBottom: 34 }}>Free to begin. Your memories are always yours.</p>
            <button onClick={() => router.push('/signup')} style={{ background: '#fff', border: 'none', borderRadius: 14, padding: '16px 40px', fontSize: 16, fontWeight: 800, color: BRAND.greenD, display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', fontFamily: 'inherit' }}>
              Get started free <ArrowRight size={18}/>
            </button>
          </FadeIn>
        </div>
      </section>

      <style>{`
        @media(min-width:860px){ .about-hero{grid-template-columns:1.1fr 1fr!important;gap:64px!important} }
        @media(min-width:600px){ .values-grid{grid-template-columns:repeat(2,1fr)!important} }
      `}</style>
    </div>
  );
}