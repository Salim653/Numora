'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { destination, useAuth } from '@/features/onboarding/auth';
import { LearningProvider } from './provider';

const StudentSession = createContext<string | null>(null);
export function useStudentToken() {
  const token = useContext(StudentSession);
  if (!token) throw new Error('Student screen must be rendered within the student layout.');
  return token;
}

export function StudentAccess({ children }: { children: ReactNode }) {
  const { state, refresh } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (state.status === 'signed_out') router.replace('/');
    if (state.status === 'registration') router.replace('/onboarding');
    if (state.status === 'ready' && state.profile.role !== 'STUDENT')
      router.replace(destination(state.profile));
  }, [router, state]);
  if (state.status === 'ready' && state.profile.role === 'STUDENT')
    return (
      <LearningProvider key={state.profile.id}>
        <StudentSession.Provider value={state.session.access_token}>
          {children}
        </StudentSession.Provider>
      </LearningProvider>
    );
  return (
    <main className="mx-auto max-w-lg p-6" aria-live="polite">
      <h1 className="text-xl font-bold">
        {state.status === 'disabled'
          ? 'Akun tidak aktif'
          : state.status === 'error'
            ? 'Sesi belum siap'
            : 'Memeriksa akses'}
      </h1>
      <p className="my-4">{state.status === 'error' ? state.message : 'Mohon tunggu…'}</p>
      {state.status === 'error' && (
        <button className="underline" onClick={() => void refresh()}>
          Periksa lagi
        </button>
      )}
    </main>
  );
}
