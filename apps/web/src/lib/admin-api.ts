/**
 * Admin API client for the content-admin backend.
 *
 * Client components fetch through these helpers so the existing UI never touches
 * raw fetch. Every helper returns a discriminated result: either the data or a
 * `{ error }` object the UI can surface directly.
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export type ApiResult<T> = { data: T; error?: never } | { data?: never; error: string };

async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        (body as { message?: unknown })?.message ??
        (body as { error?: string })?.error ??
        'Permintaan gagal.';
      return {
        error: Array.isArray(message) ? message.join(', ') : String(message),
      };
    }

    return { data: body as T };
  } catch {
    return { error: 'Tidak dapat terhubung ke server. Periksa koneksi API.' };
  }
}

// ----------------------------- Types -----------------------------
// Frontend-facing question shape. The API stores stem/question text in
// `stemLatex` and nesting via level -> subchapter -> chapter; this view model
// flattens those for the table.

export type QuestionStatus = 'Ready' | 'Draft' | 'Archived';
export type QuestionType = 'PG' | 'PGK';

export type Question = {
  id: string;
  code: string;
  title: string;
  chapter: string;
  subchapter: string;
  type: QuestionType;
  level: number;
  updated: string;
  status: QuestionStatus;
};

export type Dashboard = {
  schools: Record<string, number>;
  content: { chapters: number; questions: number };
  teacherTokens: Record<string, number>;
  openReports: number;
  publishedTryoutPackages: number;
};

export type Paginated<T> = {
  items: T[];
  meta: { page: number; limit: number; total: number };
};

type ApiQuestion = {
  id: string;
  code: string;
  stemLatex: string;
  type: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  levelId: string;
  updatedAt: string;
};

type ApiChapter = {
  id: string;
  title: string;
  status: string;
  subchapters?: Array<{ id: string; title: string; levels?: Array<{ id: string; title: string }> }>;
};

// ----------------------------- Helpers -----------------------------

const STATUS_TO_FRONT: Record<string, QuestionStatus> = {
  PUBLISHED: 'Ready',
  DRAFT: 'Draft',
  ARCHIVED: 'Archived',
};

const FRONT_TO_STATUS: Record<QuestionStatus, 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'> = {
  Ready: 'PUBLISHED',
  Draft: 'DRAFT',
  Archived: 'ARCHIVED',
};

function toApiStatus(status: QuestionStatus) {
  return FRONT_TO_STATUS[status];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export type CurriculumLookup = {
  chapters: ApiChapter[];
  levelOf: (levelId: string) => { chapter: string; subchapter: string; levelTitle: string };
};

async function loadCurriculum(): Promise<CurriculumLookup> {
  const result = await request<ApiChapter[]>('/admin/curriculum');
  const chapters = result.data ?? [];

  // Build a flat levelId -> names map so question rows can resolve their
  // chapter/subchapter without an extra request per row.
  const levelMap = new Map<string, { chapter: string; subchapter: string; levelTitle: string }>();
  for (const chapter of chapters) {
    for (const subchapter of chapter.subchapters ?? []) {
      for (const level of subchapter.levels ?? []) {
        levelMap.set(level.id, {
          chapter: chapter.title,
          subchapter: subchapter.title,
          levelTitle: level.title,
        });
      }
    }
  }

  return {
    chapters,
    levelOf: (levelId: string) =>
      levelMap.get(levelId) ?? { chapter: '—', subchapter: '—', levelTitle: '—' },
  };
}

// ----------------------------- API -----------------------------

export async function fetchQuestions(): Promise<ApiResult<Question[]>> {
  const [questionsResult, curriculum] = await Promise.all([
    request<Paginated<ApiQuestion>>('/admin/questions?limit=100'),
    loadCurriculum(),
  ]);

  if (questionsResult.error || !questionsResult.data) {
    return { error: questionsResult.error };
  }

  const items = questionsResult.data.items.map((question): Question => {
    const place = curriculum.levelOf(question.levelId);
    return {
      id: question.id,
      code: question.code,
      title: question.stemLatex,
      chapter: place.chapter,
      subchapter: place.subchapter,
      type: question.type === 'MULTIPLE_CHOICE' ? 'PG' : 'PGK',
      level: 1,
      updated: formatDate(question.updatedAt),
      status: STATUS_TO_FRONT[question.status] ?? 'Draft',
    };
  });

  return { data: items };
}

export async function fetchDashboard(): Promise<ApiResult<Dashboard>> {
  return request<Dashboard>('/admin/dashboard');
}

export async function createQuestion(input: {
  code: string;
  title: string;
  chapter: string;
  subchapter: string;
  type: QuestionType;
}): Promise<ApiResult<Question>> {
  // A new question needs a level; create the taxonomy entries on demand when
  // the typed chapter/subchapter names do not exist yet.
  const curriculum = await loadCurriculum();
  const chapter = curriculum.chapters.find((item) => item.title === input.chapter);
  let subchapter = chapter?.subchapters?.find((item) => item.title === input.subchapter);
  let chapterId = chapter?.id;
  let subchapterId = subchapter?.id;

  if (!chapterId) {
    const created = await request<{ id: string }>('/admin/chapters', {
      method: 'POST',
      body: JSON.stringify({ title: input.chapter, sortOrder: curriculum.chapters.length + 1 }),
    });
    if (created.error || !created.data) return { error: created.error };
    chapterId = created.data.id;
  }

  if (!subchapterId) {
    const created = await request<{ id: string }>('/admin/subchapters', {
      method: 'POST',
      body: JSON.stringify({ chapterId, title: input.subchapter, sortOrder: 1 }),
    });
    if (created.error || !created.data) return { error: created.error };
    subchapterId = created.data.id;
  }

  const createdLevel = await request<{ id: string }>('/admin/levels', {
    method: 'POST',
    body: JSON.stringify({ subchapterId, title: 'Default', sortOrder: 1 }),
  });
  if (createdLevel.error || !createdLevel.data) return { error: createdLevel.error };

  const created = await request<ApiQuestion>('/admin/questions', {
    method: 'POST',
    body: JSON.stringify({
      levelId: createdLevel.data.id,
      code: input.code,
      stemLatex: input.title,
      type: input.type === 'PG' ? 'MULTIPLE_CHOICE' : 'MULTIPLE_RESPONSE',
    }),
  });
  if (created.error || !created.data) return { error: created.error };

  return {
    data: {
      id: created.data.id,
      code: created.data.code,
      title: created.data.stemLatex,
      chapter: input.chapter,
      subchapter: input.subchapter,
      type: input.type,
      level: 1,
      updated: formatDate(created.data.updatedAt),
      status: 'Draft',
    },
  };
}

export async function archiveQuestion(id: string, restore: boolean) {
  return request<{ id: string }>(`/admin/questions/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: toApiStatus(restore ? 'Draft' : 'Archived') }),
  });
}

export async function publishQuestion(id: string) {
  return request<{ id: string }>(`/admin/questions/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: toApiStatus('Ready') }),
  });
}

export async function updateQuestion(
  id: string,
  input: { title: string; chapter: string; subchapter: string; type: QuestionType },
) {
  return request<ApiQuestion>(`/admin/questions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      stemLatex: input.title,
      type: input.type === 'PG' ? 'MULTIPLE_CHOICE' : 'MULTIPLE_RESPONSE',
    }),
  });
}
