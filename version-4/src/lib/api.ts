const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

let accessToken: string | null = null
let refreshPromise: Promise<string | null> | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        })
        if (!res.ok) return null
        const data = (await res.json()) as { accessToken: string }
        accessToken = data.accessToken
        return data.accessToken
      } catch {
        return null
      } finally {
        refreshPromise = null
      }
    })()
  }
  return refreshPromise
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (res.status === 401 && retry && !path.startsWith('/auth/')) {
    const newToken = await refreshAccessToken()
    if (newToken) return request<T>(path, options, false)
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string }
    throw new ApiError(res.status, body.message ?? '요청에 실패했습니다.')
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

export interface AuthUser {
  id: string
  username: string
  role: 'USER' | 'ADMIN'
}

export interface SubscriptionPlan {
  id: string
  amount: number
  label: string
}

export interface Advertisement {
  id: string
  slotId: string
  imageUrl: string
  linkUrl: string
}
