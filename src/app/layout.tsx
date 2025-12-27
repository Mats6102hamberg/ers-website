import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Security Dashboard – Agent Memory Vault',
  description:
    'Real-time security monitoring dashboard for Enterprise Risk Scoring system.',
  metadataBase: new URL('https://agent-memory-vault.vercel.app'),
  openGraph: {
    title: 'Security Dashboard – Agent Memory Vault',
    description: 'Real-time security monitoring and threat detection.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv">
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
