export type HealthResponse = {
  status: 'ok';
  service: string;
  timestamp: string;
  version: string;
};

const fallbackBaseUrl = 'http://localhost:3001/api/v1';

export async function getApiHealth(): Promise<HealthResponse | null> {
  const baseUrl = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? fallbackBaseUrl;

  try {
    const response = await fetch(`${baseUrl}/health`, { cache: 'no-store' });
    if (!response.ok) return null;
    return (await response.json()) as HealthResponse;
  } catch {
    return null;
  }
}
