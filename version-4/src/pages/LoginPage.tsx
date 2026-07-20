import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getApiErrorMessage } from "../lib/errors";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const from =
    (location.state as { from?: string; message?: string } | null)?.from ?? "/";
  const initialMessage = (location.state as { message?: string } | null)
    ?.message;
  const oauthError = searchParams.get("error");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(oauthError ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const loggedIn = await login(username, password);
      const target =
        from !== "/"
          ? from
          : loggedIn.role === "ADMIN"
            ? "/admin/reviews"
            : "/";
      navigate(target, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "로그인에 실패했습니다."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-ink-900">로그인</h1>
      <p className="mt-2 text-sm text-ink-500">경제인뉴스에 로그인하세요.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-semibold text-ink-700"
          >
            아이디
          </label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-ink-900/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-flash-600"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-ink-700"
          >
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-ink-900/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-flash-600"
          />
        </div>

        {error && <p className="text-sm text-flash-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-flash-600 py-3 text-sm font-bold text-white hover:bg-flash-700 disabled:opacity-60"
        >
          {submitting ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <div className="mt-8">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-ink-900/10" />
          <span className="text-xs text-ink-500">또는</span>
          <div className="h-px flex-1 bg-ink-900/10" />
        </div>

        <div className="mt-4 space-y-3">
          <a
            href={`${API_BASE}/auth/naver`}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#03C75A] py-3 text-sm font-bold text-white hover:brightness-95"
          >
            <NaverIcon />
            네이버로 로그인
          </a>
          <a
            href={`${API_BASE}/auth/google`}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-ink-900/15 bg-white py-3 text-sm font-bold text-ink-800 hover:bg-ink-900/[0.03]"
          >
            <GoogleIcon />
            Google로 로그인
          </a>
          <a
            href={`${API_BASE}/auth/facebook`}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1877F2] py-3 text-sm font-bold text-white hover:brightness-95"
          >
            <FacebookIcon />
            Facebook으로 로그인
          </a>
        </div>
      </div>

      {initialMessage && (
        <p className="mt-4 text-sm text-section-economy">{initialMessage}</p>
      )}

      <p className="mt-6 text-center text-sm text-ink-500">
        계정이 없으신가요?{" "}
        <Link
          to="/signup"
          className="font-semibold text-flash-600 hover:underline"
        >
          회원가입
        </Link>
      </p>
    </div>
  );
}

function NaverIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M10.6 8.47 5.27 1H1v14h4.4V7.53L10.73 15H15V1h-4.4v7.47Z"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
      />
    </svg>
  );
}
