export type ApiError = Error & {
  status?: number;
  detail?: string;
  payload?: unknown;
};

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
const apiBaseUrl = rawBaseUrl.replace(/\/+$/, '');

export function resolveApiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (!apiBaseUrl) {
    return path;
  }

  return `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

function extractErrorDetail(payload: unknown): string | undefined {
  if (!payload) {
    return undefined;
  }

  if (typeof payload === 'string') {
    return payload || undefined;
  }

  if (typeof payload !== 'object') {
    return undefined;
  }

  const record = payload as Record<string, unknown>;
  if (typeof record.detail === 'string') {
    return record.detail;
  }

  for (const value of Object.values(record)) {
    if (typeof value === 'string') {
      return value;
    }

    if (Array.isArray(value) && typeof value[0] === 'string') {
      return value[0];
    }
  }

  return undefined;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});
  const isFormData = init.body instanceof FormData;

  if (!isFormData && !headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(resolveApiUrl(path), {
    ...init,
    headers,
    credentials: 'include',
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const detail = extractErrorDetail(payload);
    const error = new Error(detail || 'Request failed') as ApiError;

    error.status = response.status;
    error.detail = detail;
    error.payload = payload;

    throw error;
  }

  return payload as T;
}
