import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StudentAccess, useStudentToken } from './student-session';

const mocks = vi.hoisted(() => ({
  state: {
    status: 'ready',
    profile: { id: 'student-a', role: 'STUDENT' },
    session: { access_token: 'token-a' },
  },
  replace: vi.fn(),
}));
vi.mock('@/features/onboarding/auth', () => ({
  useAuth: () => ({ state: mocks.state, refresh: vi.fn() }),
  destination: () => '/teacher',
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: mocks.replace }) }));
afterEach(cleanup);
describe('Student identity cache', () => {
  it('isolates caches on account switch and discards data on logout, including late replies', async () => {
    let resolveA!: (value: string) => void;
    const fetch = vi.fn((token: string) =>
      token === 'token-a'
        ? new Promise<string>((resolve) => {
            resolveA = resolve;
          })
        : Promise.resolve('Private B'),
    );
    function Probe() {
      const token = useStudentToken();
      const q = useQuery({ queryKey: ['private-data'], queryFn: () => fetch(token) });
      return <p>{q.data ?? 'Loading'}</p>;
    }
    const view = render(
      <StudentAccess>
        <Probe />
      </StudentAccess>,
    );
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('token-a'));
    mocks.state = {
      status: 'ready',
      profile: { id: 'student-b', role: 'STUDENT' },
      session: { access_token: 'token-b' },
    };
    view.rerender(
      <StudentAccess>
        <Probe />
      </StudentAccess>,
    );
    await waitFor(() => expect(screen.getByText('Private B')).toBeTruthy());
    resolveA('Private A');
    await waitFor(() => expect(screen.queryByText('Private A')).toBeNull());
    mocks.state = { ...mocks.state, status: 'signed_out' };
    view.rerender(
      <StudentAccess>
        <Probe />
      </StudentAccess>,
    );
    expect(screen.queryByText('Private B')).toBeNull();
    mocks.state = {
      status: 'ready',
      profile: { id: 'student-b', role: 'STUDENT' },
      session: { access_token: 'token-b' },
    };
    view.rerender(
      <StudentAccess>
        <Probe />
      </StudentAccess>,
    );
    await waitFor(() => expect(fetch.mock.calls.filter(([t]) => t === 'token-b')).toHaveLength(2));
  });
});
