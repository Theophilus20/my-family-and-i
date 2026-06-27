'use client';

import { useEffect, useState } from 'react';

export default function LottiePlayer({ src, loop = true, style = {} }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Ensure the player script is available
    if (typeof window !== 'undefined' && !window.customElements.get('dotlottie-wc')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs';
      script.type = 'module';
      document.head.appendChild(script);
    }
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ width: '100%', height: '100%', ...style }} />;

  return (
    <dotlottie-wc
      src={src}
      autoplay
      loop={loop ? true : undefined}
      style={{ width: '100%', height: '100%', display: 'block', ...style }}
    />
  );
}
