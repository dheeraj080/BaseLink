import type {Metadata} from 'next';
import './globals.css'; // Global styles

import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'BaseLink | Enterprise Platform',
  description: 'Enterprise contact management and email marketing platform.',
};

import { Shell } from '@/components/layout/Shell';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body suppressHydrationWarning className="bg-onyx text-soft-linen font-sans antialiased">
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--color-ink-black-900)',
              color: 'var(--color-pale-sky-50)',
              border: '1px solid var(--color-ink-black-700)',
              borderRadius: '12px',
              fontSize: '14px',
              padding: '12px 20px',
            },
            success: {
              iconTheme: {
                primary: 'var(--color-pale-sky-100)',
                secondary: 'var(--color-ink-black-900)',
              },
            },
            error: {
              iconTheme: {
                primary: '#FF4B4B',
                secondary: 'var(--color-ink-black-900)',
              },
            },
          }}
        />
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
