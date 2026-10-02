import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { StudentAccess } from '@/features/core-learning/student-session';
import { request } from '@/features/core-learning/api';
import { PvpMatchScreen, PvpScreen } from './student-pvp';
import type { PvpSnapshotDto } from '@/features/core-learning/generated-types';

const mocks = vi.hoisted(() => ({
  emit: vi.fn(),
  push: vi.fn(),
  connect: vi.fn(),
  io: vi.fn(),
  token: 'TEST-only-token',
  matchId: 'TEST-match',
  listeners: [] as Map<string, (event?: unknown) => void>[],
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push, replace: vi.fn() }),
  usePathname: () => '/student/pvp',
  useParams: () => ({ matchId: mocks.matchId }),
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
      session: { access_token: mocks.token },
    },
  }),
  destination: () => '/student',
}));
vi.mock('@/features/core-learning/api', () => ({ request: vi.fn() }));
vi.mock('socket.io-client', () => ({ io: mocks.io }));
vi.mock('qrcode', () => ({ default: { toDataURL: async () => 'TEST-QR' } }));
beforeEach(() => {
  vi.resetAllMocks();
  mocks.token = 'TEST-only-token';
  mocks.matchId = 'TEST-match';
  mocks.listeners = [];
  vi.mocked(request).mockImplementation(async (_token, path) =>
    path === '/pvp/availability' ? { available: true } : { invites: [] },
  );
  mocks.io.mockImplementation(() => {
    const listeners = new Map<string, (event?: unknown) => void>();
    mocks.listeners.push(listeners);
    const socket = {
      connected: true,
      on: (event: string, callback: () => void) => {
        listeners.set(event, callback);
        if (event === 'connect') queueMicrotask(callback);
      },
      timeout: () => socket,
      emitWithAck: mocks.emit,
      emit: (
        _event: string,
        _body: unknown,
        callback: (error: null, ack: { payload: { ok: boolean } }) => void,
      ) => callback(null, { payload: { ok: true } }),
      connect: mocks.connect,
      removeAllListeners: vi.fn(),
      disconnect: vi.fn(),
    };
    return socket;
  });
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

it('ignores an old connection acknowledgement and preserves its request ID across token renewal', async () => {
  let resolveOld!: (value: unknown) => void;
  mocks.emit.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveOld = resolve;
      }),
  );
  const view = render(
    <StudentAccess>
      <PvpScreen />
    </StudentAccess>,
  );
  const create = await screen.findByRole('button', { name: 'Buat room' });
  await waitFor(() => expect(create.hasAttribute('disabled')).toBe(false));
  fireEvent.click(create);
  await waitFor(() => expect(mocks.emit).toHaveBeenCalledOnce());
  const first = mocks.emit.mock.calls[0]![1];
  mocks.token = 'TEST-renewed-token';
  view.rerender(
    <StudentAccess>
      <PvpScreen />
    </StudentAccess>,
  );
  await waitFor(() => expect(mocks.io).toHaveBeenCalledTimes(2));
  await act(async () => {
    resolveOld({ payload: { ok: true, state: { matchId: 'OLD-match' } } });
  });
  expect(mocks.push).not.toHaveBeenCalled();
  mocks.emit.mockResolvedValueOnce({ payload: { ok: true, state: { matchId: 'CURRENT-match' } } });
  const retry = await screen.findByRole('button', { name: 'Periksa permintaan sebelumnya' });
  await waitFor(() => expect(retry.hasAttribute('disabled')).toBe(false));
  fireEvent.click(retry);
  await waitFor(() => expect(mocks.push).toHaveBeenCalledWith('/student/pvp/CURRENT-match'));
  expect(mocks.emit.mock.calls[1]![1].requestId).toBe(first.requestId);
});

it('shows the current match after a route change and ignores snapshots from other matches', async () => {
  const snapshot = (matchId: string, roomCode: string): PvpSnapshotDto => ({
    matchId,
    roomCode,
    creatorStudentId: 'TEST-student',
    difficulty: 'easy',
    status: 'WAITING',
    serverTime: new Date().toISOString(),
    isDemo: true,
    recordEligible: false,
    endReason: null,
    players: [],
    question: null,
  });
  vi.mocked(request).mockImplementation(async (_token, path) => {
    if (path === '/pvp/availability') return { available: true };
    if (path.startsWith('/pvp/matches/')) return snapshot(path.split('/').at(-1)!, 'REST-ROOM');
    return { classmates: [], invites: [] };
  });
  const view = render(
    <StudentAccess>
      <PvpMatchScreen />
    </StudentAccess>,
  );
  await screen.findByText('Room REST-ROOM');
  await waitFor(() => expect(mocks.listeners).toHaveLength(1));
  act(() =>
    mocks.listeners[0]!.get('room:state')!({ payload: snapshot('TEST-match', 'OLD-ROOM') }),
  );
  await screen.findByText('Room OLD-ROOM');
  mocks.matchId = 'NEW-match';
  view.rerender(
    <StudentAccess>
      <PvpMatchScreen />
    </StudentAccess>,
  );
  await waitFor(() => expect(mocks.listeners).toHaveLength(2));
  await screen.findByText('Room REST-ROOM');
  expect(screen.queryByText('Room OLD-ROOM')).toBeNull();
  act(() => mocks.listeners[1]!.get('room:state')!({ payload: snapshot('NEW-match', 'NEW-ROOM') }));
  await screen.findByText('Room NEW-ROOM');
  act(() =>
    mocks.listeners[1]!.get('room:state')!({ payload: snapshot('TEST-match', 'FOREIGN-ROOM') }),
  );
  expect(screen.getByText('Room NEW-ROOM')).toBeTruthy();
  expect(screen.queryByText('Room FOREIGN-ROOM')).toBeNull();
});
