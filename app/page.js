'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Shield, Heart, Zap, Lock,
  Brain, BookOpen, Clock, Lightbulb, Calendar,
  TreePine, MessageSquare, Users, ChevronRight, Check, Sparkles, Send,
  Instagram, Facebook,
} from 'lucide-react';
import FadeIn from '@/components/FadeIn';
import LottiePlayer from '@/components/LottiePlayer';
import Nav from '@/components/Nav';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';
import { BRAND, LOTTIE } from '@/lib/tokens';


function Hero() {
  const router = useRouter();
  const { T, isDark } = useTheme();
  const { t } = useLang();

  const PHRASES = ['Preserve what matters most', 'Capture every memory', 'Pass on your wisdom', 'Keep their voice forever'];
  const [typed, setTyped] = useState('');
  const [pi, setPi] = useState(0);
  const [del, setDel] = useState(false);

  useEffect(() => {
    const full = PHRASES[pi];
    let timeout;
    if (!del && typed === full) {
      timeout = setTimeout(() => setDel(true), 1600);
    } else if (del && typed === '') {
      setDel(false);
      setPi((p) => (p + 1) % PHRASES.length);
    } else {
      timeout = setTimeout(() => {
        setTyped(full.slice(0, del ? typed.length - 1 : typed.length + 1));
      }, del ? 40 : 75);
    }
    return () => clearTimeout(timeout);
  }, [typed, del, pi]);

  return (
    <section style={{ background: isDark ? '#0D0D0D' : '#F0F7F4', paddingTop: 100, overflow: 'hidden' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 0' }}>
        <FadeIn>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 100, padding: '8px 18px', marginBottom: 32, minHeight: 36 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.textSub, letterSpacing: '.4px', textTransform: 'uppercase' }}>
              {typed}<span style={{ borderRight: `2px solid ${BRAND.green}`, marginLeft: 1, animation: 'blink 1s step-end infinite' }}>&nbsp;</span>
            </span>
          </div>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 48, alignItems: 'center' }} className="hero-grid">
          <div>
            <FadeIn delay={80}>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 'clamp(40px,7vw,70px)', color: T.text, lineHeight: 1.06, letterSpacing: -2.5, fontWeight: 800, marginBottom: 24 }}>
                {t.hero_title_1}<br/>{t.hero_title_2}<br/>
                <span style={{ color: BRAND.green }}>{t.hero_title_3}</span>
              </h1>
            </FadeIn>
            <FadeIn delay={160}>
              <p style={{ fontSize: 18, color: T.textSub, lineHeight: 1.8, maxWidth: 480, marginBottom: 40, fontWeight: 400 }}>{t.hero_sub}</p>
            </FadeIn>
            <FadeIn delay={240}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 40 }}>
                <button onClick={() => router.push('/signup')} style={{ background: `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})`, border: 'none', borderRadius: 14, padding: '16px 36px', fontSize: 16, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', boxShadow: '0 8px 24px rgba(74,186,139,0.4)', fontFamily: "'Plus Jakarta Sans',sans-serif", transition: 'all .2s' }}>
                  {t.get_started} <ArrowRight size={17}/>
                </button>
                <button onClick={() => window.open('https://youtube.com/watch?v=YOUR_VIDEO_ID', '_blank')} style={{ background: T.surface,border: `1.5px solid ${T.border}`, borderRadius: 14, padding: '15px 28px', fontSize: 16, color: T.textSub, fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", transition: 'all .2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = BRAND.green; e.currentTarget.style.color = BRAND.green; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSub; }}>
                  {t.watch_demo}
                </button>
              </div>

            </FadeIn>
          </div>
          <FadeIn delay={200} style={{ width: '100%', maxWidth: 480, margin: '0 auto' }}>
            <div style={{ position: 'relative', aspectRatio: '1' }}>
              <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle,${BRAND.green}18 0%,transparent 70%)`, borderRadius: '50%', pointerEvents: 'none' }}/>
              <LottiePlayer src={LOTTIE.hero}/>
            </div>
          </FadeIn>
        </div>
      </div>
      
      <style>{`
        @media(min-width:900px){ .hero-grid{grid-template-columns:1fr 1fr!important;gap:72px!important} }
        @media(min-width:640px){ .stats-grid{grid-template-columns:repeat(4,1fr)!important} }
      `}</style>
    </section>
  );
}

function HowItWorks() {
  const { T } = useTheme();
  const { t } = useLang();
  const steps = [
    { num: '01', icon: BookOpen, title: t.how_1_title, desc: t.how_1_desc },
    { num: '02', icon: Brain,    title: t.how_2_title, desc: t.how_2_desc },
    { num: '03', icon: Clock,    title: t.how_3_title, desc: t.how_3_desc },
    { num: '04', icon: Users,    title: t.how_4_title, desc: t.how_4_desc },
  ];
  return (
    <section id="how" style={{ padding: '96px 24px', background: T.bg }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: BRAND.green, marginBottom: 12 }}>How it works</p>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 'clamp(28px,5vw,46px)', color: T.text, lineHeight: 1.1, letterSpacing: -1, fontWeight: 800, marginBottom: 56 }}>
            {t.how_title}<br/><span style={{ color: BRAND.green }}>{t.how_subtitle}</span>
          </h2>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 24 }} className="steps-grid">
          {steps.map(({ num, icon: Icon, title, desc }, i) => (
            <FadeIn key={num} delay={i * 80}>
              <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 20, padding: '32px 28px', position: 'relative', overflow: 'hidden', transition: 'transform .25s, box-shadow .25s' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ position: 'absolute', top: 20, right: 24, fontSize: 48, fontWeight: 800, color: BRAND.green, opacity: .07, fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1 }}>{num}</div>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: T.surface2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Icon size={24} color="#6B7280" strokeWidth={1.8}/>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 10, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{title}</h3>
                <p style={{ fontSize: 14, color: T.textMut, lineHeight: 1.7 }}>{desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
      <style>{`
        @media(max-width:600px){ .steps-grid{grid-template-columns:1fr!important} }
        @media(min-width:960px){ .steps-grid{grid-template-columns:repeat(4,1fr)!important} }
      `}</style>
    </section>
  );
}

const MODS = [
  { Icon: Brain,         tag: 'Flagship',  title: 'AI Biographer',      desc: 'Uploads become structured life chapters, milestones, lessons, and summaries written by AI.' },
  { Icon: BookOpen,      tag: 'Core',      title: 'Memory Vault',       desc: 'Stories, photos, audio, video, letters. Every format. One secure place.' },
  { Icon: Clock,         tag: 'Emotional', title: 'Future Capsules',    desc: 'Write today, deliver in 2035, or when your daughter turns 18.' },
  { Icon: Lightbulb,     tag: 'Insight',   title: 'Wisdom Log',      desc: 'Write down your wisdom from your lessons in life' },
  { Icon: Calendar,      tag: 'Visual',    title: 'Timeline Engine',    desc: 'Your life organized by year. AI pulls dates from every upload automatically.' },
  { Icon: MessageSquare, tag: 'AI',        title: 'Digital Personality', desc: "Ask what David (any of your family memeber) would think." },
  { Icon: Users,         tag: 'Shared',    title: 'Family Vault',       desc: 'Unlimited. Control who can access and view your legacy' },
];

function Features() {
  const { T } = useTheme();
  const { t } = useLang();
  return (
    <section id="features" style={{ padding: '96px 24px', background: T.surface2 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: BRAND.green, marginBottom: 12 }}>Core Features</p>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 'clamp(28px,5vw,46px)', color: T.text, lineHeight: 1.1, letterSpacing: -1, fontWeight: 800, marginBottom: 52 }}>
            {t.features_title} <span style={{ color: BRAND.green }}>{t.features_highlight}</span>
          </h2>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }} className="feat-grid">
          {MODS.map(({ Icon, tag, title, desc }, i) => (
            <FadeIn key={title} delay={i * 40}>
              <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 20, padding: '26px 22px', height: '100%', position: 'relative', overflow: 'hidden', transition: 'transform .25s, box-shadow .25s, border-color .25s', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#9CA3AF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = T.border; }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: T.surface2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon size={21} color="#6B7280" strokeWidth={1.8}/>
                </div>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: T.textMut, marginBottom: 8 }}>{tag}</p>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 10, lineHeight: 1.3 }}>{title}</h3>
                <p style={{ fontSize: 13, color: T.textMut, lineHeight: 1.7 }}>{desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
      <style>{`
        @media(min-width:560px){ .feat-grid{grid-template-columns:repeat(2,1fr)!important} }
        @media(min-width:960px){ .feat-grid{grid-template-columns:repeat(4,1fr)!important} }
      `}</style>
    </section>
  );
}
function AIChatShowcase() {
  const { T, isDark } = useTheme();
  const messages = [
    { from: 'user', text: 'David, how did you decide to start your own business?' },
    { from: 'ai', text: "I was 29, with barely any savings, but I'd seen a gap no one in our town was filling. I told your mother: better to risk failing than to spend my life wondering. That leap taught me everything." },
    { from: 'user', text: 'What would you tell me if I were scared to take a risk?' },
    { from: 'ai', text: "Fear means it matters. Don't wait until you feel ready — you never will. Start small, stay honest, and let the work speak for you." },
  ];
  return (
    <section style={{ padding: '96px 24px', background: T.bg }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr', gap: 56, alignItems: 'center' }} className="ai-grid">
        <FadeIn>
          <div>
            <div style={{ display:'inline-flex', alignItems:'center', background:T.surface2, border:`1.5px solid ${T.border}`, borderRadius:100, padding:'7px 16px', marginBottom:20 }}>
              <span style={{ fontSize:11, fontWeight:700, color:T.textSub, letterSpacing:'.6px', textTransform:'uppercase' }}>
              Digital Personality
               </span>
                </div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 'clamp(28px,5vw,44px)', color: T.text, lineHeight: 1.12, letterSpacing: -1, fontWeight: 800, marginBottom: 20 }}>
              Hear their stories. Keep <br/>their wisdom. Forever.
            </h2>
            <p style={{ fontSize: 17, color: T.textSub, lineHeight: 1.8, maxWidth: 480, marginBottom: 24 }}>
              Digital personality AI, learns from the memories and lessons you record, then lets your family ask questions and hear answers in your own voice, grounded only in what you actually shared. 
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'Answers come only from real recorded memories',
                'Clearly labeled as AI',
              ].map((line) => (
                <div key={line} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: T.surface2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={11} color="#6B7280" strokeWidth={3}/>
                  </div>
                  <span style={{ fontSize: 14, color: T.textSub, fontWeight: 500 }}>{line}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={120}>
          <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 24, overflow: 'hidden', boxShadow: isDark ? 'none' : '0 16px 48px rgba(0,0,0,0.08)' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: T.surface2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={17} color="#6B7280" strokeWidth={1.8}/>
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#000', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                 <span style={{ width: 6, height: 6, borderRadius: '50%', background: BRAND.green, display: 'inline-block' }} />
                  David's Digital Personality
                  </p>
              </div>
            </div>

            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, background: T.bg }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '82%' }}>
                    <div style={{ background: m.from === 'user' ? `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})` : T.surface, color: m.from === 'user' ? '#fff' : T.text, border: m.from === 'user' ? 'none' : `1.5px solid ${T.border}`, borderRadius: 16, borderBottomRightRadius: m.from === 'user' ? 4 : 16, borderBottomLeftRadius: m.from === 'ai' ? 4 : 16, padding: '12px 15px', fontSize: 14, lineHeight: 1.6 }}>
                      {m.text}
                    </div>
                    {m.from === 'ai' && (
                      <p style={{ fontSize: 10, color: T.textMut, marginTop: 5, marginLeft: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '14px 20px', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 100, padding: '11px 16px', fontSize: 13, color: T.textMut }}>
                Ask David anything...
              </div>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Send size={16} color="#fff"/>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
      <style>{`@media(min-width:900px){ .ai-grid{grid-template-columns:1fr 1fr!important} }`}</style>
    </section>
  );
}
function PlanCard({ p, i }) {
  const router = useRouter();
  const { T } = useTheme();
  const { t } = useLang();
  const [billing, setBilling] = useState('monthly');
  const isFree = p.name === 'Free';
  const price = isFree ? '0' : (billing === 'yearly' ? p.yearly : p.monthly);
  const period = isFree ? t.forever : (billing === 'yearly' ? '/ year' : t.per_month);

  return (
    <div style={{ background: p.pop ? `linear-gradient(145deg,#1A3D2E,#0F2820)` : T.surface, border: `1.5px solid ${p.pop ? `${BRAND.green}60` : T.border}`, borderRadius: 24, padding: '40px 32px', position: 'relative', transition: 'transform .25s, box-shadow .25s', boxShadow: p.pop ? '0 8px 40px rgba(74,186,139,0.25)' : 'none' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = p.pop ? '0 16px 56px rgba(74,186,139,0.3)' : '0 8px 28px rgba(0,0,0,0.08)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = p.pop ? '0 8px 40px rgba(74,186,139,0.25)' : 'none'; }}>
      {p.pop && <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})`, color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase', padding: '5px 16px', borderRadius: 100, boxShadow: '0 4px 12px rgba(74,186,139,0.4)', whiteSpace: 'nowrap' }}>{t.most_popular}</div>}
      <p style={{ fontSize: 13, fontWeight: 700, color: p.pop ? '#6BC4A0' : T.textMut, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>{p.name}</p>

      {/* Per-card monthly/yearly toggle (paid plans only) */}
      {!isFree && (
        <div style={{ display: 'inline-flex', background: p.pop ? 'rgba(255,255,255,0.08)' : T.surface2, borderRadius: 100, padding: 3, marginBottom: 16 }}>
          {[['monthly', 'Monthly'], ['yearly', 'Yearly']].map(([val, label]) => (
            <button key={val} onClick={() => setBilling(val)}
              style={{ padding: '6px 14px', borderRadius: 100, border: 'none', background: billing === val ? (p.pop ? '#fff' : BRAND.green) : 'transparent', color: billing === val ? (p.pop ? BRAND.greenD : '#fff') : (p.pop ? 'rgba(255,255,255,0.7)' : T.textSub), fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", transition: 'all .2s' }}>
              {label}
            </button>
          ))}
        </div>
      )}

      <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 52, fontWeight: 800, color: p.pop ? '#fff' : T.text, lineHeight: 1, marginBottom: 4 }}>
        <sup style={{ fontSize: 24, verticalAlign: 'super', fontWeight: 700 }}>$</sup>{price}
      </div>
      <p style={{ fontSize: 14, color: p.pop ? '#6BC4A0' : T.textMut, margin: '8px 0 6px', fontWeight: 500 }}>{period}</p>
      <div style={{ height: 20 }} />
      <ul style={{ listStyle: 'none', marginBottom: 32 }}>
        {p.features.map((f) => (
          <li key={f} style={{ fontSize: 14, padding: '10px 0', borderBottom: `1px solid ${p.pop ? 'rgba(255,255,255,0.07)' : T.border}`, color: p.pop ? '#E0F0E8' : T.text, display: 'flex', alignItems: 'center', gap: 11, fontWeight: 500 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${BRAND.green}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Check size={11} color={BRAND.green} strokeWidth={3}/>
            </div>
            {f}
          </li>
        ))}
      </ul>
      <button onClick={() => router.push(isFree ? '/signup' : `/signup?plan=${p.name.toLowerCase()}&interval=${billing}`)} style={{ width: '100%', padding: '15px 0', borderRadius: 12, fontSize: 15, fontWeight: 700, border: p.pop ? 'none' : `1.5px solid ${T.border}`, background: p.pop ? `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})` : 'transparent', color: p.pop ? '#fff' : T.text, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: p.pop ? '0 4px 16px rgba(74,186,139,0.4)' : 'none', transition: 'opacity .2s' }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '.88')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
        {p.cta}
      </button>
    </div>
  );
}

function Pricing() {
  const { T } = useTheme();
  const { t } = useLang();
  const plans = [
   { name: 'Free',    monthly: '0',     yearly: '0',      cta: t.get_started,  features: ['1 GB storage', '30 memories', 'Basic timeline', '1 future capsule'] },
    { name: 'Premium', monthly: '4.99',  yearly: '59.88',  cta: 'Start Premium', pop: true, features: ['Unlimited memories', 'AI Biography generator', 'Unlimited capsules', 'Wisdom Log', 'Family Vault (3 members)'] },
    { name: 'Family',  monthly: '14.99', yearly: '179.88', cta: 'Start Family',  features: ['Everything in Premium', 'Digital Personality AI', 'Unlimited Family Vault', 'Unlimited members'] },
  ];
  return (
    <section id="pricing" style={{ padding: '96px 24px', background: T.surface2 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: BRAND.green, marginBottom: 12 }}>Simple pricing</p>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 'clamp(28px,5vw,46px)', color: T.text, lineHeight: 1.1, letterSpacing: -1, fontWeight: 800, marginBottom: 16 }}>
            {t.pricing_title} <span style={{ color: BRAND.green }}>{t.pricing_highlight}</span>
          </h2>
          <p style={{ fontSize: 16, color: T.textMut, marginBottom: 52, maxWidth: 480 }}>{t.pricing_sub}</p>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, alignItems: 'start' }} className="price-grid">
          {plans.map((p, i) => (
            <FadeIn key={p.name} delay={i * 80}>
              <PlanCard p={p} i={i} />
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={300}>
          <p style={{ textAlign: 'center', fontSize: 13, color: T.textMut, marginTop: 28, fontWeight: 500 }}>
             Cancel anytime.
          </p>
        </FadeIn>
      </div>
      <style>{`@media(min-width:640px){ .price-grid{grid-template-columns:repeat(3,1fr)!important} }`}</style>
    </section>
  );
}
function CTA() {
  const router = useRouter();
  const { t } = useLang();
  return (
    <section style={{ padding: '80px 24px', background: `linear-gradient(135deg,${BRAND.greenD},#0F2820)` }}>
      <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <FadeIn>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 'clamp(28px,5vw,46px)', color: '#fff', lineHeight: 1.1, letterSpacing: -1, fontWeight: 800, marginBottom: 16 }}>{t.cta_title}</h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: 36 }}>{t.cta_sub}</p>
          <button onClick={() => router.push('/signup')} style={{ background: '#fff', border: 'none', borderRadius: 14, padding: '17px 44px', fontSize: 16, fontWeight: 800, color: BRAND.greenD, display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', fontFamily: "'Plus Jakarta Sans',sans-serif", transition: 'all .2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
            {t.get_started} <ArrowRight size={18}/>
          </button>
        </FadeIn>
      </div>
    </section>
  );
}

function Footer() {
  const router = useRouter();
  const { T } = useTheme();
  return (
    <footer style={{ background: T.surface, padding: '64px 24px 32px', borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 52 }} className="foot-grid">
          <div>
            <div style={{ marginBottom: 12 }}>
              <img src="/family.png" alt="My Family and I" style={{ height: 50, width: 'auto' }} />
            </div>
            <p style={{ fontSize: 14, color: T.textMut, lineHeight: 1.7, maxWidth: 240, marginBottom: 20 }}>Your life is a story worth preserving. My Family and I makes sure the people you love can always hear it.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { label: 'X', href: 'https://x.com/My Family and I', icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                ) },
                { label: 'Instagram', href: 'https://instagram.com/My Family and I', icon: <Instagram size={16}/> },
                { label: 'Facebook', href: 'https://facebook.com/My Family and I', icon: <Facebook size={16}/> },
              ].map(({ label, href, icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  style={{ width: 38, height: 38, borderRadius: 10, background: T.surface2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textMut, cursor: 'pointer', transition: 'all .2s', textDecoration: 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = BRAND.green; e.currentTarget.style.borderColor = BRAND.green; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = T.textMut; e.currentTarget.style.borderColor = T.border; }}>
                  {icon}
                </a>
              ))}
            </div>
          </div>
          {[
            ['Product', [['Memory Vault', '#features'], ['AI Biographer', '#features'], ['Future Capsules', '#features'], ['My Family and I Tree', '#features'], ['Wisdom Log', '#features']]],
           ['Company', [['About us', '/about'], ['Blog', '/blog'], ['Contact', '/contact']]],
            ['Legal', [['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['Security', '/privacy'], ['Data deletion', '/privacy'], ['GDPR', '/privacy']]],
          ].map(([title, links]) => (
            <div key={title}>
              <p style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 16 }}>{title}</p>
              {links.map(([label, href]) => (
               <a key={label} href={href === '#' ? undefined : href}
                  onClick={(e) => {
                    e.preventDefault();
                    if (href === '#') return;
                    if (href.startsWith('#')) {
                      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      window.location.href = href;
                    }
                  }}
                  style={{ display: 'block', fontSize: 13, color: href === '#' ? T.textMut : T.textMut, marginBottom: 10, fontWeight: 400, cursor: href === '#' ? 'default' : 'pointer', textDecoration: 'none', transition: 'color .15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = BRAND.green)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = T.textMut)}>{label}</a>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <p style={{ fontSize: 13, color: T.textMut }}>© 2026 My Family and I. All rights reserved.</p>
          <p style={{ fontSize: 13, color: T.textMut }}>Built with Vercel + AWS Aurora PostgreSQL</p>
        </div>
      </div>
      <style>{`@media(min-width:768px){ .foot-grid{grid-template-columns:1.6fr 1fr 1fr 1fr!important} }`}</style>
    </footer>
  );
}

export default function Landing() {
  return (
    <>
      <Nav/>
      <Hero/>
      <HowItWorks/>
      <Features/>
      <AIChatShowcase/>
      <Pricing/>
      <CTA/>
      <Footer/>
    </>
  );
}
