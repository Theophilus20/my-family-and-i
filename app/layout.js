import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'My Family and I|Every story deserves to outlive you',
  description:
    'A secure digital vault that preserves your memories, wisdom, and life story.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
     },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="light">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}