import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/features/onboarding/auth';
import 'katex/dist/katex.min.css';

export const metadata: Metadata = {
  title: 'NUMORA',
  description: 'Belajar matematika TKA dengan langkah yang jelas.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
