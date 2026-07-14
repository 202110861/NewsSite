import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthCallbackPage() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function complete() {
      try {
        const user = await refreshUser();
        if (cancelled) return;
        if (!user) {
          setError("소셜 로그인 세션을 확인하지 못했습니다.");
          return;
        }
        navigate("/", { replace: true });
      } catch {
        if (!cancelled) {
          setError("소셜 로그인 세션을 확인하지 못했습니다.");
        }
      }
    }

    void complete();
    return () => {
      cancelled = true;
    };
  }, [navigate, refreshUser]);

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center sm:px-6">
        <p className="text-sm text-flash-600">{error}</p>
        <button
          type="button"
          onClick={() => navigate("/login", { replace: true })}
          className="mt-4 text-sm font-semibold text-flash-600 hover:underline"
        >
          로그인으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 text-center sm:px-6">
      <p className="text-sm text-ink-500">로그인 처리 중...</p>
    </div>
  );
}
