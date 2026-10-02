import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { StudentAccess } from '@/features/core-learning/student-session';
import { request } from '@/features/core-learning/api';
import { PvpScreen } from './student-pvp';

const mocks = vi.hoisted(() => ({ emit: vi.fn(), push: vi.fn(), connect: vi.fn(), io: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push, replace: vi.fn() }),
  usePathname: () => '/student/pvp',
  useParams: () => ({ matchId: 'TEST-match' }),
}));
vi.mock('@/features/onboarding/auth', () => ({
  useAuth: () => ({
    state: {
      status: 'ready',
      profile: {
        id: 'TEST-student',
        role: 'STUDENT',
        status: 'ACTIVE',
        displayName: 'TEST Student',
        studentAffiliation: 'MANDIRI',
      },
      session: { access_token: 'TEST-only-token' },
    },
  }),
  destination: () => '/student',
}));
vi.mock('@/features/core-learning/api', () => ({ request: vi.fn() }));
vi.mock('socket.io-client', () => ({ io: mocks.io }));
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(request).mockImplementation(async (_token, path) =>
    path === '/pvp/availability' ? { available: true } : { invites: [] },
  );
  const socket = {
    connected: true,
    on: (event: string, callback: () => void) => {
      if (event === 'connect') queueMicrotask(callback);
    },
    timeout: () => socket,
    emitWithAck: mocks.emit,
    connect: mocks.connect,
    removeAllListeners: vi.fn(),
    disconnect: vi.fn(),
  };
  mocks.io.mockReturnValue(socket);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
it('reuses a timed-out create request ID on explicit retry instead of creating a second room', async () => {
  mocks.emit
    .mockRejectedValueOnce(new Error('TEST lost acknowledgement'))
    .mockResolvedValueOnce({ payload: { ok: true, state: { matchId: 'TEST-match' } } });
  render(
    <StudentAccess>
      <PvpScreen />
    </StudentAccess>,
  );
  const create = await screen.findByRole('button', { name: 'Buat room' });
  await waitFor(() => expect(create.hasAttribute('disabled')).toBe(false));
  fireEvent.click(create);
  const retry = await screen.findByRole('button', { name: 'Periksa permintaan sebelumnya' });
  expect(mocks.push).not.toHaveBeenCalled();
  fireEvent.click(retry);
  await waitFor(() => expect(mocks.push).toHaveBeenCalledWith('/student/pvp/TEST-match'));
  expect(mocks.emit).toHaveBeenCalledTimes(2);
  const first = mocks.emit.mock.calls[0]![1];
  const second = mocks.emit.mock.calls[1]![1];
  expect(second.requestId).toBe(first.requestId);
  expect(second.payload).toEqual(first.payload);
});
it('does not connect or expose create commands when server availability is false', async () => {
  vi.mocked(request).mockResolvedValue({ available: false });
  render(
    <StudentAccess>
      <PvpScreen />
    </StudentAccess>,
  );
  await screen.findByText('PvP belum tersedia');
  expect(mocks.io).not.toHaveBeenCalled();
  expect(screen.queryByRole('button', { name: 'Buat room' })).toBeNull();
});
