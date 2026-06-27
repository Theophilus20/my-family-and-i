'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Brain, Clock, Lightbulb, Calendar, Menu, X, LogOut, Bell, ChevronRight, Sun, Moon, CreditCard, MessageSquare, UserCircle, Users, ChevronDown, Check } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';
import { VaultProvider, useVault } from '@/context/VaultContext';
import Avatar from '@/components/Avatar';
import { api } from '@/lib/api';
import { canSeeOwnerPages, canSeePersonality, vaultRole } from '@/lib/permissions';
import { SkeletonBox } from '@/components/Skeleton';


export default function DashboardLayout({ children }) {
  return (
    <VaultProvider>
      <DashboardInner>{children}</DashboardInner>
    </VaultProvider>
  );
}

function VaultSwitcher() {
  const { T } = useTheme();
  const { own, shared, activeVault, switchVault } = useVault();
  const [open, setOpen] = useState(false);

  if (!own || shared.length === 0) return null;

  const all = [own, ...shared];
  const label = activeVault?.id === own.id ? 'My Legacy' : `${activeVault?.name || ''}'s Legacy`;

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen((o) => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: '7px 12px', fontSize: 13, fontWeight: 700, color: T.text, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
        {label}
        <ChevronDown size={14} color={T.textMut}/>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 90 }}/>
          <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, minWidth: 220, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, boxShadow: '0 16px 40px rgba(0,0,0,0.16)', zIndex: 100, overflow: 'hidden', padding: 6 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: T.textMut, textTransform: 'uppercase', letterSpacing: 1, padding: '8px 10px 6px' }}>Switch vault</p>
            {all.map((v) => {
              const isActive = activeVault?.id === v.id;
              const isOwn = v.id === own.id;
              return (
                <button key={v.id} onClick={() => { switchVault(v.id); setOpen(false); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px', borderRadius: 9, border: 'none', background: isActive ? T.surface2 : 'transparent', cursor: 'pointer', textAlign: 'left', marginBottom: 2 }}>
                  <Avatar name={v.name || 'V'} size={26}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{isOwn ? 'My Legacy' : `${v.name}'s Legacy`}</p>
                    <p style={{ fontSize: 10, color: T.textMut, textTransform: 'capitalize' }}>{v.role}</p>
                  </div>
                  {isActive && <Check size={14} color="#4ABA8B"/>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function DashboardInner({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark, setIsDark, T } = useTheme();
  const { t } = useLang();
  const { isOwnerView, activeVault, loading: vaultLoading } = useVault();
  const role = vaultRole(isOwnerView, activeVault);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [resent, setResent] = useState(false);

  const loadNotifications = () =>
    api.getNotifications().then(setNotifications).catch(() => {});

  useEffect(() => { loadNotifications(); }, []);

  // Where each notification type takes you when clicked.
  const NOTIF_LINKS = {
    capsule: '/dashboard/capsules',
    family: '/dashboard/family',
    bio: '/dashboard/biographer',
    memory: '/dashboard/vault',
    wisdom: '/dashboard/wisdom',
    timeline: '/dashboard/timeline',
  };

  const openNotification = (n) => {
    api.markNotificationRead(n.id).then(loadNotifications).catch(() => {});
    setNotifOpen(false);
    const dest = NOTIF_LINKS[n.type];
    if (dest) router.push(dest);
  };

  const [currentUser, setCurrentUser] = useState(null);
  const [avatarOpen, setAvatarOpen] = useState(false);
  useEffect(() => {
    let active = true;
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        if (!d.user) { router.push('/login'); return; }
        if (d.user.email_verified === false) { router.push('/check-email'); return; }
        setCurrentUser(d.user);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [router]);

  const displayName = currentUser?.name || 'Welcome';
  const displayEmail = currentUser?.email || '';

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    router.push('/');
  };

  const NAV_ALL = [
    { Icon: LayoutDashboard, label: t.overview,            path: '/dashboard',             ownerOnly: true },
    { Icon: BookOpen,        label: t.memory_vault,        path: '/dashboard/vault' },
    { Icon: Brain,           label: t.ai_biographer,       path: '/dashboard/biographer',  ownerOnly: true },
    { Icon: Clock,           label: t.capsules,            path: '/dashboard/capsules' },
    { Icon: Lightbulb,       label: t.wisdom,              path: '/dashboard/wisdom' },
    { Icon: Calendar,        label: t.timeline,            path: '/dashboard/timeline' },
    { Icon: MessageSquare,   label: t.digital_personality, path: '/dashboard/personality', personalityPage: true },
    { Icon: Users,           label: 'Family Vault',        path: '/dashboard/family',      ownerOnly: true },
    { Icon: UserCircle,      label: t.profile,             path: '/dashboard/profile' },
    { Icon: CreditCard,      label: t.billing,             path: '/dashboard/billing',     ownerOnly: true },
  ];
  const NAV = NAV_ALL.filter((n) => {
    if (n.ownerOnly && !canSeeOwnerPages(role)) return false;       // Overview, Biographer, Family, Billing
    if (n.personalityPage && !canSeePersonality(role)) return false; // Personality hidden from viewers
    return true;
  });

  const current = NAV.find((n) => n.path === pathname)?.label || t.overview;

  const SidebarContent = ({ onNav }) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '24px 20px', borderBottom: `1px solid ${T.border}` }}>
        <img src="/family2.png" alt="My Family and I" style={{ height: 50, width: 'auto' }} />
      </div>

      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        {currentUser ? (
          <>
            <Avatar name={displayName} src={currentUser?.avatar_url} size={40}/>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</p>
              <p style={{ fontSize: 11, color: T.textMut, fontWeight: 500 }}>{displayEmail}</p>
            </div>
          </>
        ) : (
          <>
            <SkeletonBox width={40} height={40} radius={20} />
            <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <SkeletonBox width="70%" height={12} />
              <SkeletonBox width="90%" height={10} />
            </div>
          </>
        )}
      </div>

      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {NAV.map(({ Icon, label, path }) => {
          const active = pathname === path;
          return (
            <button key={path} onClick={() => { router.push(path); onNav?.(); }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, marginBottom: 3, border: 'none', background: active ? T.surface2 : 'transparent', color: active ? T.text : T.textSub, fontSize: 14, fontWeight: active ? 700 : 400, cursor: 'pointer', transition: 'all .2s', textAlign: 'left' }}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = T.hover; e.currentTarget.style.color = T.text; } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textSub; } }}
            >
              <Icon size={17} strokeWidth={active ? 2.2 : 1.7}/>
              {label}
              {active && <ChevronRight size={13} style={{ marginLeft: 'auto' }}/>}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '12px 10px', borderTop: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <button onClick={() => setIsDark((d) => !d)}
          onMouseEnter={(e) => { e.currentTarget.style.background = T.hover; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 12, border: 'none', background: 'transparent', color: T.textSub, fontSize: 14, cursor: 'pointer', transition: 'all .15s' }}>
          {isDark ? <Sun size={17} strokeWidth={1.7}/> : <Moon size={17} strokeWidth={1.7}/>}
          {isDark ? t.light_mode : t.dark_mode}
        </button>
        <button onClick={handleLogout}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,80,80,0.08)'; e.currentTarget.style.color = '#FF5050'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textSub; }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 12, border: 'none', background: 'transparent', color: T.textSub, fontSize: 14, cursor: 'pointer', transition: 'all .15s' }}>
          <LogOut size={17} strokeWidth={1.7}/> {t.logout}
        </button>
      </div>
    </div>
  );

  if (vaultLoading || !currentUser) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: T.bg }}>
        {/* Sidebar skeleton */}
        <aside style={{ width: 240, flexShrink: 0, background: T.sidebar, borderRight: `1px solid ${T.border}`, position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40 }} className="dash-sidebar">
          <div style={{ padding: '24px 20px', borderBottom: `1px solid ${T.border}` }}>
            <SkeletonBox width={120} height={22} radius={6} />
          </div>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <SkeletonBox width={40} height={40} radius={20} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <SkeletonBox width="70%" height={12} />
              <SkeletonBox width="90%" height={10} />
            </div>
          </div>
          <div style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
                <SkeletonBox width={18} height={18} radius={5} />
                <SkeletonBox width={`${55 + (i % 3) * 12}%`} height={12} />
              </div>
            ))}
          </div>
        </aside>

        {/* Main skeleton */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }} className="dash-main">
          <header style={{ borderBottom: `1px solid ${T.border}`, padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <SkeletonBox width={140} height={18} radius={6} />
            <SkeletonBox width={42} height={42} radius={12} />
          </header>
          <div style={{ flex: 1, padding: '28px', maxWidth: 1200, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }} className="dash-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SkeletonBox width={220} height={26} radius={8} />
              <SkeletonBox width={300} height={14} radius={6} />
            </div>
            <SkeletonBox height={180} radius={20} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12 }}>
              {Array.from({ length: 4 }).map((_, i) => <SkeletonBox key={i} height={110} radius={20} />)}
            </div>
            <SkeletonBox height={220} radius={20} />
          </div>
        </main>


      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: T.bg }}>
      <aside style={{ width: 240, flexShrink: 0, background: T.sidebar, borderRight: `1px solid ${T.border}`, position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40, boxShadow: isDark ? 'none' : '2px 0 12px rgba(0,0,0,0.04)' }} className="dash-sidebar">
        <SidebarContent/>
      </aside>

      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex' }}>
          <aside style={{ width: 260, height: '100dvh', background: T.sidebar, display: 'flex', flexDirection: 'column', boxShadow: '4px 0 24px rgba(0,0,0,0.15)', animation: 'slideInLeft .25s ease', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
              <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', color: T.textMut, display: 'flex', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
              <SidebarContent onNav={() => setMobileOpen(false)}/>
            </div>
          </aside>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)' }} onClick={() => setMobileOpen(false)}/>
        </div>
      )}

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }} className="dash-main">
        <header style={{ position: 'sticky', top: 0, zIndex: 60, background: isDark ? 'rgba(15,26,23,0.97)' : 'rgba(255,255,255,0.97)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${T.border}`, padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => setMobileOpen(true)} className="show-mob" style={{ background: 'none', border: 'none', color: T.textMut, display: 'none', cursor: 'pointer' }}>
              <Menu size={20}/>
            </button>
            <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 16, fontWeight: 700, color: T.text }}>{current}</p>
            <VaultSwitcher/>
          </div>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setNotifOpen((o) => !o)} style={{ background: notifOpen ? T.hover : 'none', border: `1.5px solid ${notifOpen ? T.border : 'transparent'}`, borderRadius: 12, padding: 11, color: T.textMut, display: 'flex', position: 'relative', cursor: 'pointer', transition: 'all .15s' }}>
              <Bell size={20}/>
              {notifications.filter((n) => !n.read).length > 0 && (
                <span style={{ position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, padding: '0 5px', background: '#FF3B30', color: '#fff', borderRadius: 9, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${T.bg}`, fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1 }}>
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div onClick={() => setNotifOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 90 }}/>
                <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 320, maxWidth: 'calc(100vw - 32px)', background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 16, boxShadow: '0 16px 40px rgba(0,0,0,0.16)', zIndex: 100, overflow: 'hidden' }}>
                 <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Notifications</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {notifications.some((n) => !n.read) && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#4ABA8B', background: 'rgba(74,186,139,0.12)', borderRadius: 100, padding: '2px 8px' }}>{notifications.filter((n) => !n.read).length} new</span>
                      )}
                      <button onClick={() => setNotifOpen(false)} style={{ background: 'none', border: 'none', color: T.textMut, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 2 }}>
                        <X size={16}/>
                      </button>
                    </div>
                  </div>
                  <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '32px 18px', textAlign: 'center', color: T.textMut, fontSize: 13 }}>You&apos;re all caught up.</div>
                    ) : notifications.map((n) => (
                      <div key={n.id} onClick={() => openNotification(n)} style={{ padding: '13px 18px', borderBottom: `1px solid ${T.border}`, cursor: 'pointer', transition: 'background .15s', background: n.read ? 'transparent' : 'rgba(74,186,139,0.04)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = T.hover)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(74,186,139,0.04)')}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: n.read ? T.border : '#4ABA8B', flexShrink: 0, marginTop: 6 }}/>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>{n.title}</p>
                            {n.body && <p style={{ fontSize: 12, color: T.textMut, lineHeight: 1.5, marginBottom: 4 }}>{n.body}</p>}
                            <p style={{ fontSize: 11, color: T.textMut, fontWeight: 500 }}>{new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {notifications.length > 0 && (
                    <button onClick={() => { api.markAllNotificationsRead().then(loadNotifications); }} style={{ width: '100%', padding: '12px', background: 'none', border: 'none', borderTop: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600, color: '#4ABA8B', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                    Mark all as read
                  </button>
                  )}
                </div>
              </>
            )}
          </div>
        </header>

        <div style={{ flex: 1, padding: '28px', overflowY: 'auto', maxWidth: 1200, width: '100%', margin: '0 auto' }} className="dash-content">
          {children}
        </div>
      </main>

      <style>{`
        @media(max-width:768px){
          .dash-sidebar { display:none!important; }
          .dash-main    { margin-left:0!important; }
          .show-mob     { display:flex!important; }
        }
        @media(min-width:769px){ .dash-main{ margin-left:240px; } }
        @media(max-width:600px){ .dash-content{ padding:16px!important; } }
      `}</style>
    
      {avatarOpen && currentUser?.avatar_url && (
        <div
          onClick={() => setAvatarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, cursor: 'zoom-out' }}
        >
          <img
            src={currentUser.avatar_url}
            alt={displayName}
            style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setAvatarOpen(false)}
            style={{ position: 'absolute', top: 24, right: 24, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
