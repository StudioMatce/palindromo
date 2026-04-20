import type { Metadata } from 'next';
import { DM_Mono } from 'next/font/google';
import './globals.css';

const dmMono = DM_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
});

export const metadata: Metadata = {
  title: 'Palindromo \u00B7 Conegliano 2026',
  description: 'Apparentemente uguale, ma non per forza identico.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={dmMono.variable}>
      <body>{children}</body>
    </html>
  );
}
