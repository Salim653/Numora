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
import { learningApi } from './api';
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
});
afterEach(cleanup);
function renderStudent(children: React.ReactNode) {
  return render(<StudentAccess>{children}</StudentAccess>);
}
describe('responsive learning composition', () => {
  it('mounts Home with its query provider and truthful empty states, including a zero score', async () => {
    renderStudent(<NewStudentDashboard />);
    await screen.findByText('0 / 100');
    expect(screen.getByText('Materi sedang disiapkan')).toBeTruthy();
    expect(await screen.findByText('Memerlukan kelas')).toBeTruthy();
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
  it('joins a class through the existing API then refreshes authoritative account affiliation', async () => {
    vi.mocked(joinClass).mockResolvedValue({
      class: { id: 'class-test', name: 'IX Fiktif' },
      joined: true,
    });
    renderStudent(<ProfileScreen />);
    fireEvent.change(screen.getByLabelText(/Kode kelas/), { target: { value: ' TEST-CODE ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Gabung kelas' }));
    await waitFor(() => expect(joinClass).toHaveBeenCalledWith('test-token', 'TEST-CODE'));
    await waitFor(() => expect(context.refresh).toHaveBeenCalledOnce());
  });
  it('shows a class access action rather than a start action for an ineligible Tryout', async () => {
    renderStudent(<TryoutScreen />);
    const link = await screen.findByRole('link', { name: 'Gabung kelas' });
    expect(link.getAttribute('href')).toBe('/student/profile');
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
