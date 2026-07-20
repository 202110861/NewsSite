import { useRef } from "react";
import { Link } from "react-router-dom";
import type { Article } from "../types/news";
import SectionTag from "./SectionTag";
import { resolveMediaUrl } from "../utils/media";

interface Props {
  title: string;
  articles: Article[];
  moreHref?: string;
}

export default function NewsCarousel({ title, articles, moreHref }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollBy(dir: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(":scope > a");
    const step = card ? card.offsetWidth + 12 : el.clientWidth * 0.85;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  if (articles.length === 0) return null;

  return (
    <section className="mx-auto w-full min-w-0 max-w-6xl px-6 py-7">
      <div className="mb-4 flex items-baseline justify-between border-b-2 border-ink-900 px-4 pb-2.5 sm:px-6">
        <h2 className="font-display text-lg font-black tracking-tight text-ink-900 sm:text-xl">
          {title}
        </h2>
        {moreHref && (
          <Link
            to={moreHref}
            className="shrink-0 text-xs font-semibold text-ink-500 hover:text-flash-600"
          >
            더보기 →
          </Link>
        )}
      </div>

      <div className="relative min-w-0">
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth scrollbar-hide px-4 sm:gap-4 sm:px-6"
        >
          {articles.map((a) => (
            <Link
              key={a.id}
              to={`/article/${a.id}`}
              className="group w-[calc(34%)] shrink-0 snap-start md:w-[calc(33.333%-0.75rem)] lg:w-[calc(19.7%)] "
            >
              <div className="relative overflow-hidden rounded-md bg-ink-100">
                <img
                  src={resolveMediaUrl(a.image ?? "")}
                  alt=""
                  className="aspect-4/3 w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {a.isVideo && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-950/60 text-white backdrop-blur-sm">
                      ▶
                    </span>
                  </span>
                )}
              </div>
              <div className="mt-2.5 flex flex-col gap-1.5">
                <SectionTag section={a.section} />
                <h3 className="line-clamp-2 text-sm font-bold leading-snug text-ink-900 group-hover:text-flash-700">
                  {a.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="이전"
          className="absolute -left-3 top-1/3 hidden h-9 w-9 items-center justify-center rounded-full border border-ink-900/10 bg-paper-50 text-ink-700 shadow-md hover:text-flash-600 lg:flex"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="다음"
          className="absolute -right-3 top-1/3 hidden h-9 w-9 items-center justify-center rounded-full border border-ink-900/10 bg-paper-50 text-ink-700 shadow-md hover:text-flash-600 lg:flex"
        >
          ›
        </button>
      </div>
    </section>
  );
}
