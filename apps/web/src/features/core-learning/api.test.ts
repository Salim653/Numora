import { afterEach, describe, expect, it, vi } from 'vitest';
import { learningApi, LearningApiError } from './api';

afterEach(() => vi.unstubAllGlobals());

describe('Drill API boundary', () => {
  it('sends only answer identity, including a cleared answer', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ questionInstanceId: 'q', selectedOptionId: null }), {
        status: 200,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await learningApi.saveAnswer('private-token', 'attempt', 'q', null);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/assessment-attempts/attempt/answers/q');
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(String(init.body))).toEqual({ optionId: null });
    expect(init.body).not.toContain('score');
  });

  it('surfaces authorization and network failures without treating them as empty data', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ detail: 'Akses ditolak' }), { status: 403 }),
        ),
    );
    await expect(learningApi.progress('private-token')).rejects.toMatchObject({
      status: 403,
      message: 'Akses ditolak',
    });

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    await expect(learningApi.progress('private-token')).rejects.toBeInstanceOf(LearningApiError);
    await expect(learningApi.progress('private-token')).rejects.toMatchObject({ status: 0 });
  });

  it('starts TryOut with package identity only, without a client score or schedule', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ id: 'attempt' }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await learningApi.startTryout('private-token', 'weekly-package');

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/tryout/attempts');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({ packageId: 'weekly-package' });
  });

  it('keeps the IRT-pending problem code and encodes history cursors', async () => {
    const pending = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ code: 'TRYOUT_RESULT_PENDING', detail: 'Menunggu IRT' }), {
        status: 409,
      }),
    );
    vi.stubGlobal('fetch', pending);
    await expect(learningApi.tryoutResult('private-token', 'attempt')).rejects.toMatchObject({
      status: 409,
      code: 'TRYOUT_RESULT_PENDING',
    });

    const history = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ records: [], nextCursor: null }), { status: 200 }),
      );
    vi.stubGlobal('fetch', history);
    await learningApi.assessmentHistory('private-token', 'page/2+next');
    expect(history.mock.calls[0]?.[0]).toContain('cursor=page%2F2%2Bnext');
  });
});
