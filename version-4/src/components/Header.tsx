import { useState } from "react";
import { Link } from "react-router-dom";

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <div className="border-b border-ink-900/10 bg-paper-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-baseline gap-2">
          <img src="/logo.png" alt="logo" className="w-35" />
        </Link>

        <div className="relative">
          {searchOpen ? (
            <form
              className="flex items-center overflow-hidden rounded-full border border-ink-900 bg-paper-50"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="뉴스 검색"
                className="w-36 bg-transparent px-4 py-2 text-sm text-ink-900 outline-none placeholder:text-ink-300 sm:w-56"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="검색창 닫기"
                className="px-3 py-2 text-ink-500 hover:text-ink-900"
              >
                ✕
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="검색 열기"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-900/15 text-ink-700 transition hover:border-ink-900 hover:text-ink-900"
            >
              🔍
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
