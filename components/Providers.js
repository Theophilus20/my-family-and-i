'use client';

import { useEffect } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { LangProvider } from '@/context/LangContext';

export default function Providers({ children }) {
  // Load the dotlottie web component SDK once on the client.
  useEffect(() => {
    if (document.querySelector('[data-lottie-sdk]')) return;
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/@lottiefiles/dotlottie-wc@latest/dist/dotlottie-wc.js';
    s.type = 'module';
    s.setAttribute('data-lottie-sdk', '1');
    document.head.appendChild(s);
  }, []);

  return (
    <ThemeProvider>
      <LangProvider>{children}</LangProvider>
    </ThemeProvider>
  );
}
