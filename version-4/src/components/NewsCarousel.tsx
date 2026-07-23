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

  if (articles.length === 0) return null;

  return (
    <section className="mx-auto w-full min-w-0 max-w-6xl px-6 py-2">
      <div className="mb-4 flex items-baseline justify-between border-b-2 border-ink-900 px-2 pb-2.5">
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
          className="flex snap-x snap-mandatory gap-1.5 overflow-x-auto scroll-smooth scrollbar-hide"
        >
          {articles.map((a) => (
            <Link
              key={a.id}
              to={`/article/${a.id}`}
              className="group w-[calc((100%-0.75rem)/3)] shrink-0 snap-start lg:w-[calc((100%-1.5rem)/5)]"
            >
              <div className="relative overflow-hidden  bg-ink-100">
                <img
                  src={resolveMediaUrl(a.image ?? "")}
                  alt=""
                  className="aspect-4/3 w-full rounded-md transition duration-500 group-hover:scale-105"
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
              <div className="mt-1 flex flex-col gap-1.5">
                <SectionTag section={a.section} />
                <h3 className="line-clamp-2 text-sm font-bold leading-snug text-ink-900 group-hover:text-flash-700">
                  {a.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
