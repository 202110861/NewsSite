const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

/** 데스크탑 기사 상세 왼쪽 — 비로그인 시 소셜 로그인 */
export default function ArticleSocialLoginRail() {
  return (
    <aside
      className="sticky top-27 hidden w-10 shrink-0 flex-col self-start lg:flex"
      aria-label="소셜 로그인"
    >
      <a
        href={`${API_BASE}/auth/kakao`}
        aria-label="카카오로 로그인"
        className="flex h-10 w-10 items-center justify-center bg-[#FEE500] text-[#191919] hover:brightness-95"
      >
        <KakaoIcon />
      </a>
      <a
        href={`${API_BASE}/auth/naver`}
        aria-label="네이버로 로그인"
        className="flex h-10 w-10 items-center justify-center bg-[#03C75A] text-white hover:brightness-95"
      >
        <NaverIcon />
      </a>
      <a
        href={`${API_BASE}/auth/google`}
        aria-label="Google로 로그인"
        className="flex h-10 w-10 items-center justify-center border border-ink-900/15 bg-white text-ink-800 hover:bg-paper-100"
      >
        <GoogleIcon />
      </a>
      <a
        href={`${API_BASE}/auth/facebook`}
        aria-label="Facebook으로 로그인"
        className="flex h-10 w-10 items-center justify-center bg-[#1877F2] text-white hover:brightness-95"
      >
        <FacebookIcon />
      </a>
    </aside>
  );
}

function KakaoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 3C6.477 3 2 6.582 2 11c0 2.856 1.87 5.364 4.683 6.78l-.95 3.49a.58.58 0 0 0 .894.626l4.165-2.76c.396.043.8.064 1.208.064 5.523 0 10-3.582 10-8.2s-4.477-8-10-8Z"
      />
    </svg>
  );
}

function NaverIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M10.6 8.47 5.27 1H1v14h4.4V7.53L10.73 15H15V1h-4.4v7.47Z"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 18 18" aria-hidden="true">
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
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
      />
    </svg>
  );
}
