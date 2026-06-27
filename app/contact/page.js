'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, MapPin, Send, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import LottiePlayer from '@/components/LottiePlayer';
import { useTheme } from '@/context/ThemeContext';
import { BRAND, LOTTIE } from '@/lib/tokens';

const SUPPORT_EMAIL = 'myfamilyandi00@gmail.com';
const SUPPORT_PHONE = '08000000000';
const SUPPORT_LOCATION = 'Abuja, Nigeria';

export default function Contact() {
  const router = useRouter();
  const { T } = useTheme();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const valid = form.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && form.message.trim();

  const submit = async () => {
    if (!valid || sending) return;
    setSending(true);
    setError('');

    const localTime = new Date().toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, submittedAt: localTime }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setForm({ name: '', email: '', message: '' });
      }, 5000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <div className="contact-card" style={{ background: '#ffffff', width: '100%', maxWidth: 1100, borderRadius: 32, padding: '60px', boxShadow: '0 4px 50px rgba(0,0,0,0.06)', position: 'relative' }}>
        
        {/* Back Button */}
        <button onClick={() => router.push('/')} style={{ position: 'absolute', top: 30, left: 30, background: 'none', border: 'none', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = BRAND.green} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>
          <ArrowLeft size={16}/> Back home
        </button>

        {/* Top Header Section with Animation */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ width: '100%', maxWidth: 220, height: 160, margin: '0 auto 10px' }}>
            <LottiePlayer src={LOTTIE.hero}/>
          </div>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: BRAND.green, margin: '0 0 12px' }}>Get in touch</p>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 42px)', fontWeight: 800, color: '#111', margin: '0 0 16px', letterSpacing: -1.5, lineHeight: 1.1 }}>We're here to help</h1>
          <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.6, maxWidth: 520, margin: '0 auto' }}>
            Have questions about your vault or need assistance? Reach out to us and we'll get back to you within 1-2 business days.
          </p>
        </div>

        <div className="contact-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 80, alignItems: 'start' }}>
          
          {/* LEFT: Info Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: '#f8fafc', border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Phone size={24} color="#94a3b8"/>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 2px' }}>Call</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#333', margin: 0 }}>{SUPPORT_PHONE}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: '#f8fafc', border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Mail size={24} color="#94a3b8"/>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 2px' }}>Email</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#333', margin: 0 }}>{SUPPORT_EMAIL}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: '#f8fafc', border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={24} color="#94a3b8"/>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 2px' }}>Location</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#333', margin: 0 }}>{SUPPORT_LOCATION}</p>
              </div>
            </div>
          </div>

          {/* RIGHT: Form Section */}
          <div style={{ background: '#fcfcfc', border: '1.5px solid #f1f5f9', borderRadius: 24, padding: '40px' }}>
            {sent ? (
              <div className="fade-in" style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${BRAND.green}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Check size={32} color={BRAND.green}/>
                </div>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: '#111', marginBottom: 12 }}>Message Sent</h3>
                <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.6 }}>Thanks for reaching out! We've received your message and will respond shortly.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, display: 'block' }}>Name</label>
                  <input 
                    value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                    placeholder="Your name" type="text"
                    style={{ width: '100%', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', fontSize: 15, color: '#333', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                    onFocus={(e) => { e.target.style.borderColor = BRAND.green; e.target.style.boxShadow = `0 0 0 4px ${BRAND.green}10`; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, display: 'block' }}>Email address</label>
                  <input 
                    value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}
                    placeholder="you@example.com" type="email"
                    style={{ width: '100%', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', fontSize: 15, color: '#333', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                    onFocus={(e) => { e.target.style.borderColor = BRAND.green; e.target.style.boxShadow = `0 0 0 4px ${BRAND.green}10`; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, display: 'block' }}>Message</label>
                  <textarea 
                    value={form.message} onChange={(e) => setForm({...form, message: e.target.value})}
                    placeholder="How can we help?" rows={4}
                    style={{ width: '100%', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', fontSize: 15, color: '#333', outline: 'none', resize: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                    onFocus={(e) => { e.target.style.borderColor = BRAND.green; e.target.style.boxShadow = `0 0 0 4px ${BRAND.green}10`; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {error && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontSize: 14, fontWeight: 500 }}>
                    <AlertCircle size={16}/> {error}
                  </div>
                )}

                <button 
                  onClick={submit} disabled={!valid || sending}
                  style={{ 
                    width: '100%', background: valid && !sending ? BRAND.green : '#cbd5e1', color: '#fff', 
                    border: 'none', borderRadius: 12, padding: '16px', fontSize: 14, fontWeight: 700, 
                    textTransform: 'uppercase', letterSpacing: 1.5, cursor: valid && !sending ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s', marginTop: 10, boxShadow: valid && !sending ? `0 10px 25px ${BRAND.green}30` : 'none'
                  }}
                >
                  {sending ? 'Sending...' : 'Send Now'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 900px) {
          .contact-container { grid-template-columns: 1fr !important; gap: 60px !important; }
          .contact-card { padding: 40px 24px !important; border-radius: 24px !important; }
        }
        .fade-in { animation: fadeIn 0.5s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      ` }} />
    </div>
  );
}
