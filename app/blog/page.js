'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock } from 'lucide-react';
import FadeIn from '@/components/FadeIn';
import LottiePlayer from '@/components/LottiePlayer';
import { useTheme } from '@/context/ThemeContext';
import { BRAND, LOTTIE } from '@/lib/tokens';

const GREY = '#6B7280';

const POSTS = [
  {
    id: 'why-we-built-My Family and I',
    tag: 'Story',
    title: 'Why we built My Family and I',
    read: '4 min read',
    date: 'June 2026',
    lottie: LOTTIE.hero,
    body: [
      'Most families have one person who remembers everything: the dates, the names, the reason behind every old photograph. When that person is gone, an entire library goes with them.',
      'My Family and I exists to change that. We believe the memories, lessons, and love that shape a life are too valuable to be left to fading recollection. So we built a secure place to capture them, and intelligent tools to make them easy to revisit and pass on.',
      'This is not about technology for its own sake. It is about making sure that a grandchild, decades from now, can still hear a grandparent explain what mattered to them and why. That is the whole point.',
    ],
  },
  {
    id: 'recording-a-life-story',
    tag: 'Guide',
    title: 'How to record a life story in small moments',
    read: '5 min read',
    date: 'June 2026',
    lottie: LOTTIE.signup,
    body: [
      'The biggest myth about preserving your story is that it requires one giant effort. It does not. The richest legacies are built in small, regular moments: a single memory here, a lesson learned there.',
      'Start with one prompt. What is a decision that changed your life? Write a few sentences. Add a photo if you have one. That is a complete memory, and it took five minutes.',
      'Do that once a week and within a year you will have built something your family will treasure forever. My Family and I is designed around this rhythm: gentle prompts, quick capture, and AI that quietly organizes everything into a coherent story.',
    ],
  },
  {
    id: 'talking-to-the-past',
    tag: 'AI',
    title: 'What it means to talk with a Digital Personality',
    read: '6 min read',
    date: 'June 2026',
    lottie: LOTTIE.login,
    body: [
      'The Digital Personality feature lets family members ask questions and hear answers drawn from a loved one\u2019s recorded memories. It is one of the most moving things My Family and I can do, and also the one we treat with the most care.',
      'Every answer is grounded strictly in what the person actually wrote or recorded. The AI does not guess, embellish, or invent. If something was never recorded, it says so plainly. And every response is clearly labeled as AI-generated.',
      'The goal is not to replace someone. It is to make the wisdom they chose to leave behind easier to reach, in their own words, for the people who miss them.',
    ],
  },
];

export default function Blog() {
  const router = useRouter();
  const { T } = useTheme();

  return (
    <div style={{ minHeight: '100vh', background: T.bg, padding: '40px 24px 96px', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <button onClick={() => router.push('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: T.textMut, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 32, fontFamily: 'inherit' }}>
          <ArrowLeft size={16}/> Back home
        </button>

        <FadeIn>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: BRAND.green, marginBottom: 12 }}>The My Family and I blog</p>
          <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 800, color: T.text, lineHeight: 1.1, letterSpacing: -1.5, marginBottom: 12 }}>
            Stories on memory, family, and My Family and I
          </h1>
          <p style={{ fontSize: 17, color: T.textMut, lineHeight: 1.7, marginBottom: 24 }}>
            Thoughts on preserving what matters, written for the people doing the preserving.
          </p>
        </FadeIn>

        {POSTS.map((post, i) => (
          <FadeIn key={post.id} delay={i * 60}>
            <article style={{ paddingTop: 48, marginTop: 48, borderTop: i === 0 ? 'none' : `1px solid ${T.border}` }}>
              <div style={{ width: '100%', maxWidth: 320, height: 220, margin: '0 auto 28px' }}>
                <LottiePlayer src={post.lottie}/>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: BRAND.green, background: `${BRAND.green}14`, borderRadius: 100, padding: '5px 12px' }}>{post.tag}</span>
                <span style={{ fontSize: 13, color: T.textMut, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 5 }}>{post.date} <Clock size={12}/> {post.read}</span>
              </div>
              <h2 style={{ fontSize: 'clamp(24px,3.5vw,34px)', fontWeight: 800, color: T.text, lineHeight: 1.2, letterSpacing: -0.5, marginBottom: 18 }}>{post.title}</h2>
              {post.body.map((para, j) => (
                <p key={j} style={{ fontSize: 17, color: T.textSub, lineHeight: 1.85, marginBottom: 20 }}>{para}</p>
              ))}
            </article>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}