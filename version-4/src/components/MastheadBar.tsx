import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";
interface MastheadLinksProps {
  className?: string;
  linkClassName?: string;
  separatorClassName?: string;
  onNavigate?: () => void;
}

export function MastheadLinks({
  className = "flex items-center gap-3",
  linkClassName = "whitespace-nowrap hover:text-ink-900",
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
              <Link to="/mypage" className={linkClassName} onClick={onNavigate}>
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
          <div className="flex items-center">
            <a
              href={`${API_BASE}/auth/naver`}
              className="flex items-center justify-center bg-[#03C75A] p-2 text-sm font-bold text-white hover:brightness-95"
            >
              <NaverIcon />
            </a>
            <a
              href={`${API_BASE}/auth/google`}
              className="flex items-center justify-center bg-white p-2 text-sm font-bold text-ink-800 hover:brightness-95"
            >
              <GoogleIcon />
            </a>
          </div>

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

function NaverIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M10.6 8.47 5.27 1H1v14h4.4V7.53L10.73 15H15V1h-4.4v7.47Z"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 18 18" aria-hidden="true">
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
