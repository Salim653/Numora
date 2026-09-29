export type HealthResponse = {
  status: 'ok';
  service: string;
  timestamp: string;
  version: string;
};

const fallbackBaseUrl = 'http://localhost:3001/api/v1';

export type IdentityProfile = {
  id: string;
  role: 'STUDENT' | 'TEACHER';
  displayName: string;
  email: string;
  status: 'ACTIVE';
  teacherVerified: boolean;
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

async function identityRequest(
  path: string,
  token: string,
  options?: RequestInit,
): Promise<IdentityProfile> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? fallbackBaseUrl;
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/identity/${path}`, {
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
    { code?: string; detail?: string } | IdentityProfile | null;
  if (!response.ok) {
    const problem = body as { code?: string; detail?: string } | null;
    throw new ApiProblem(
      response.status,
      problem?.code ?? 'API_ERROR',
      problem?.detail ?? 'Permintaan gagal. Coba lagi.',
    );
  }
  return body as IdentityProfile;
}

export const getIdentity = (token: string) => identityRequest('me', token);
export const registerIdentity = (token: string, role: 'STUDENT' | 'TEACHER', displayName: string) =>
  identityRequest('registrations', token, {
    method: 'POST',
    body: JSON.stringify({ role, displayName }),
  });

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
