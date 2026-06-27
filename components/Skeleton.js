'use client';

import { useTheme } from '@/context/ThemeContext';

// A single shimmering grey block.
export function SkeletonBox({ width = '100%', height = 16, radius = 8, style = {} }) {
  const { T } = useTheme();
  return (
    <div
      style={{
        width, height, borderRadius: radius,
        background: `linear-gradient(90deg, ${T.surface2} 25%, ${T.hover} 37%, ${T.surface2} 63%)`,
        backgroundSize: '400% 100%',
        animation: 'skeleton-shimmer 1.4s ease infinite',
        ...style,
      }}
    />
  );
}

// A card-shaped skeleton that mimics a memory/wisdom/capsule list item.
export function SkeletonCard() {
  const { T } = useTheme();
  return (
    <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 16, padding: '18px 20px', display: 'flex', gap: 14 }}>
      <SkeletonBox width={42} height={42} radius={12} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
        <SkeletonBox width="35%" height={12} />
        <SkeletonBox width="70%" height={15} />
        <SkeletonBox width="90%" height={11} />
      </div>
    </div>
  );
}

// A grid of card skeletons.
export function SkeletonGrid({ count = 6, className = '' }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }} className={className}>
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
      <style>{`@keyframes skeleton-shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }`}</style>
    </div>
  );
}