import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { sections } from "../data/sections";

const NAV_ITEM_COUNT = 1 + sections.length;
const MIN_ITEM_WIDTH = 72;
const TARGET_ROWS = 2;

function calcNavColumns(
  containerWidth: number,
  itemCount: number,
  minItemWidth = MIN_ITEM_WIDTH,
  targetRows = TARGET_ROWS,
) {
  const maxCols = Math.max(1, Math.floor(containerWidth / minItemWidth));
  let cols = Math.min(maxCols, Math.ceil(itemCount / targetRows));
  const rows = Math.ceil(itemCount / cols);
  cols = Math.ceil(itemCount / rows);
  return Math.min(cols, maxCols);
}

function navLinkClass(active: boolean) {
  return `block truncate px-2 py-3 text-center text-xs font-bold tracking-tight transition sm:whitespace-nowrap sm:px-4 sm:py-3.5 sm:text-sm ${
    active ? "bg-flash-600 text-white" : "text-paper-200 hover:bg-ink-800"
  }`;
}

export default function CategoryNav() {
  const { pathname } = useLocation();
  const listRef = useRef<HTMLUListElement>(null);
  const [cols, setCols] = useState(() =>
    Math.ceil(NAV_ITEM_COUNT / TARGET_ROWS),
  );

  const activeSectionId = pathname.startsWith("/section/")
    ? pathname.split("/")[2]
    : null;
  const isHome = pathname === "/";

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const mq = window.matchMedia("(min-width: 640px)");

    function update() {
      if (mq.matches) return;
      setCols(calcNavColumns(el!.clientWidth, NAV_ITEM_COUNT));
    }

    const ro = new ResizeObserver(update);
    ro.observe(el);
    mq.addEventListener("change", update);
    update();

    return () => {
      ro.disconnect();
      mq.removeEventListener("change", update);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-30 border-b border-ink-900/10 bg-ink-900">
      <ul
        ref={listRef}
        className="mx-auto grid max-w-6xl gap-1 px-2 sm:flex sm:overflow-x-auto sm:px-4 scrollbar-hide"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        <li className="min-w-0 sm:shrink-0">
          <Link to="/" className={navLinkClass(isHome)}>
            홈
          </Link>
        </li>
        {sections.map((s) => (
          <li key={s.id} className="min-w-0 sm:shrink-0">
            <Link
              to={`/section/${s.id}`}
              className={navLinkClass(activeSectionId === s.id)}
            >
              {s.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
