import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import './numora.css';
import { AuthProvider } from '@/features/onboarding/auth';
import 'katex/dist/katex.min.css';

const inter = localFont({
  src: './fonts/InterVariable.woff2',
  display: 'swap',
  weight: '100 900',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'NUMORA',
  description: 'Belajar matematika TKA dengan langkah yang jelas.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className={inter.variable}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
