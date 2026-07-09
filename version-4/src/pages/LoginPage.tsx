import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../lib/errors";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: string; message?: string } | null)?.from ?? "/";
  const initialMessage = (location.state as { message?: string } | null)
    ?.message;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
