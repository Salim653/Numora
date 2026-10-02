import { notFound } from 'next/navigation';
import { QaLogin } from '@/features/onboarding/qa-login';

export default function QaLoginPage() {
  if (process.env.NODE_ENV !== 'development' ||
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://pkamenfnwmoeisccnrnk.supabase.co') notFound();
  return <QaLogin />;
}
