import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function MastheadBar() {
  const { user, logout } = useAuth();

  return (
    <div className="border-b border-ink-900/10 bg-paper-100 text-[11px] text-ink-500">
      <div className="mx-auto flex max-w-6xl items-center justify-end px-4 py-1.5 sm:px-6">
        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <span className="font-semibold text-ink-700">
                {user.username}님
              </span>
              <span className="text-ink-300">|</span>
              {user.role === "ADMIN" && (
                <>
                  <Link to="/admin/reviews" className="hover:text-ink-900">
                    기사 검수
                  </Link>
                  <span className="text-ink-300">|</span>
                </>
              )}
              <Link to="/support" className="hover:text-ink-900">
                후원
              </Link>
              <span className="text-ink-300">|</span>
              <button
                type="button"
                onClick={() => logout()}
                className="hover:text-ink-900"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-ink-900">
                로그인
              </Link>
              <span className="text-ink-300">|</span>
              <Link to="/signup" className="hover:text-ink-900">
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  );
}
