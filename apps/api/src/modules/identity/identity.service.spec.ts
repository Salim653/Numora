import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { getDatabase } from '@tka/database';
import { IdentityService } from './identity.service';

vi.mock('@tka/database', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tka/database')>();
  return { ...actual, getDatabase: vi.fn() };
});

const authId = '11111111-1111-4111-8111-111111111111';
const saved = {
  id: '22222222-2222-4222-8222-222222222222',
  authUserId: authId,
  role: 'STUDENT' as const,
  displayName: 'Nisa',
  email: 'nisa@example.test',
  status: 'ACTIVE' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function database(selects: unknown[][], inserted: unknown[] = []) {
  const select = vi.fn(() => ({
    from: () => ({ where: () => ({ limit: async () => selects.shift() ?? [] }) }),
  }));
  const insert = vi.fn(() => ({
    values: () => ({ onConflictDoNothing: () => ({ returning: async () => inserted }) }),
  }));
  vi.mocked(getDatabase).mockReturnValue({ db: { select, insert } } as never);
  return { select, insert };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.SUPABASE_URL = 'http://supabase.test';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'public-key';
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      json: async () => ({
        id: authId,
        email: 'nisa@example.test',
        app_metadata: { providers: ['google'] },
      }),
    })),
  );
});

describe('IdentityService', () => {
  it('rejects an invalid bearer session', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 401 })),
    );
    await expect(new IdentityService().me('Bearer invalid')).rejects.toThrow(UnauthorizedException);
  });

  it('registers a Google user with the chosen role', async () => {
    const db = database([[]], [saved]);
    await expect(
      new IdentityService().register('Bearer valid', 'STUDENT', '  Nisa  '),
    ).resolves.toMatchObject({
      id: saved.id,
      role: 'STUDENT',
      teacherVerified: false,
    });
    expect(db.insert).toHaveBeenCalledOnce();
  });

  it('asks an authenticated new user to complete registration', async () => {
    database([[]]);
    await expect(new IdentityService().me('Bearer valid')).rejects.toThrow(NotFoundException);
  });

  it('returns the existing profile on a repeated registration', async () => {
    const db = database([[saved]]);
    await expect(
      new IdentityService().register('Bearer valid', 'STUDENT', 'Other name'),
    ).resolves.toMatchObject({ displayName: 'Nisa' });
    expect(db.insert).not.toHaveBeenCalled();
  });

  it('returns the winner when two registrations use the same Google account', async () => {
    database([[], [saved]], []);
    await expect(
      new IdentityService().register('Bearer valid', 'STUDENT', 'Nisa'),
    ).resolves.toMatchObject({
      id: saved.id,
      role: 'STUDENT',
    });
  });

  it('prevents changing an existing role', async () => {
    database([[saved]]);
    await expect(new IdentityService().register('Bearer valid', 'TEACHER', 'Nisa')).rejects.toThrow(
      ConflictException,
    );
  });

  it('denies a disabled account', async () => {
    database([[{ ...saved, status: 'DISABLED' }]]);
    await expect(new IdentityService().me('Bearer valid')).rejects.toThrow(ForbiddenException);
  });

  it('recognizes a verified Teacher from active school membership', async () => {
    database([[{ ...saved, role: 'TEACHER' }], [{ id: 'membership' }]]);
    await expect(new IdentityService().me('Bearer valid')).resolves.toMatchObject({
      role: 'TEACHER',
      teacherVerified: true,
    });
  });
});
