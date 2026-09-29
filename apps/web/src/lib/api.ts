export type HealthResponse = {
  status: 'ok';
  service: string;
  timestamp: string;
  version: string;
};

const fallbackBaseUrl = 'http://localhost:3001/api/v1';

export type IdentityProfile = {
  id: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  displayName: string;
  email: string;
  status: 'ACTIVE' | 'DISABLED';
  teacherVerified: boolean | null;
  studentAffiliation: 'MANDIRI' | 'SCHOOL' | null;
};

export class ApiProblem extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

async function apiRequest<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? fallbackBaseUrl;
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options?.headers,
      },
      cache: 'no-store',
    });
  } catch {
    throw new ApiProblem(0, 'NETWORK_ERROR', 'Koneksi ke server gagal. Coba lagi.');
  }
  const body = (await response.json().catch(() => null)) as
    { code?: string; detail?: string } | T | null;
  if (!response.ok) {
    const problem = body as { code?: string; detail?: string } | null;
    throw new ApiProblem(
      response.status,
      problem?.code ?? 'API_ERROR',
      problem?.detail ?? 'Permintaan gagal. Coba lagi.',
    );
  }
  return body as T;
}

export const getIdentity = (token: string) => apiRequest<IdentityProfile>('identity/me', token);
export const registerIdentity = (token: string, role: 'STUDENT' | 'TEACHER') =>
  apiRequest<IdentityProfile>('identity/me', token, {
    method: 'POST',
    body: JSON.stringify({ role }),
  });

// Small client shapes mirror OpenAPI until this repo has TypeScript contract generation.
export type ClassSummary = { id: string; name: string; joinCode?: string };
export type StudentSummary = { id: string; displayName: string };
export type ClassesResponse = { items: ClassSummary[] };
export type ClassStudentsResponse = { class: ClassSummary; items: StudentSummary[] };
export type SchoolSummary = { id: string; name: string };
export type TeacherStudentProgress = {
  class: ClassSummary;
  student: StudentSummary;
  latestDrillScore: number | null;
  levels: {
    levelId: string;
    chapterLabel: string;
    subchapterLabel: string;
    levelLabel: string;
    accessStatus: 'LOCKED' | 'UNLOCKED';
    inProgress: boolean;
    latestDrillScore: number | null;
    bestDrillScore: number | null;
  }[];
};

export const getSchools = (token: string) =>
  apiRequest<{ items: SchoolSummary[] }>('schools', token);
export const verifyTeacher = (token: string, schoolId: string, verificationToken: string) =>
  apiRequest<{ verified: boolean }>(`schools/${encodeURIComponent(schoolId)}/teacher-verifications`, token, {
    method: 'POST',
    body: JSON.stringify({ token: verificationToken }),
  });

export const getTeacherClasses = (token: string) => apiRequest<ClassesResponse>('classes', token);
export const createTeacherClass = (token: string, name: string) =>
  apiRequest<ClassSummary & { joinCode: string }>('classes', token, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
export const joinClass = (token: string, joinCode: string) =>
  apiRequest<{ class: ClassSummary; joined: boolean }>('classes/join', token, {
    method: 'POST',
    body: JSON.stringify({ joinCode }),
  });
export const getClassStudents = (token: string, classId: string) =>
  apiRequest<ClassStudentsResponse>(`classes/${encodeURIComponent(classId)}/students`, token);
export const getTeacherStudentProgress = (token: string, classId: string, studentId: string) =>
  apiRequest<TeacherStudentProgress>(
    `classes/${encodeURIComponent(classId)}/students/${encodeURIComponent(studentId)}/progress`,
    token,
  );

export type AdminSchool = SchoolSummary & {
  code: string;
  status: 'ACTIVE' | 'INACTIVE';
};
export type TeacherTokenSummary = {
  id: string;
  expiresAt: string;
  usedAt: string | null;
  revokedAt: string | null;
};
export type IssuedTeacherToken = { id: string; token: string; expiresAt: string };
export const listAdminSchools = (token: string) =>
  apiRequest<{ items: AdminSchool[] }>('admin/schools', token);
export const createSchool = (token: string, code: string, name: string) =>
  apiRequest<AdminSchool>('admin/schools', token, {
    method: 'POST', body: JSON.stringify({ code, name }),
  });
export const updateSchool = (token: string, schoolId: string, input: { name?: string; status?: 'ACTIVE' | 'INACTIVE' }) =>
  apiRequest<AdminSchool>(`admin/schools/${encodeURIComponent(schoolId)}`, token, {
    method: 'PATCH', body: JSON.stringify(input),
  });
export const listTeacherTokens = (token: string, schoolId: string) =>
  apiRequest<{ items: TeacherTokenSummary[] }>(
    `admin/schools/${encodeURIComponent(schoolId)}/teacher-tokens`, token,
  );
export const issueTeacherToken = (token: string, schoolId: string) =>
  apiRequest<IssuedTeacherToken>(
    `admin/schools/${encodeURIComponent(schoolId)}/teacher-tokens`, token, { method: 'POST' },
  );
export const reissueTeacherToken = (token: string, schoolId: string, tokenId: string) =>
  apiRequest<IssuedTeacherToken>(
    `admin/schools/${encodeURIComponent(schoolId)}/teacher-tokens/${encodeURIComponent(tokenId)}/reissue`,
    token, { method: 'POST' },
  );
export const revokeTeacherToken = (token: string, schoolId: string, tokenId: string) =>
  apiRequest<{ revoked: boolean }>(
    `admin/schools/${encodeURIComponent(schoolId)}/teacher-tokens/${encodeURIComponent(tokenId)}/revoke`,
    token, { method: 'POST' },
  );

export async function getApiHealth(): Promise<HealthResponse | null> {
  const baseUrl =
    process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? fallbackBaseUrl;

  try {
    const response = await fetch(`${baseUrl}/health`, { cache: 'no-store' });
    if (!response.ok) return null;
    return (await response.json()) as HealthResponse;
  } catch {
    return null;
  }
}
