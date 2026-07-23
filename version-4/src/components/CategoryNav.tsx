import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { sections } from "../data/sections";
import { MastheadLinks } from "./MastheadBar";

function navLinkClass(active: boolean) {
  return `block whitespace-nowrap rounded-sm px-2 py-3 text-center text-xs font-bold tracking-tight transition lg:px-1.5 lg:py-2 lg:text-sm xl:px-2.5 ${
    active ? "bg-ink-500 text-white" : "text-paper-200 hover:bg-ink-500"
  }`;
}

function mobileNavLinkClass(active: boolean) {
  return `block px-4 py-3.5 text-sm font-bold transition ${
    active ? "bg-flash-600 text-white" : "text-ink-900 hover:bg-ink-900/5"
  }`;
}

interface CategoryNavProps {
  mobileNavOpen: boolean;
  onCloseMobileNav: () => void;
}

export default function CategoryNav({
  mobileNavOpen,
  onCloseMobileNav,
}: CategoryNavProps) {
  const [query, setQuery] = useState("");
  const [drawerMounted, setDrawerMounted] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const activeSectionId = pathname.startsWith("/section/")
    ? pathname.split("/")[2]
    : null;
  const isHome = pathname === "/";

  useEffect(() => {
    if (mobileNavOpen) {
      setDrawerMounted(true);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setDrawerVisible(true));
      });
      return () => cancelAnimationFrame(id);
    }
    setDrawerVisible(false);
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!drawerMounted) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerMounted]);

  function handleDrawerTransitionEnd() {
    if (!mobileNavOpen) setDrawerMounted(false);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    setQuery("");
  }

  return (
    <>
      {/* Desktop unified bar */}
      <nav className="sticky top-0 z-30 hidden border-b border-ink-900/10 bg-ink-900 lg:block">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-x-2 gap-y-2 px-3 py-1.5 xl:gap-x-3 xl:px-4">
          <Link to="/" className="shrink-0">
            <img
              src="/logo(white).png"
              alt="경제인뉴스"
              className="w-20 xl:w-22"
            />
          </Link>

          <ul className="flex items-center justify-center ">
            {sections.map((s) => (
              <li key={s.id} className="shrink-0">
                <Link
                  to={`/section/${s.id}`}
                  className={navLinkClass(activeSectionId === s.id)}
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>

          <form
            className="flex shrink-0 items-center overflow-hidden rounded-full border border-paper-200/30 bg-paper-50"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="뉴스 검색"
              className="w-28 bg-transparent px-3 text-sm text-ink-900 outline-none placeholder:text-ink-300 xl:w-36"
            />
            <button
              type="submit"
              aria-label="검색"
              className="cursor-pointer px-2 text-ink-700 hover:text-flash-600"
            >
              🔍
            </button>
          </form>

          <MastheadLinks
            className="flex shrink-0 items-center gap-2 text-[11px] text-paper-200 [&_.font-semibold]:text-white xl:gap-3"
            linkClassName="hover:text-white"
            separatorClassName="text-ink-500"
          />
        </div>
      </nav>

      {/* Mobile right drawer */}
      {drawerMounted && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal>
          <button
            type="button"
            aria-label="메뉴 닫기"
            className={`absolute inset-0 bg-ink-950/60 transition-opacity duration-300 ${
              drawerVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={onCloseMobileNav}
          />

          <nav
            id="mobile-category-nav"
            aria-label="카테고리 메뉴"
            onTransitionEnd={handleDrawerTransitionEnd}
            className={`absolute inset-y-0 right-0 flex w-2/3 max-w-sm flex-col bg-paper-50 shadow-xl transition-transform duration-300 ease-out ${
              drawerVisible ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between border-b border-ink-900/10 px-4 py-3">
              <span className="text-sm font-bold text-ink-900">카테고리</span>
              <button
                type="button"
                aria-label="메뉴 닫기"
                onClick={onCloseMobileNav}
                className="flex h-9 w-9 items-center justify-center rounded-md text-ink-900 hover:bg-ink-900/5"
              >
                <CloseIcon />
              </button>
            </div>

            <ul className="flex-1 overflow-y-auto">
              <li>
                <Link
                  to="/"
                  className={mobileNavLinkClass(isHome)}
                  onClick={onCloseMobileNav}
                >
                  홈
                </Link>
              </li>
              {sections.map((s) => (
                <li key={s.id} className="border-t border-ink-900/10">
                  <Link
                    to={`/section/${s.id}`}
                    className={mobileNavLinkClass(activeSectionId === s.id)}
                    onClick={onCloseMobileNav}
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
