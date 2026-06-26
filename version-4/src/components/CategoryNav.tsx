import { Link, useLocation } from "react-router-dom";
import { sections } from "../data/sections";

export default function CategoryNav() {
  const { pathname } = useLocation();
  const activeSectionId = pathname.startsWith("/section/")
    ? pathname.split("/")[2]
    : null;
  const isHome = pathname === "/";

  return (
    <nav className="sticky top-0 z-30 border-b border-ink-900/10 bg-ink-900">
      <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 scrollbar-hide sm:px-4">
        <li>
          <Link
            to="/"
            className={`block whitespace-nowrap px-4 py-3.5 text-sm font-bold tracking-tight transition ${
              isHome
                ? "bg-flash-600 text-white"
                : "text-paper-200 hover:bg-ink-800"
            }`}
          >
            홈
          </Link>
        </li>
        {sections.map((s) => (
          <li key={s.id}>
            <Link
              to={`/section/${s.id}`}
              className={`block whitespace-nowrap px-4 py-3.5 text-sm font-bold tracking-tight transition ${
                activeSectionId === s.id
                  ? "bg-flash-600 text-white"
                  : "text-paper-200 hover:bg-ink-800"
              }`}
            >
              {s.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
