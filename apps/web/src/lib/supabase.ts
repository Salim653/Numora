import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | undefined;

export function getSupabase() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  console.log('[NUMORA SUPABASE]', {
    url: url ? 'ADA' : 'KOSONG',
    key: key ? 'ADA' : 'KOSONG',
    keyIsReplaceMe: key === 'replace-me',
  });

  if (!url || !key || key === 'replace-me') {
    throw new Error('Login belum dikonfigurasi.');
  }

  client = createClient(url, key, {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });

  return client;
}
