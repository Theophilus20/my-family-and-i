'use client';

import { useTheme } from '@/context/ThemeContext';

// Neutral grey avatar with quiet initials — the way Linear / GitHub / Vercel
// render users. Shows a photo when `src` is provided, else initials.
export default function Avatar({ name = '', src = null, size = 36, square = true }) {
  const { T } = useTheme();

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

  const radius = square ? Math.round(size * 0.28) : '50%';

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{
          width: size,
          height: size,
          flexShrink: 0,
          borderRadius: radius,
          objectFit: 'cover',
          border: `1px solid ${T.border}`,
          display: 'block',
        }}
      />
    );
  }

  return (
    <div
      aria-label={name}
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: radius,
        background: T.surface2,
        border: `1px solid ${T.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: T.textSub,
        fontWeight: 600,
        fontSize: Math.round(size * 0.38),
        letterSpacing: '0.5px',
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        userSelect: 'none',
      }}
    >
      {initials || '–'}
    </div>
  );
}