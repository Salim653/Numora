import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ApiProblem } from '@/lib/api';
import { AdminContentScreen } from './content';
import { createQuestion, loadAdminWorkbench, updateTryoutDraft } from './content-api';

const context = vi.hoisted(() => ({ state: {} as Record<string, unknown> }));
vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/content',
  useRouter: () => ({ replace: vi.fn() }),
}));
vi.mock('@/features/onboarding/auth', () => ({
  useAuth: () => ({ state: context.state, refresh: vi.fn() }),
}));
vi.mock('./content-api', async (original) => ({
  ...(await original<object>()),
  loadAdminWorkbench: vi.fn(),
  createQuestion: vi.fn(),
  updateTryoutDraft: vi.fn(),
}));
// Explicitly fictional UI test fixtures; no production login bypass or Supabase write.
const data = {
  curriculum: {
    items: [
      {
        id: 'competency-test',
        kind: 'COMPETENCY' as const,
        parentId: 'sub-test',
        code: 'TEST',
        name: 'Kompetensi fiktif',
        displayOrder: 0,
        status: 'READY' as const,
      },
    ],
  },
  versions: { items: [] },
  videos: { items: [] },
  reports: { items: [] },
  irt: { items: [] },
  audit: { items: [] },
  dashboard: { schools: 0, chapters: 0, questions: 0, readyVersions: 0, openReports: 0 },
  packages: {
    items: [
      {
        id: 'package-test',
        familyCode: 'TEST',
        packageVersion: 1,
        name: 'Paket fiktif',
        status: 'DRAFT',
        questionVersionIds: ['pinned-id-outside-current-page'],
      },
    ],
  },
};
beforeEach(() => {
  vi.resetAllMocks();
  context.state = {
    status: 'ready',
    profile: { id: 'admin-test', role: 'ADMIN', displayName: 'Admin test' },
    session: { access_token: 'test-token' },
  };
  vi.mocked(loadAdminWorkbench).mockResolvedValue(data);
  vi.mocked(createQuestion).mockResolvedValue({ id: 'new-version-test' });
  vi.mocked(updateTryoutDraft).mockResolvedValue({ id: 'package-test' });
});
afterEach(cleanup);
describe('Admin content UI', () => {
  it('does not fetch or render administrative data for Student', () => {
    context.state = {
      status: 'ready',
      profile: { id: 'student-test', role: 'STUDENT', displayName: 'Student test' },
      session: { access_token: 'student-token' },
    };
    render(<AdminContentScreen />);
    expect(screen.getByText('Halaman ini hanya tersedia untuk Admin yang aktif.')).toBeTruthy();
    expect(loadAdminWorkbench).not.toHaveBeenCalled();
  });
  it('shows a recoverable network error and retries loading', async () => {
    vi.mocked(loadAdminWorkbench).mockRejectedValueOnce(
      new ApiProblem(0, 'NETWORK_ERROR', 'TEST offline'),
    );
    render(<AdminContentScreen />);
    await screen.findByText('TEST offline');
    fireEvent.click(screen.getByRole('button', { name: 'Muat ulang data' }));
    await screen.findByLabelText('Kompetensi');
    expect(loadAdminWorkbench).toHaveBeenCalledTimes(2);
  });
  it('sends a complete PG draft through the shared authenticated API client', async () => {
    render(<AdminContentScreen />);
    fireEvent.change(await screen.findByLabelText('Kompetensi'), {
      target: { value: 'competency-test' },
    });
    fireEvent.change(screen.getByLabelText('Kode varian unik'), { target: { value: 'ORIG-TEST' } });
    fireEvent.change(screen.getByLabelText('Teks soal (LaTeX inline diperbolehkan)'), {
      target: { value: 'TEST 1 + 1' },
    });
    for (const id of ['A', 'B', 'C', 'D'])
      fireEvent.change(screen.getByLabelText(`Opsi ${id}`), { target: { value: `TEST ${id}` } });
    fireEvent.change(screen.getByLabelText('Pembahasan'), {
      target: { value: 'TEST explanation' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Simpan versi DRAFT' }).closest('form')!);
    await waitFor(() =>
      expect(createQuestion).toHaveBeenCalledWith(
        'test-token',
        expect.objectContaining({
          primaryCompetencyId: 'competency-test',
          variantCode: 'ORIG-TEST',
          stem: 'TEST 1 + 1',
          answerOptionId: 'A',
          options: ['A', 'B', 'C', 'D'].map((id) => ({ id, text: `TEST ${id}` })),
        }),
      ),
    );
    await screen.findByText('Perubahan tersimpan. ID: new-version-test');
  });
  it('preserves pinned versions outside the loaded page when editing a Tryout draft', async () => {
    render(<AdminContentScreen />);
    await screen.findByLabelText('Kompetensi');
    fireEvent.click(screen.getByRole('button', { name: 'Draf Tryout' }));
    fireEvent.click(screen.getByRole('button', { name: 'Edit draf' }));
    fireEvent.change(screen.getByLabelText('Nama paket'), {
      target: { value: 'TEST revised package' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Simpan draf paket' }).closest('form')!);
    await waitFor(() =>
      expect(updateTryoutDraft).toHaveBeenCalledWith('test-token', 'package-test', {
        name: 'TEST revised package',
        questionVersionIds: ['pinned-id-outside-current-page'],
      }),
    );
  });
  it('removes administrative data on logout and on an API access rejection', async () => {
    const result = render(<AdminContentScreen />);
    await screen.findByLabelText('Kompetensi');
    context.state = { status: 'signed_out' };
    result.rerender(<AdminContentScreen />);
    expect(screen.queryByLabelText('Kompetensi')).toBeNull();
    context.state = {
      status: 'ready',
      profile: { id: 'another-admin-test', role: 'ADMIN', displayName: 'Admin lain' },
      session: { access_token: 'expired-test' },
    };
    vi.mocked(loadAdminWorkbench).mockRejectedValueOnce(
      new ApiProblem(403, 'ACCOUNT_DISABLED', 'TEST disabled'),
    );
    result.rerender(<AdminContentScreen />);
    await screen.findByText('TEST disabled');
    expect(screen.queryByLabelText('Kompetensi')).toBeNull();
  });
});
