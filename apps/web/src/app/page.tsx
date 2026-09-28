import { getApiHealth } from '@/lib/api';

const stack = [
  ['Web', 'Next.js'],
  ['API', 'NestJS REST'],
  ['Worker', 'BullMQ + Redis'],
  ['Database', 'PostgreSQL + Drizzle'],
  ['Auth', 'Supabase Auth + Google OAuth'],
  ['Realtime', 'Socket.IO for PvP'],
];

export default async function Home() {
  const health = await getApiHealth();

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12 sm:px-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
          Sprint 2 Walking Skeleton
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          TKA Mathematics SMP Platform
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
          This page proves the monorepo web layer is running and can reach the backend health
          endpoint. Product behavior remains governed by PRD v0.4 and the repository docs.
        </p>

        <div className="mt-8 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
          <span
            className={`h-3 w-3 rounded-full ${health ? 'bg-emerald-500' : 'bg-amber-500'}`}
            aria-hidden="true"
          />
          <div>
            <p className="font-medium text-slate-900">
              API: {health ? 'connected' : 'not reachable yet'}
            </p>
            <p className="text-sm text-slate-500">
              {health ? `Reported at ${health.timestamp}` : 'Start apps/api with pnpm dev.'}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stack.map(([label, value]) => (
            <section key={label} className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-2 font-semibold text-slate-900">{value}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
