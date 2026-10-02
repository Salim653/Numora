import { expect, test, type Page } from '@playwright/test';

const browserErrors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on('pageerror', (error) => errors.push(error.message));
});
test.afterEach(({ page }) => {
  expect(browserErrors.get(page)).toEqual([]);
});
// Browser fixtures live only in the test harness. No application auth bypass exists.
const studentId = '11111111-1111-4111-8111-111111111111';
const chapterId = '22222222-2222-4222-8222-222222222222';
const subchapterId = '33333333-3333-4333-8333-333333333333';
const attemptId = '44444444-4444-4444-8444-444444444444';
const questionId = '55555555-5555-4555-8555-555555555555';
const levelId = '66666666-6666-4666-8666-666666666666';
async function fixtures(
  page: Page,
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' = 'STUDENT',
  teacherVerified = true,
  verificationIdentityDelayMs = 0,
) {
  const jwt = [
    Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
    Buffer.from(
      JSON.stringify({
        sub: studentId,
        exp: Math.floor(Date.now() / 1000) + 3600,
        role: 'authenticated',
      }),
    ).toString('base64url'),
    'test-signature',
  ].join('.');
  await page.addInitScript(
    ({ jwt, studentId }) => {
      if (!localStorage.getItem('test-logged-out'))
        localStorage.setItem(
          'sb-numora-e2e-auth-token',
          JSON.stringify({
            access_token: jwt,
            refresh_token: 'fixture-refresh',
            token_type: 'bearer',
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            user: {
              id: studentId,
              aud: 'authenticated',
              role: 'authenticated',
              email: 'fixture@example.test',
              app_metadata: { provider: 'google' },
              user_metadata: { name: 'Siswa fixture' },
              created_at: '2026-01-01T00:00:00Z',
            },
          }),
        );
    },
    { jwt, studentId },
  );
  let school = false;
  let option: string | null = null;
  let completed = false;
  await page.route('https://numora-e2e.supabase.co/**', (route) => route.fulfill({ json: {} }));
  await page.route('http://localhost:3301/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname.replace('/api/v1', '');
    let data: unknown;
    if (path === '/identity/me') {
      if (teacherVerified && verificationIdentityDelayMs)
        await new Promise((resolve) => setTimeout(resolve, verificationIdentityDelayMs));
      data = {
        id: studentId,
        displayName: 'Siswa fixture',
        role,
        status: 'ACTIVE',
        email: 'fixture@example.test',
        studentAffiliation: school ? 'SCHOOL' : 'MANDIRI',
        teacherVerified: role === 'TEACHER' ? teacherVerified : null,
      };
    } else if (path === '/schools')
      data = { items: [{ id: chapterId, code: 'QA', name: 'Sekolah fixture' }] };
    else if (path === `/schools/${chapterId}/teacher-verifications`) {
      teacherVerified = true;
      data = { verified: true };
    } else if (path === '/classes/join') {
      school = true;
      data = { joined: true, class: { id: chapterId, name: 'IX fixture' } };
    } else if (path === '/students/me/dashboard')
      data = {
        displayName: 'Siswa fixture',
        affiliation: school ? 'SCHOOL' : 'MANDIRI',
        class: school ? { id: chapterId, name: 'IX fixture', schoolName: 'Sekolah fixture' } : null,
        completedLevels: completed ? 1 : 0,
        availableLevels: 2,
        latestDrillScore: completed ? 80 : null,
        bestDrillScore: completed ? 80 : null,
        activities: [],
        activeDrill: !completed ? { attemptId, title: 'Drill fixture', levelId } : null,
        features: {
          drill: true,
          tryout: school,
          pvp: false,
          pretest: false,
          classLeaderboard: false,
          pendingPolicies: ['OPEN-07', 'OPEN-11'],
        },
      };
    else if (path === '/chapters')
      data = { chapters: [{ id: chapterId, title: 'Aljabar fixture', order: 1 }] };
    else if (path === `/chapters/${chapterId}`)
      data = {
        chapter: { id: chapterId, title: 'Aljabar fixture', order: 1 },
        subchapters: [{ id: subchapterId, chapterId, title: 'Persamaan fixture', order: 1 }],
      };
    else if (path === `/subchapters/${subchapterId}`)
      data = {
        subchapter: { id: subchapterId, chapterId, title: 'Persamaan fixture', order: 1 },
        levels: [
          {
            id: levelId,
            title: 'Level 1 fixture',
            order: 1,
            status: 'inProgress',
            latestScore: null,
            bestScore: null,
          },
        ],
      };
    else if (path === `/assessment-attempts/${attemptId}/answers/${questionId}`) {
      option = (route.request().postDataJSON() as { optionId: string | null }).optionId;
      data = { questionInstanceId: questionId, selectedOptionId: option };
    } else if (path === `/assessment-attempts/${attemptId}/submit`) {
      completed = true;
      data = {};
    } else if (path.endsWith('/result'))
      data = {
        attemptId,
        levelId,
        levelTitle: 'Level 1 fixture',
        score: 80,
        correctCount: 8,
        questionCount: 10,
        rawPoints: 8,
        mastered: true,
        stars: 2,
        unlockedLevelId: null,
        isDemo: true,
        explanationState: 'available',
        questions: [],
        recommendations: [],
      };
    else if (path === `/assessment-attempts/${attemptId}` || path === '/assessments/drill/attempts')
      data = {
        id: attemptId,
        levelId,
        levelTitle: 'Drill fixture',
        status: completed ? 'completed' : 'inProgress',
        startedAt: '2026-10-01T00:00:00Z',
        isDemo: true,
        questions: [
          {
            questionInstanceId: questionId,
            order: 1,
            stem: 'Fixture: 1 + 1?',
            options: [
              { id: 'A', text: '2' },
              { id: 'B', text: '3' },
            ],
            selectedOptionId: option,
          },
        ],
      };
    else if (path === '/students/me/assessment-results')
      data = {
        records: [
          {
            attemptId,
            activity: 'tryout',
            title: 'Tryout fixture',
            submittedAt: '2026-10-01T00:00:00Z',
            resultState: 'waitingIrt',
            score: null,
            isDemo: true,
          },
        ],
        nextCursor: null,
      };
    else if (path === '/tryout/packages/current')
      data = {
        state: 'unavailable',
        id: null,
        eligible: school,
        title: null,
        releaseAt: null,
        durationSeconds: null,
        questionCount: null,
        isDemo: false,
        attemptId: null,
      };
    else if (path === '/pvp/availability')
      data = { available: false, reasonCode: 'PVP_POLICY_OPEN', message: 'PvP belum tersedia.' };
    else if (path === '/leaderboards/class' && !school)
      return route.fulfill({
        status: 403,
        contentType: 'application/problem+json',
        json: {
          code: 'CLASS_REQUIRED',
          detail: 'Bergabung ke kelas untuk mengakses peringkat kelas.',
        },
      });
    else if (path.startsWith('/leaderboards/'))
      data = {
        policyPending: true,
        reasonCode: path.endsWith('/class') ? 'OPEN-11' : 'OPEN-07',
        className: school ? 'IX fixture' : null,
        unit: 'points',
        period: {
          startsAt: '2026-09-30T17:00:00Z',
          endsAt: '2026-10-07T17:00:00Z',
          timezone: 'Asia/Jakarta',
        },
        updatedAt: null,
        entries: [],
        ownEntry: null,
      };
    else if (path === '/classes')
      data =
        route.request().method() === 'POST'
          ? { id: chapterId, name: 'IX fixture', joinCode: 'QA2345' }
          : { items: [{ id: chapterId, name: 'IX fixture', joinCode: 'QA2345' }] };
    else if (path === `/classes/${chapterId}/students`)
      data = {
        class: { id: chapterId, name: 'IX fixture' },
        items: [{ id: studentId, displayName: 'Siswa fixture' }],
      };
    else if (path === `/classes/${chapterId}/students/${studentId}/progress`)
      data = {
        class: { id: chapterId, name: 'IX fixture' },
        student: { id: studentId, displayName: 'Siswa fixture' },
        latestDrillScore: 0,
        levels: [
          {
            levelId,
            chapterLabel: 'Aljabar',
            subchapterLabel: 'Persamaan',
            levelLabel: 'Level 1',
            accessStatus: 'UNLOCKED',
            inProgress: false,
            latestDrillScore: 0,
            bestDrillScore: 0,
          },
        ],
      };
    else if (path === '/admin/schools')
      data = { items: [{ id: chapterId, code: 'QA', name: 'Sekolah fixture', status: 'ACTIVE' }] };
    else if (path === `/admin/schools/${chapterId}/teacher-tokens`)
      data =
        route.request().method() === 'POST'
          ? { id: questionId, token: 'QAAB2345', expiresAt: '2026-10-05T00:00:00Z' }
          : { items: [] };
    else
      return route.fulfill({
        status: 404,
        json: { detail: `Unexpected fixture request: ${path}` },
      });
    return route.fulfill({ json: data });
  });
}
for (const width of [320, 390, 768, 1440])
  test(`student routes at ${width}px use real-data boundaries and accessible navigation`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await fixtures(page);
    await page.goto('/student');
    await expect(page.getByRole('heading', { name: /Halo, Siswa/ })).toBeVisible();
    await expect(page.getByText('User Mandiri', { exact: true })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`dashboard-${width}.png`), fullPage: true });
    const nav = page.getByRole('navigation', {
      name: width <= 959 ? 'Navigasi utama' : 'Navigasi Ruang belajar',
      exact: true,
    });
    await nav.getByRole('link', { name: 'Belajar', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Belajar matematika' })).toBeVisible();
    await page.getByRole('link', { name: /Aljabar fixture/ }).click();
    await page.getByRole('link', { name: /Persamaan fixture/ }).click();
    await page.getByRole('button', { name: 'Lanjutkan latihan' }).click();
    await page.getByRole('radio').first().check();
    await expect(page.getByText('Tersimpan', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('radio').first()).toBeChecked();
    await page.screenshot({ path: testInfo.outputPath(`drill-${width}.png`), fullPage: true });
    await page.getByRole('button', { name: 'Kirim Drill' }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('navigation', { name: 'Navigasi utama' })).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Navigasi Ruang belajar' })).toHaveCount(0);
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Kirim Drill' }).click();
    await expect(page.getByText('Tuntas', { exact: true })).toBeVisible();
    for (const [label, text] of [
      ['Tryout', 'Tryout untuk siswa sekolah'],
      ['Progres', 'Menunggu hasil'],
      ['PvP', 'PvP belum tersedia'],
      ['Peringkat', 'Peringkat belum tersedia'],
    ] as const) {
      if (label === 'PvP' || label === 'Peringkat')
        await page.goto(label === 'PvP' ? '/student/pvp' : '/student/leaderboards');
      else await nav.getByRole('link', { name: label, exact: true }).click();
      await expect(page.getByText(text!, { exact: true })).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
    }
    await nav.getByRole('link', { name: 'Belajar', exact: true }).focus();
    await page.keyboard.press('Tab');
    await expect(nav.getByRole('link', { name: 'Tryout', exact: true })).toBeFocused();
  });
for (const joinCode of ['FIX234', 'QA_LEGACY-CLASS'])
  test(`join class ${joinCode} refreshes eligibility, and removed demo routes return 404`, async ({
    page,
  }) => {
    await fixtures(page);
    await page.goto('/student');
    await page.getByRole('link', { name: 'Buka profil' }).click();
    await page.getByLabel('Kode kelas').fill(` ${joinCode} `);
    await page.getByRole('button', { name: 'Gabung kelas', exact: true }).click();
    await expect(page.getByText('Terhubung dengan kelas', { exact: true })).toBeVisible();
    await page.goto('/student');
    await expect(page.getByRole('heading', { name: 'IX fixture', exact: true })).toBeVisible();
    await expect(page.getByText('Sekolah fixture', { exact: true })).toBeVisible();
    for (const path of ['/demo/student', '/demo/pvp', '/demo/leaderboards']) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);
      expect(response?.request().redirectedFrom()).toBeNull();
    }
  });

for (const width of [390, 1440]) {
  test(`Teacher class monitoring at ${width}px keeps zero scores and accessible navigation`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await fixtures(page, 'TEACHER');
    await page.goto('/teacher');
    await page.getByRole('link', { name: /IX fixture/ }).click();
    await page.getByRole('link', { name: /Siswa fixture/ }).click();
    await expect(page.getByRole('heading', { name: 'Progres per level' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '0', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: testInfo.outputPath(`teacher-${width}.png`), fullPage: true });
  });
  test(`Admin school/token workflow at ${width}px retains operational forms`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await fixtures(page, 'ADMIN');
    await page.goto('/admin/schools');
    await expect(page.getByRole('button', { name: 'Keluar', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Buka profil' })).toHaveCount(0);
    await page.getByRole('button', { name: /Sekolah fixture/ }).click();
    await page.getByRole('button', { name: 'Terbitkan token' }).click();
    await expect(page.getByText('QAAB2345', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: testInfo.outputPath(`admin-${width}.png`), fullPage: true });
  });
}

test('Teacher profile owns logout and signed-out Teacher routes stay protected', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await fixtures(page, 'TEACHER');
  await page.goto('/teacher');
  await expect(page.getByRole('button', { name: 'Keluar', exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'Buka profil' }).click();
  await expect(page).toHaveURL(/\/teacher\/profile$/);
  await expect(page.getByRole('heading', { name: 'Profil & akun' })).toBeVisible();
  await expect(page.getByText('Terverifikasi')).toBeVisible();
  await expect(page.getByRole('link', { name: /Kelas saya/ }).last()).toHaveAttribute(
    'href',
    '/teacher',
  );
  await page.evaluate(() => localStorage.setItem('test-logged-out', '1'));
  await page.getByRole('button', { name: 'Keluar dari akun' }).click();
  await expect(page).toHaveURL('http://localhost:3300/');
  await page.goto('/teacher/profile');
  await expect(page).toHaveURL('http://localhost:3300/');
  await expect(page.getByRole('heading', { name: 'Profil & akun' })).toHaveCount(0);
});

test('Student cannot open Teacher profile', async ({ page }) => {
  await fixtures(page);
  await page.goto('/teacher/profile');
  await expect(page).toHaveURL('http://localhost:3300/student');
  await expect(page.getByRole('heading', { name: 'Profil & akun' })).toHaveCount(0);
});

test('signed-out login offers Google authentication without removed demo destinations', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Lanjutkan dengan Google' })).toBeVisible();
  await expect(page.locator('a[href^="/demo/"]')).toHaveCount(0);
});

for (const verificationToken of ['QAAB2345', 'Ab_cd-'.repeat(6)]) {
  test(`Teacher verification accepts ${verificationToken.length === 8 ? 'short' : 'legacy'} token without changing capitalization`, async ({
    page,
  }) => {
    await fixtures(page, 'TEACHER', false);
    await page.goto('/teacher/verification-required');
    await page.getByLabel('Sekolah', { exact: true }).selectOption(chapterId);
    await page.getByLabel('Token verifikasi').fill(` ${verificationToken} `);
    const request = page.waitForRequest((request) =>
      request.url().endsWith('/teacher-verifications'),
    );
    await page.getByRole('button', { name: 'Verifikasi dan lanjutkan' }).click();
    expect((await request).postDataJSON()).toEqual({ token: verificationToken });
    await expect(page).toHaveURL(/\/teacher$/);
    await expect(page.getByRole('heading', { name: 'Kelas saya', exact: true })).toBeVisible();
  });
}

test('Teacher stays on verification while refreshed identity is pending', async ({ page }) => {
  await fixtures(page, 'TEACHER', false, 2_000);
  const teacherNavigations: string[] = [];
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame() && new URL(frame.url()).pathname === '/teacher')
      teacherNavigations.push(frame.url());
  });
  await page.goto('/teacher/verification-required');
  await page.getByLabel('Sekolah', { exact: true }).selectOption(chapterId);
  await page.getByLabel('Token verifikasi').fill('QAAB2345');
  const refreshedIdentity = page.waitForRequest((request) =>
    request.url().endsWith('/identity/me'),
  );
  await page.getByRole('button', { name: 'Verifikasi dan lanjutkan' }).click();

  await refreshedIdentity;
  await page.waitForTimeout(250);
  expect(teacherNavigations).toHaveLength(0);
  await expect(page).toHaveURL(/\/teacher$/);
});

for (const { role, verified, path, destination } of [
  { role: 'STUDENT', verified: true, path: '/teacher', destination: '/student' },
  { role: 'TEACHER', verified: true, path: '/student', destination: '/teacher' },
  {
    role: 'TEACHER',
    verified: false,
    path: '/admin/schools',
    destination: '/teacher/verification-required',
  },
  { role: 'ADMIN', verified: true, path: '/student', destination: '/admin/schools' },
] as const) {
  test(`${role}${verified ? '' : ' unverified'} cannot enter ${path}`, async ({ page }) => {
    await fixtures(page, role, verified);
    await page.goto(path);
    await expect(page).toHaveURL(new RegExp(`${destination}$`));
  });
}
