export const API_PREFIX = '/api/v1';

export type ProblemDetails = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  request_id?: string;
  [key: string]: unknown;
};

export class ApiError extends Error {
  public readonly status: number;
  public readonly problem: ProblemDetails | null;

  constructor(status: number, problem: ProblemDetails | null, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.problem = problem;
  }
}

type ResolveApiBaseInput = {
  isServer: boolean;
  internalUrl?: string;
};

export function resolveApiBase({ isServer, internalUrl }: ResolveApiBaseInput): string {
  if (!isServer) {
    return API_PREFIX;
  }

  if (!internalUrl) {
    throw new Error('API_INTERNAL_URL is required on the server');
  }

  return `${internalUrl.replace(/\/+$/, '')}${API_PREFIX}`;
}

export function getApiBaseUrl(): string {
  return resolveApiBase({
    isServer: typeof window === 'undefined',
    internalUrl: process.env.API_INTERNAL_URL,
  });
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const response = await fetch(`${getApiBaseUrl()}${normalizedPath}`, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    let problem: ProblemDetails | null = null;

    try {
      problem = (await response.json()) as ProblemDetails;
    } catch {
      problem = null;
    }

    throw new ApiError(
      response.status,
      problem,
      problem?.detail ?? `API request failed with status ${response.status}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
