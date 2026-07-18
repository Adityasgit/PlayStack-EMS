// All API calls use relative URLs so they go through the Next.js rewrite proxy.
// This makes cookies first-party (same-origin), eliminating Chrome's third-party
// cookie blocking. The proxy in next.config.ts forwards /api/* to the backend.
const API_PREFIX = '/api';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  // Prefix paths that don't already start with /api
  const url = path.startsWith(API_PREFIX) ? path : `${API_PREFIX}${path}`;

  const res = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  // Handle 401 globally — redirect to login
  if (res.status === 401 && typeof window !== 'undefined') {
    // Don't redirect if already on login page
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    throw new ApiError(401, 'Session expired');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || body.message || res.statusText);
  }

  // Handle empty responses (e.g., 204 No Content)
  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),

  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),

  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, {
      method: 'POST',
      body: formData,
      headers: {}, // Don't set Content-Type — browser sets it with boundary
    }),
};

export { ApiError };
