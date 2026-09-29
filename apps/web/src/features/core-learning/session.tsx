'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

let client: SupabaseClient | null = null;

function getAuthClient() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || key === 'replace-me') return null;
  client = createClient(url, key);
  return client;
}

export function useStudentToken() {
  const [state, setState] = useState<{
    loading: boolean;
    token: string | null;
    error: string | null;
  }>({
    loading: false,
    token: null,
    error:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY === 'replace-me' ||
      !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        ? 'Konfigurasi Google login belum tersedia.'
        : null,
  });

  useEffect(() => {
    const auth = getAuthClient();
    if (!auth) {
      setState({ loading: false, token: null, error: 'Konfigurasi Google login belum tersedia.' });
      return;
    }
    setState({ loading: true, token: null, error: null });
    let active = true;
    const timeout = window.setTimeout(() => {
      if (active)
        setState({
          loading: false,
          token: null,
          error: 'Pemeriksaan sesi terlalu lama. Muat ulang halaman atau periksa layanan login.',
        });
    }, 5000);
    void auth.auth
      .getSession()
      .then(({ data, error }) => {
        window.clearTimeout(timeout);
        if (active)
          setState({
            loading: false,
            token: data.session?.access_token ?? null,
            error: error?.message ?? null,
          });
      })
      .catch(() => {
        window.clearTimeout(timeout);
        if (active) setState({ loading: false, token: null, error: 'Sesi belum dapat diperiksa.' });
      });
    const { data } = auth.auth.onAuthStateChange((_event, session) => {
      window.clearTimeout(timeout);
      if (active) setState({ loading: false, token: session?.access_token ?? null, error: null });
    });
    return () => {
      active = false;
      window.clearTimeout(timeout);
      data.subscription.unsubscribe();
    };
  }, []);

  return state;
}
