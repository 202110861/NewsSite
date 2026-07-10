import { Link } from "react-router-dom";
import type { Article, SectionId } from "../types/news";
import SectionTag from "./SectionTag";
import { resolveMediaUrl } from "../utils/media";

interface Props {
  data: Record<string, Article[]>;
}

export default function SectionNewsGrid({ data }: Props) {
  const entries = Object.entries(data) as [SectionId, Article[]][];

  return (
    <section className="w-full min-w-0 overflow-x-hidden border-t-4 border-ink-900 bg-paper-100">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <h2 className="mb-4 font-display text-lg font-black tracking-tight text-ink-900 sm:mb-5 sm:text-xl">
          섹션별 주요뉴스
        </h2>

        <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6">
          {entries.map(([sectionId, articles]) => (
            <div
              key={sectionId}
              className="min-w-0 overflow-hidden rounded-lg bg-paper-50 p-3 shadow-sm sm:p-4"
            >
              <div className="mb-2.5 flex items-center justify-between border-b border-ink-900/10 pb-2 sm:mb-3">
                <SectionTag section={sectionId} />
                <Link
                  to={`/section/${sectionId}`}
                  className="shrink-0 text-xs text-ink-500 hover:text-flash-600"
                >
                  더보기
                </Link>
              </div>
              <ul className="flex min-w-0 flex-col gap-2.5 sm:gap-3">
                {articles.slice(0, 4).map((a, index) => (
                  <li
                    key={a.id}
                    className={index >= 3 ? "hidden sm:list-item" : undefined}
                  >
                    <Link
                      to={`/article/${a.id}`}
                      className="group flex min-w-0 items-center gap-2.5 hover:text-flash-700 sm:gap-3"
                    >
                      {a.image && (
                        <img
                          src={resolveMediaUrl(a.image)}
                          alt=""
                          className="h-11 w-[4.5rem] shrink-0 rounded object-cover sm:h-12 sm:w-16"
                          loading="lazy"
                        />
                      )}
                      <span className="min-w-0 flex-1 line-clamp-2 text-xs leading-snug text-ink-800 group-hover:text-flash-700 sm:text-sm">
                        {a.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
