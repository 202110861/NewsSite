import { Link } from "react-router-dom";
import type { Article } from "../types/news";
import { resolveMediaUrl } from "../utils/media";

interface ArticleSideNewsProps {
  latest: Article[];
  popular: Article[];
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="border-t-2 border-b border-ink-900 py-2 font-display text-sm font-black tracking-tight text-ink-900">
      {children}
    </h2>
  );
}

/** 데스크탑 기사 상세 오른쪽 — 최신뉴스 · 인기뉴스 */
export default function ArticleSideNews({
  latest,
  popular,
}: ArticleSideNewsProps) {
  const [popularLead, ...popularRest] = popular;

  return (
    <aside
      className="sticky top-24 hidden w-64 shrink-0 self-start xl:block"
      aria-label="관련 뉴스"
    >
      <section>
        <SectionTitle>최신뉴스</SectionTitle>
        {latest.length === 0 ? (
          <p className="py-4 text-xs text-ink-500">등록된 기사가 없습니다.</p>
        ) : (
          <ul className="divide-y divide-ink-900/10">
            {latest.map((article) => (
              <li key={article.id}>
                <Link
                  to={`/article/${article.id}`}
                  className="block py-2.5 text-sm leading-snug text-ink-800 hover:text-flash-700"
                >
                  <span className="line-clamp-2">{article.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <SectionTitle>인기뉴스</SectionTitle>
        {popularLead ? (
          <div className="mt-3">
            <Link to={`/article/${popularLead.id}`} className="group block">
              {popularLead.image && (
                <div className="overflow-hidden bg-ink-100">
                  <img
                    src={resolveMediaUrl(popularLead.image)}
                    alt=""
                    className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              )}
              <p className="mt-2 line-clamp-2 text-sm font-bold leading-snug text-ink-900 group-hover:text-flash-700">
                {popularLead.title}
              </p>
            </Link>
            {popularRest.length > 0 && (
              <ul className="mt-3 divide-y divide-ink-900/10 border-t border-ink-900/10">
                {popularRest.map((article) => (
                  <li key={article.id}>
                    <Link
                      to={`/article/${article.id}`}
                      className="block py-2.5 text-sm leading-snug text-ink-800 hover:text-flash-700"
                    >
                      <span className="line-clamp-2">{article.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p className="py-4 text-xs text-ink-500">등록된 기사가 없습니다.</p>
        )}
      </section>
    </aside>
  );
}
