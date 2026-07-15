import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

interface HeaderProps {
  mobileNavOpen: boolean;
  onToggleMobileNav: () => void;
}

export default function Header({
  mobileNavOpen,
  onToggleMobileNav,
}: HeaderProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    setQuery("");
  }

  return (
    <div className="border-b border-ink-900/10 bg-paper-50 lg:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-baseline gap-2">
          <img src="/logo.png" alt="경제인뉴스" className="w-28 sm:w-35" />
        </Link>

        <div className="flex min-w-0 items-center gap-2">
          <form
            className="flex items-center overflow-hidden rounded-full border border-ink-900 bg-paper-50"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="뉴스 검색"
              className="w-28 bg-transparent px-3 py-2 text-sm text-ink-900 outline-none placeholder:text-ink-300 sm:w-44 sm:px-4"
            />
            <button
              type="submit"
              aria-label="검색"
              className="cursor-pointer px-2 py-2 text-ink-700 hover:text-flash-600"
            >
              🔍
            </button>
          </form>

          <button
            type="button"
            aria-label="메뉴 열기"
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-category-nav"
            onClick={onToggleMobileNav}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-ink-900 hover:bg-ink-900/5"
          >
            <HamburgerIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
