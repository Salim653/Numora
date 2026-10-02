import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProgressBar } from '@tka/ui';
import { AppShell } from '@/components/shell';
import { StudentAccess } from './student-session';
import { NewStudentDashboard } from './dashboard-new';
import { ProfileScreen } from './profile';
import { TryoutScreen } from './tryout';
import { SubchapterScreen } from './catalog';
import { TeacherDashboardScreen } from '@/features/monitoring/teacher-screens';
import { TeacherProfileScreen } from '@/features/onboarding/teacher-profile';
import { learningApi, request } from './api';
import { FeedbackOverview } from './feedback-overview';
import { LeaderboardsScreen } from './leaderboards';
import { getTeacherClasses, joinClass } from '@/lib/api';
import { destination } from '@/features/onboarding/destination';

// Fictional fixtures stay in tests; live screens never synthesize learning data.
const context = vi.hoisted(() => ({
  state: {} as Record<string, unknown>,
  pathname: '/student',
  replace: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
  logout: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  usePathname: () => context.pathname,
  useRouter: () => ({ replace: context.replace, push: context.push }),
  useParams: () => ({ chapterId: 'chapter-test', subchapterId: 'sub-test' }),
}));
vi.mock('@/features/onboarding/auth', () => ({
  useAuth: () => ({ state: context.state, refresh: context.refresh, logout: context.logout }),
  destination: (profile: Parameters<typeof destination>[0]) => destination(profile),
}));
vi.mock('./api', async (original) => ({
  ...(await original<object>()),
  request: vi.fn(),
  learningApi: {
    dashboard: vi.fn(),
    progress: vi.fn(),
    catalog: vi.fn(),
    assessmentHistory: vi.fn(),
    currentTryout: vi.fn(),
    subchapter: vi.fn(),
    start: vi.fn(),
  },
}));
vi.mock('@/lib/api', async (original) => ({
  ...(await original<object>()),
  joinClass: vi.fn(),
  getTeacherClasses: vi.fn(),
}));
const profile = {
  id: 'student-test',
  role: 'STUDENT',
  displayName: 'Siswa Fiktif',
  email: 'test@example.invalid',
  studentAffiliation: 'MANDIRI',
  status: 'ACTIVE',
  teacherVerified: null,
};
beforeEach(() => {
  vi.resetAllMocks();
  context.pathname = '/student';
  context.state = { status: 'ready', profile, session: { access_token: 'test-token' } };
  vi.mocked(learningApi.dashboard).mockResolvedValue({
    displayName: profile.displayName,
    affiliation: 'MANDIRI',
    class: null,
    completedLevels: 0,
    availableLevels: 0,
    latestDrillScore: 0,
    bestDrillScore: 0,
    activities: [],
    activeDrill: null,
    features: {
      drill: true,
      tryout: false,
      pvp: false,
      classLeaderboard: false,
      pretest: false,
      pendingPolicies: [],
    },
  });
  vi.mocked(learningApi.progress).mockResolvedValue({
    completedLevels: 0,
    totalLevels: 0,
    latestScore: 0,
  });
  vi.mocked(learningApi.catalog).mockResolvedValue({ chapters: [] });
  vi.mocked(learningApi.assessmentHistory).mockResolvedValue({ records: [], nextCursor: null });
  vi.mocked(learningApi.currentTryout).mockResolvedValue({ state: 'unavailable', eligible: false });
  vi.mocked(request).mockResolvedValue({ unreadCount: 0, latest: [] });
});
afterEach(cleanup);
function renderStudent(children: React.ReactNode) {
  return render(<StudentAccess>{children}</StudentAccess>);
}
describe('responsive learning composition', () => {
  it('shows persisted feedback previews and leaves the inbox read state unchanged', async () => {
    vi.mocked(request).mockResolvedValue({
      unreadCount: 1,
      latest: [
        {
          id: 'feedback-test',
          teacherName: 'Guru Test',
          body: '<script>Pesan Guru</script>',
          sentAt: '2026-10-01T00:00:00Z',
          readAt: null,
        },
      ],
    });
    renderStudent(<FeedbackOverview token="test-token" />);
    expect(await screen.findByText('1 catatan belum dibaca.')).toBeTruthy();
    expect(screen.getByText('<script>Pesan Guru</script>')).toBeTruthy();
    expect(document.querySelector('script')).toBeNull();
    expect(request).toHaveBeenCalledOnce();
    expect(request).toHaveBeenCalledWith('test-token', '/students/me/feedback/summary');
  });
  it('keeps ranks hidden when policy is pending, even if provisional rows are returned', async () => {
    vi.mocked(request).mockResolvedValue({
      policyPending: true,
      entries: [
        { studentId: 'rank-test', displayName: 'Provisional student', rank: 1, points: 999 },
      ],
      ownEntry: { rank: 37, points: 500 },
      unit: 'points',
      period: { startsAt: '2026-10-01T00:00:00Z', endsAt: '2026-10-08T00:00:00Z' },
      updatedAt: null,
    });
    renderStudent(<LeaderboardsScreen />);
    await screen.findByText('Peringkat belum tersedia');
    expect(screen.queryByText('Provisional student')).toBeNull();
    expect(screen.queryByText('#37')).toBeNull();
  });
  it('renders top/self positions from the server without calculating ties or excluding a self rank outside the top twenty', async () => {
    vi.mocked(request).mockResolvedValue({
      policyPending: false,
      entries: [{ studentId: 'rank-test', displayName: 'Server student', rank: 2, points: 100 }],
      ownEntry: { rank: 37, points: 50 },
      unit: 'points',
      period: { startsAt: '2026-10-01T00:00:00Z', endsAt: '2026-10-08T00:00:00Z' },
      updatedAt: '2026-10-02T01:00:00Z',
    });
    renderStudent(<LeaderboardsScreen />);
    await screen.findByText('Server student');
    expect(screen.getByText('#37')).toBeTruthy();
    expect(screen.getByText('2', { selector: 'td' })).toBeTruthy();
  });
  it('mounts Home with its query provider and truthful empty states, including a zero score', async () => {
    renderStudent(<NewStudentDashboard />);
    await screen.findByText('0 / 100');
    expect(screen.getByText('Materi sedang disiapkan')).toBeTruthy();
    expect(await screen.findByText('Belum tersedia untuk akun ini')).toBeTruthy();
    expect(screen.getByText(/Tryout gratis untuk siswa Mandiri dan Sekolah/)).toBeTruthy();
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.queryByText('XP')).toBeNull();
    expect(document.querySelector('a[href^="/demo"]')).toBeNull();
  });
  it('marks the learning destination on nested Drill routes and removes navigation during an attempt', () => {
    context.pathname = '/student/drill/attempt-test';
    const view = render(<AppShell>Soal</AppShell>);
    const nav = screen.getByRole('navigation', { name: 'Navigasi Ruang belajar' });
    expect(within(nav).getByRole('link', { name: 'Belajar' }).getAttribute('aria-current')).toBe(
      'page',
    );
    expect(within(nav).getAllByRole('link')).toHaveLength(7);
    expect(
      within(screen.getByRole('navigation', { name: 'Navigasi utama' })).getAllByRole('link'),
    ).toHaveLength(5);
    view.rerender(<AppShell focus>Soal</AppShell>);
    expect(screen.queryByRole('navigation')).toBeNull();
  });
  it('does not fetch Student data while signed out', async () => {
    context.state = { status: 'signed_out' };
    renderStudent(<NewStudentDashboard />);
    await waitFor(() => expect(context.replace).toHaveBeenCalledWith('/'));
    expect(learningApi.dashboard).not.toHaveBeenCalled();
  });
  it.each(['TEST-CODE', 'QA2345'])(
    'joins class %s after trimming pasted spaces then refreshes authoritative account affiliation',
    async (joinCode) => {
      vi.mocked(joinClass).mockResolvedValue({
        class: { id: 'class-test', name: 'IX Fiktif' },
        joined: true,
      });
      renderStudent(<ProfileScreen />);
      fireEvent.change(screen.getByLabelText(/Kode kelas/), { target: { value: ` ${joinCode} ` } });
      fireEvent.click(screen.getByRole('button', { name: 'Gabung kelas' }));
      await waitFor(() => expect(joinClass).toHaveBeenCalledWith('test-token', joinCode));
      await waitFor(() => expect(context.refresh).toHaveBeenCalledOnce());
    },
  );
  it('keeps unavailable TryOut honest without requiring class membership', async () => {
    renderStudent(<TryoutScreen />);
    const link = await screen.findByRole('link', { name: 'Latihan dulu' });
    expect(link.getAttribute('href')).toBe('/student/learn');
    expect(screen.queryByText(/Bergabung dengan kelas.*akses Tryout/)).toBeNull();
    expect(screen.queryByRole('button', { name: /Mulai TryOut/ })).toBeNull();
  });
  it('mounts Teacher queries under a provider and rejects a Student account', async () => {
    context.state = {
      status: 'ready',
      profile: { ...profile, role: 'TEACHER', teacherVerified: true },
      session: { access_token: 'teacher-test' },
    };
    vi.mocked(getTeacherClasses).mockResolvedValue({
      items: [{ id: 'class-test', name: 'IX Fiktif', joinCode: 'TEST' }],
    });
    const view = render(<TeacherDashboardScreen />);
    expect((await screen.findByRole('link', { name: /IX Fiktif/ })).getAttribute('href')).toBe(
      '/teacher/classes/class-test',
    );
    view.unmount();
    vi.mocked(getTeacherClasses).mockClear();
    context.state = { status: 'ready', profile, session: { access_token: 'test-token' } };
    render(<TeacherDashboardScreen />);
    await waitFor(() => expect(context.replace).toHaveBeenCalledWith('/student'));
    expect(getTeacherClasses).not.toHaveBeenCalled();
  });
  it('shows a verified Teacher account and signs out from Profile', async () => {
    context.pathname = '/teacher/profile';
    context.state = {
      status: 'ready',
      profile: { ...profile, role: 'TEACHER', teacherVerified: true },
      session: { access_token: 'teacher-test' },
    };
    render(<TeacherProfileScreen />);
    expect(screen.getByRole('heading', { name: 'Profil & akun' })).toBeTruthy();
    expect(screen.getAllByText('test@example.invalid')).toHaveLength(2);
    expect(screen.getByText('Terverifikasi')).toBeTruthy();
    expect(
      screen
        .getAllByRole('link', { name: /Kelas saya/ })
        .at(-1)
        ?.getAttribute('href'),
    ).toBe('/teacher');
    expect(screen.queryByRole('button', { name: /^Keluar$/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Keluar dari akun' }));
    await waitFor(() => expect(context.logout).toHaveBeenCalledOnce());
    await waitFor(() => expect(context.replace).toHaveBeenCalledWith('/'));
  });
  it('keeps Teacher Profile guarded and Admin logout in the shell', async () => {
    context.pathname = '/teacher/profile';
    render(<TeacherProfileScreen />);
    await waitFor(() => expect(context.replace).toHaveBeenCalledWith('/student'));
    expect(screen.queryByText('test@example.invalid')).toBeNull();
    cleanup();
    context.state = {
      status: 'ready',
      profile: { ...profile, role: 'TEACHER', teacherVerified: false },
      session: { access_token: 'teacher-test' },
    };
    render(<TeacherProfileScreen />);
    await waitFor(() =>
      expect(context.replace).toHaveBeenCalledWith('/teacher/verification-required'),
    );
    expect(screen.queryByText('test@example.invalid')).toBeNull();
    cleanup();
    context.pathname = '/admin/schools';
    context.state = {
      status: 'ready',
      profile: { ...profile, role: 'ADMIN' },
      session: { access_token: 'admin-test' },
    };
    render(<AppShell area="admin">Admin</AppShell>);
    expect(screen.getByRole('button', { name: 'Keluar' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Buka profil' })).toBeNull();
  });
  it('keeps an empty progress range finite and accessible', () => {
    render(<ProgressBar value={0} max={0} label="Level selesai" />);
    expect(
      screen.getByRole('progressbar', { name: 'Level selesai' }).getAttribute('aria-valuenow'),
    ).toBe('0');
    expect(document.body.innerHTML).not.toContain('NaN');
  });
  it('resumes only an accessible level through the API and keeps locked levels non-interactive', async () => {
    vi.mocked(learningApi.subchapter).mockResolvedValue({
      subchapter: { id: 'sub-test', chapterId: 'chapter-test', title: 'Subbab fiktif', order: 0 },
      levels: [
        {
          id: 'open-test',
          title: 'Level terbuka',
          order: 0,
          status: 'inProgress',
          latestScore: 0,
          bestScore: 0,
        },
        {
          id: 'locked-test',
          title: 'Level terkunci',
          order: 1,
          status: 'locked',
          latestScore: null,
          bestScore: null,
        },
      ],
    });
    vi.mocked(learningApi.start).mockResolvedValue({
      id: 'resume-test',
      levelId: 'open-test',
      levelTitle: 'Level terbuka',
      status: 'inProgress',
      startedAt: '2026-10-01T00:00:00Z',
      isDemo: true,
      questions: [],
    });
    renderStudent(<SubchapterScreen />);
    const resume = await screen.findByRole('button', { name: 'Lanjutkan latihan' });
    expect(screen.queryByRole('button', { name: 'Mulai latihan' })).toBeNull();
    expect(screen.getByText('Terkunci')).toBeTruthy();
    fireEvent.click(resume);
    await waitFor(() => expect(context.push).toHaveBeenCalledWith('/student/drill/resume-test'));
    expect(learningApi.start).toHaveBeenCalledExactlyOnceWith('test-token', 'open-test');
  });
});
