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
    <section className="border-t-4 border-ink-900 bg-paper-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h2 className="mb-5 font-display text-xl font-black tracking-tight text-ink-900">
          섹션별 주요뉴스
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map(([sectionId, articles]) => (
            <div
              key={sectionId}
              className="rounded-lg bg-paper-50 p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between border-b border-ink-900/10 pb-2">
                <SectionTag section={sectionId} />
                <Link
                  to={`/section/${sectionId}`}
                  className="text-xs text-ink-500 hover:text-flash-600"
                >
                  더보기
                </Link>
              </div>
              <ul className="flex flex-col gap-3">
                {articles.slice(0, 4).map((a) => (
                  <li key={a.id}>
                    <Link
                      to={`/article/${a.id}`}
                      className="flex items-center gap-3 hover:text-flash-700"
                    >
                      {a.image && (
                        <img
                          src={resolveMediaUrl(a.image)}
                          alt=""
                          className="h-12 w-16 shrink-0 rounded object-cover"
                          loading="lazy"
                        />
                      )}
                      <span className="line-clamp-2 text-sm leading-snug text-ink-800">
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
