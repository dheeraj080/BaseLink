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

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body suppressHydrationWarning className="bg-carbon-black text-bright-snow font-sans antialiased">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
