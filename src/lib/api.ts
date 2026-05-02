export type ApiError = Error & { status?: number; detail?: string };

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
    const error = new Error(
      typeof payload === 'object' && payload && 'detail' in payload
        ? String((payload as any).detail)
        : typeof payload === 'string'
          ? payload
          : 'Request failed',
    ) as ApiError;

    error.status = response.status;
    error.detail = typeof payload === 'object' && payload && 'detail' in payload
      ? String((payload as any).detail)
      : undefined;

    throw error;
  }

  return payload as T;
}
