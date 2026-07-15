import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface MastheadLinksProps {
  className?: string;
  linkClassName?: string;
  separatorClassName?: string;
  onNavigate?: () => void;
}

export function MastheadLinks({
  className = "flex items-center gap-3",
  linkClassName = "hover:text-ink-900",
  separatorClassName = "text-ink-300",
  onNavigate,
}: MastheadLinksProps) {
  const { user, logout } = useAuth();

  return (
    <nav className={className}>
      {user ? (
        <>
          <span className="font-semibold text-ink-700">{user.username}님</span>
          <span className={separatorClassName}>|</span>
          {user.role === "USER" && (
            <>
              <Link
                to="/mypage"
                className={linkClassName}
                onClick={onNavigate}
              >
                마이페이지
              </Link>
              <span className={separatorClassName}>|</span>
            </>
          )}
          {user.role === "ADMIN" && (
            <>
              <Link
                to="/admin/reviews"
                className={linkClassName}
                onClick={onNavigate}
              >
                기사 검수
              </Link>
              <span className={separatorClassName}>|</span>
            </>
          )}
          <Link to="/support" className={linkClassName} onClick={onNavigate}>
            후원
          </Link>
          <span className={separatorClassName}>|</span>
          <button
            type="button"
            onClick={() => {
              void logout();
              onNavigate?.();
            }}
            className={linkClassName}
          >
            로그아웃
          </button>
        </>
      ) : (
        <>
          <Link to="/login" className={linkClassName} onClick={onNavigate}>
            로그인
          </Link>
          <span className={separatorClassName}>|</span>
          <Link to="/signup" className={linkClassName} onClick={onNavigate}>
            회원가입
          </Link>
        </>
      )}
    </nav>
  );
}

export default function MastheadBar() {
  return (
    <div className="border-b border-ink-900/10 bg-paper-100 text-[11px] text-ink-500 lg:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-end px-4 py-1.5 sm:px-6">
        <MastheadLinks />
      </div>
    </div>
  );
}
