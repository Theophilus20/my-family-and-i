'use client';

import { useRouter } from 'next/navigation';
import { Lock, Sparkles } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { BRAND } from '@/lib/tokens';
import { useCurrentUser } from '@/lib/useCurrentUser';
import { useVault } from '@/context/VaultContext';
import { canUseFeature, FEATURE_LABELS, FEATURE_MIN_PLAN } from '@/lib/plans';
import { SkeletonBox } from '@/components/Skeleton';

export default function FeatureGate({ feature, children }) {
  const { T } = useTheme();
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const { activeVault, isOwnerView } = useVault();

  if (loading) {
    return (
      <div>
        <SkeletonBox width={220} height={28} radius={8} />
        <div style={{ height: 16 }} />
        <SkeletonBox height={160} radius={20} />
      </div>
    );
  }

  // Gate by the VAULT OWNER's plan. On your own vault that's your plan;
  // on a shared vault it's the owner's plan (carried on activeVault.plan).
  const plan = isOwnerView ? (user?.plan || 'free') : (activeVault?.plan || 'free');

  if (canUseFeature(plan, feature)) {
    return children;
  }

  const label = FEATURE_LABELS[feature] || 'This feature';
  const needPlan = FEATURE_MIN_PLAN[feature] || 'premium';
  const needLabel = needPlan.charAt(0).toUpperCase() + needPlan.slice(1);

  // When viewing someone else's vault, a family member can't upgrade it —
  // show an informational message instead of an upgrade button.
  const ownerName = activeVault?.name?.split(' ')[0] || 'This vault';

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 24 }}>
      <div style={{ maxWidth: 440, width: '100%', background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 24, padding: 40, textAlign: 'center', boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: `${BRAND.green}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Lock size={28} color={BRAND.green} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 10, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          {label} is a {needLabel} feature
        </h2>
        {isOwnerView ? (
          <>
            <p style={{ fontSize: 14, color: T.textMut, lineHeight: 1.65, marginBottom: 28 }}>
              Upgrade to the {needLabel} plan to unlock {label} and keep building your Legacy.
            </p>
            <button onClick={() => router.push(`/checkout?plan=${needPlan}&interval=monthly`)} {...{ onMouseEnter: (e) => (e.currentTarget.style.filter = 'brightness(0.92)'), onMouseLeave: (e) => (e.currentTarget.style.filter = 'brightness(1)') }} style={{ background: `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})`, border: 'none', borderRadius: 12, padding: '13px 28px', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(74,186,139,0.35)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              <Sparkles size={15} /> Upgrade to {needLabel}
            </button>
          </>
        ) : (
          <p style={{ fontSize: 14, color: T.textMut, lineHeight: 1.65 }}>
            {ownerName} doesn&apos;t have {label} on their plan, so it isn&apos;t available on their vault.
          </p>
        )}
      </div>
    </div>
  );
}