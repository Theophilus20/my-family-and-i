'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Brain, AlertCircle, Trash2, Plus, MessageSquare, Clock, Menu, X } from 'lucide-react';
import FadeIn from '@/components/FadeIn';
import { useTheme } from '@/context/ThemeContext';
import { BRAND } from '@/lib/tokens';
import { api } from '@/lib/api';
import Avatar from '@/components/Avatar';
import { useCurrentUser } from '@/lib/useCurrentUser';
import { useVault } from '@/context/VaultContext';
import { vaultRole, canEdit } from '@/lib/permissions';
import { SkeletonBox } from '@/components/Skeleton';
import FeatureGate from '@/components/FeatureGate';

const suggestedFor = (name, isOwner) => {
  const who = isOwner ? 'you' : (name || 'they');
  const poss = isOwner ? 'your' : (name ? `${name}'s` : 'their');
  return [
    `What business advice would give me about starting a company?`,
    `What would you say about failure?`,
    `What financial lessons have you learnt? `,
    `What would  say to someone going through a hard time?`,
    `What advice will you give me on partnerships?`,
  ];
};

const introFor = (name, isOwner) => ({
  role: 'assistant',
  content: isOwner
    ? "Hello. I'm your Digital Personality — an AI built from your recorded memories, lessons, and life experiences. I can only share what you have actually written or recorded. Ask me anything about your life, advice, or values."
    : `Hello. I'm ${name || 'this person'}'s Digital Personality — an AI built from their recorded memories, lessons, and life experiences. I can only share what ${name || 'they'} ${name ? 'has' : 'have'} actually written or recorded. Ask me anything about their life, advice, or values.`,
});

function PersonalityInner() {
  const { T, isDark } = useTheme();
  const { firstName: myFirst, user, loading: userLoading } = useCurrentUser();
  const { activeVault, isOwnerView } = useVault();
  const role = vaultRole(isOwnerView, activeVault);
  const isOwner = canEdit(role);
  const vaultName = isOwner ? (user?.name || '') : (activeVault?.name || '');
  const firstName = isOwner ? myFirst : (vaultName.split(' ')[0] || '');
  const fullName = isOwner ? (user?.name || '') : vaultName;
  const [vaultAvatar, setVaultAvatar] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const avatarSrc = isOwner ? (user?.avatar_url || null) : vaultAvatar;
  const showAvatarSkeleton = isOwner ? userLoading : avatarLoading;
  const SUGGESTED = suggestedFor(firstName, isOwner);
  const headerSub = isOwner
    ? 'Ask your Digital Personality — AI responds from your recorded memories only'
    : `Ask ${firstName}'s Digital Personality — AI responds from their recorded memories only`;
  const legacyLabel = isOwner ? 'Your Legacy' : `${firstName}'s Legacy`;
  const inputPlaceholder = isOwner
    ? 'Ask your Digital Personality... (Enter to send)'
    : `Ask ${firstName}'s Digital Personality... (Enter to send)`;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const loadConversations = () => {
    setLoadingConvos(true);
    return api.getConversations(isOwnerView ? null : activeVault?.id)
      .then(setConversations)
      .catch(() => {})
      .finally(() => setLoadingConvos(false));
  };
  useEffect(() => { loadConversations(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [activeVault?.id, isOwnerView]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (isOwnerView) { setVaultAvatar(null); setAvatarLoading(false); return; }
    setAvatarLoading(true);
    api.getVaultProfile(activeVault?.id)
      .then((p) => setVaultAvatar(p?.avatar_url || null))
      .catch(() => setVaultAvatar(null))
      .finally(() => setAvatarLoading(false));
  }, [activeVault?.id, isOwnerView]);

  useEffect(() => {
    setMessages([introFor(firstName, isOwner)]);
    setActiveId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVault?.id, isOwner]);

  const startNewChat = () => {
    setActiveId(null);
    setMessages([introFor(firstName, isOwner)]);
    setError(null);
    setSidebarOpen(false);
  };

  const openConversation = async (id) => {
    try {
      const convo = await api.getConversation(id);
      setActiveId(convo.id);
      setMessages(Array.isArray(convo.messages) ? convo.messages : []);
      setError(null);
      setSidebarOpen(false);
    } catch {
      setError('Could not open that conversation.');
    }
  };

  const removeConversation = async (id, e) => {
    e.stopPropagation();
    try {
      await api.deleteConversation(id);
      if (id === activeId) startNewChat();
      loadConversations();
    } catch {
      setError('Could not delete that conversation.');
    }
  };

  const persist = async (msgs, firstUserText) => {
    try {
      const title = (firstUserText || 'New conversation').slice(0, 48);
      const saved = await api.saveConversation({ id: activeId, title, messages: msgs, vaultUserId: isOwnerView ? null : activeVault?.id });
      if (saved?.id && !activeId) setActiveId(saved.id);
      loadConversations();
    } catch {
    }
  };

  const sendMessage = async (text) => {
    const question = text || input.trim();
    if (!question || loading) return;

    setInput('');
    setError(null);
    const newMessages = [...messages, { role: 'user', content: question }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const { reply } = await api.chat(
        newMessages.map((m) => ({ role: m.role, content: m.content })),
        isOwnerView ? null : activeVault?.id
      );
      const withReply = [...newMessages, { role: 'assistant', content: reply }];
      setMessages(withReply);
      const firstUser = newMessages.find((m) => m.role === 'user');
      persist(withReply, firstUser?.content);
    } catch (err) {
      setError('Could not reach the AI. Please try again.');
      setMessages((m) => m.slice(0, -1));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const fmtDate = (d) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
    catch { return ''; }
  };

  return (
    <div style={{ display: 'flex', gap: 16, height: '100%', minHeight: 500, position: 'relative' }}>
      {/* Desktop Sidebar */}
      <div className="chat-history" style={{ width: 240, flexShrink: 0, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 20, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: `1px solid ${T.border}` }}>
          <button onClick={startNewChat} style={{ width: '100%', background: `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})`, border: 'none', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            <Plus size={15}/> New chat
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: T.textMut, textTransform: 'uppercase', letterSpacing: 1, padding: '8px 10px 6px' }}>Recent chats</p>
          {loadingConvos ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px' }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px' }}>
                  <SkeletonBox width={13} height={13} radius={4} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <SkeletonBox width="80%" height={11} />
                    <SkeletonBox width="40%" height={9} />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <p style={{ fontSize: 12, color: T.textMut, padding: '8px 10px', lineHeight: 1.5 }}>Your saved conversations will appear here.</p>
          ) : conversations.map((c) => (
            <div key={c.id} onClick={() => openConversation(c.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px', borderRadius: 9, cursor: 'pointer', background: c.id === activeId ? T.surface2 : 'transparent', marginBottom: 2, transition: 'background .15s' }}
              onMouseEnter={(e) => { if (c.id !== activeId) e.currentTarget.style.background = T.hover; }}
              onMouseLeave={(e) => { if (c.id !== activeId) e.currentTarget.style.background = 'transparent'; }}>
              <MessageSquare size={13} color={T.textMut} style={{ flexShrink: 0 }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12.5, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</p>
                <p style={{ fontSize: 10, color: T.textMut, display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={8}/> {fmtDate(c.updated_at)}</p>
              </div>
              <button onClick={(e) => removeConversation(c.id, e)} style={{ background: 'none', border: 'none', color: T.textMut, cursor: 'pointer', display: 'flex', padding: 3, flexShrink: 0 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FF5050')}
                onMouseLeave={(e) => (e.currentTarget.style.color = T.textMut)}>
                <Trash2 size={12}/>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div 
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              background: 'rgba(0,0,0,0.5)', 
              zIndex: 40
            }}
            className="mobile-overlay"
            onClick={() => setSidebarOpen(false)}
          />
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: 260, 
            height: '100dvh', 
            background: T.surface, 
            display: 'flex', 
            flexDirection: 'column', 
            boxShadow: '4px 0 24px rgba(0,0,0,0.15)', 
            animation: 'slideInLeft .25s ease', 
            overflow: 'hidden',
            zIndex: 50
          }}>
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
              <button onClick={startNewChat} style={{ background: `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})`, border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", whiteSpace: 'nowrap' }}>
                <Plus size={14}/> New chat
              </button>
              <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: T.textMut, display: 'flex', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
                <X size={20}/>
              </button>
            </div>
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: T.textMut, textTransform: 'uppercase', letterSpacing: 1, padding: '8px 10px 6px' }}>Recent chats</p>
              {loadingConvos ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px' }}>
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px' }}>
                      <SkeletonBox width={13} height={13} radius={4} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <SkeletonBox width="80%" height={11} />
                        <SkeletonBox width="40%" height={9} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <p style={{ fontSize: 12, color: T.textMut, padding: '8px 10px', lineHeight: 1.5 }}>Your saved conversations will appear here.</p>
              ) : conversations.map((c) => (
                <div key={c.id} onClick={() => openConversation(c.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px', borderRadius: 9, cursor: 'pointer', background: c.id === activeId ? T.surface2 : 'transparent', marginBottom: 2, transition: 'background .15s' }}>
                  <MessageSquare size={13} color={T.textMut} style={{ flexShrink: 0 }}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12.5, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</p>
                    <p style={{ fontSize: 10, color: T.textMut, display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={8}/> {fmtDate(c.updated_at)}</p>
                  </div>
                  <button onClick={(e) => removeConversation(c.id, e)} style={{ background: 'none', border: 'none', color: T.textMut, cursor: 'pointer', display: 'flex', padding: 3, flexShrink: 0 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#FF5050')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = T.textMut)}>
                    <Trash2 size={12}/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ flex: 1, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 20, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Chat Header */}
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 12, background: isDark ? '#1a1a1a' : '#F8FBF9', flexShrink: 0 }}>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ 
                display: 'none',
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                padding: '6px',
                color: T.text,
                flexShrink: 0
              }}
              className="mobile-menu-btn"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            {showAvatarSkeleton ? <SkeletonBox width={40} height={40} radius={20} /> : <Avatar name={fullName || "You"} src={avatarSrc} size={40} square={false}/>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{legacyLabel}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: BRAND.greenD, fontWeight: 600 }}>
                Memory-based AI
              </div>
            </div>
            <button 
              onClick={startNewChat}
              style={{ 
                background: `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})`, 
                border: 'none', 
                borderRadius: 8, 
                padding: '8px 12px', 
                fontSize: 12, 
                fontWeight: 700, 
                color: '#fff', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 5, 
                cursor: 'pointer', 
                fontFamily: "'Plus Jakarta Sans',sans-serif",
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}
              className="new-chat-btn"
            >
              <Plus size={14}/> New
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: T.textMut, background: T.surface2, borderRadius: 8, padding: '4px 10px' }}>
              <Brain size={11} color={T.textMut}/> AI · Not the real person
            </div>
          </div>

         {/* Messages Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16, wordBreak: 'break-word' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', width: '100%' }}>
                {msg.role === 'user' ? (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, maxWidth: '85%', width: 'fit-content' }}>
                    <div style={{ background: `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})`, borderRadius: '18px 18px 4px 18px', padding: '11px 16px', fontSize: 14, color: '#fff', lineHeight: 1.55, fontWeight: 500, boxShadow: '0 4px 12px rgba(74,186,139,0.25)', wordBreak: 'break-word' }}>
                      {msg.content}
                    </div>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: T.surface2, border: `1.5px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <User size={13} color={T.textMut}/>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, maxWidth: '85%', width: 'fit-content' }}>
                    {showAvatarSkeleton ? <SkeletonBox width={32} height={32} radius={16} /> : <Avatar name={fullName || "You"} src={avatarSrc} size={32} square={false}/>}
                    <div style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '4px 18px 18px 18px', padding: '12px 16px', fontSize: 14, color: T.textSub, lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {msg.content}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                {showAvatarSkeleton ? <SkeletonBox width={32} height={32} radius={16} /> : <Avatar name={fullName || "You"} src={avatarSrc} size={32} square={false}/>}
                <div style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '4px 18px 18px 18px', padding: '14px 18px', display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0, 1, 2].map((j) => (
                    <span key={j} style={{ width: 7, height: 7, borderRadius: '50%', background: BRAND.green, display: 'block', animation: `shimmer 1.2s ease-in-out ${j * 0.2}s infinite` }}/>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(255,80,80,0.08)', border: '1.5px solid rgba(255,80,80,0.2)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={14} color="#FF5050"/>
                <p style={{ fontSize: 13, color: '#FF5050' }}>{error}</p>
              </div>
            )}

            <div ref={bottomRef}/>
          </div>

          {/* Suggested Questions — sits just above input */}
          {messages.length === 1 && (
            <div style={{ padding: '12px 20px', borderTop: `1px solid ${T.border}`, background: isDark ? '#1a1a1a' : '#F8FBF9', flexShrink: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: T.textMut, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Suggested questions</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {SUGGESTED.map((q) => (
                  <button key={q} onClick={() => sendMessage(q)} style={{ background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 100, padding: '7px 14px', fontSize: 12, color: T.textSub, fontWeight: 500, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", transition: 'all .2s', textAlign: 'left' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = BRAND.green; e.currentTarget.style.color = BRAND.green; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSub; }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Input Area */}
          <div style={{ padding: '14px 20px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 10, alignItems: 'flex-end', background: isDark ? '#1a1a1a' : '#F8FBF9', flexShrink: 0 }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={inputPlaceholder}
              rows={1}
              style={{ flex: 1, background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: '11px 14px', fontSize: 14, color: T.text, fontFamily: "'Plus Jakarta Sans',sans-serif", outline: 'none', resize: 'none', lineHeight: 1.5, maxHeight: 120, overflowY: 'auto', transition: 'border-color .2s' }}
              onFocus={(e) => (e.target.style.borderColor = BRAND.green)}
              onBlur={(e) => (e.target.style.borderColor = T.border)}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{ width: 42, height: 42, borderRadius: 12, background: input.trim() && !loading ? `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})` : '#ccc', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', flexShrink: 0, boxShadow: input.trim() && !loading ? '0 4px 12px rgba(74,186,139,0.4)' : 'none', transition: 'all .2s' }}>
              <Send size={16} color="#fff"/>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .chat-history {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          .new-chat-btn {
            display: none !important;
          }
        }
        
        @media (min-width: 769px) {
          .new-chat-btn {
            display: none !important;
          }
        }
        
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

export default function Personality() {
  return (
    <FeatureGate feature="personality">
      <PersonalityInner />
    </FeatureGate>
  );
}
