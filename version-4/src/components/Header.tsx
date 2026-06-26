import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Header() {
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
    <div className="border-b border-ink-900/10 bg-paper-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-baseline gap-2">
          <img src="/logo.png" alt="logo" className="w-35" />
        </Link>

        <div className="relative">
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
              type="submit"
              aria-label="검색"
              className="px-2 py-2 text-ink-700 hover:text-flash-600 cursor-pointer"
              onClick={handleSubmit}
            >
              🔍
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
