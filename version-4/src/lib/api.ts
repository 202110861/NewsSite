const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

let accessToken: string | null = null;
let refreshPromise: Promise<{
  accessToken: string;
  user: AuthUser;
} | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

async function refreshSessionData(): Promise<{
  accessToken: string;
  user: AuthUser;
} | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) return null;
        const data = (await res.json()) as {
          accessToken: string;
          user: AuthUser;
        };
        accessToken = data.accessToken;
        return data;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

export async function refreshSession(): Promise<AuthUser | null> {
  const data = await refreshSessionData();
  if (!data) {
    setAccessToken(null);
    return null;
  }
  return data.user;
}

async function refreshAccessToken(): Promise<string | null> {
  const data = await refreshSessionData();
  return data?.accessToken ?? null;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && retry && !path.startsWith("/auth/")) {
    const newToken = await refreshAccessToken();
    if (newToken) return request<T>(path, options, false);
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new ApiError(res.status, body.message ?? "요청에 실패했습니다.");
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

async function uploadRequest<T>(
  path: string,
  formData: FormData,
  retry = true,
): Promise<T> {
  const headers = new Headers();
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: formData,
    credentials: "include",
  });

  if (res.status === 401 && retry && !path.startsWith("/auth/")) {
    const newToken = await refreshAccessToken();
    if (newToken) return uploadRequest<T>(path, formData, false);
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new ApiError(res.status, body.message ?? "업로드에 실패했습니다.");
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "DELETE",
      body: body ? JSON.stringify(body) : undefined,
    }),
  upload: <T>(path: string, formData: FormData) =>
    uploadRequest<T>(path, formData),
};

export interface AuthUser {
  id: string;
  username: string;
  role: "USER" | "ADMIN";
}

export interface SubscriptionPlan {
  id: string;
  amount: number;
  label: string;
}

export interface PaymentConfig {
  paymentMode: "mock" | "portone_test" | "portone_live";
  kakaoTestUsesZeroAmount: boolean;
  accountTestUsesZeroAmount: boolean;
  webhookUrl?: string;
}

export type PayMethod =
  | "PHONE"
  | "KAKAO_PAY"
  | "NAVER_PAY"
  | "TOSS_PAY"
  | "K_BANK"
  | "KAKAO_BANK";

/** 실제 결제 API 허용 수단 (실연동 오픈 전까지 비활성 — UI만 노출) */
export const ACTIVE_PAY_METHODS = [] as const satisfies readonly PayMethod[];

/** 화면에 보이지만 결제 불가(심사·연동 중) */
export const COMING_SOON_PAY_METHODS = [
  "PHONE",
  "TOSS_PAY",
  "KAKAO_PAY",
] as const satisfies readonly PayMethod[];

/** 결제 수단 UI 배치 (가로 1행) */
export const PAY_METHOD_ROWS = [
  ["PHONE", "TOSS_PAY", "KAKAO_PAY"],
] as const satisfies readonly (readonly PayMethod[])[];

export const DISPLAY_PAY_METHODS = PAY_METHOD_ROWS.flat();

export type DisplayPayMethod = (typeof DISPLAY_PAY_METHODS)[number];

export type ActivePayMethod = (typeof ACTIVE_PAY_METHODS)[number];
export type ComingSoonPayMethod = (typeof COMING_SOON_PAY_METHODS)[number];

export const PAY_METHOD_LABELS: Record<PayMethod, string> = {
  PHONE: "휴대폰 소액결제",
  KAKAO_PAY: "카카오페이",
  NAVER_PAY: "네이버페이",
  TOSS_PAY: "토스페이",
  K_BANK: "케이뱅크",
  KAKAO_BANK: "카카오뱅크",
};

export const PAY_METHOD_COMING_SOON_MESSAGE: Record<
  ComingSoonPayMethod,
  string
> = {
  PHONE:
    "휴대폰 소액결제는 현재 PG 심사·연동 중입니다. 오픈 후 이용하실 수 있습니다.",
  TOSS_PAY:
    "토스페이는 현재 가맹점 심사·연동 중입니다. 오픈 후 이용하실 수 있습니다.",
  KAKAO_PAY:
    "카카오페이는 현재 가맹점 심사·연동 중입니다. 오픈 후 이용하실 수 있습니다.",
};

export function isComingSoonPayMethod(
  method: PayMethod,
): method is ComingSoonPayMethod {
  return (COMING_SOON_PAY_METHODS as readonly string[]).includes(method);
}

export interface Advertisement {
  id: string;
  slotId: string;
  imageUrl: string;
  linkUrl: string;
}
