import type { Ref } from "react";
import { Link } from "react-router-dom";
import type { Article } from "../types/news";
import { resolveMediaUrl } from "../utils/media";

interface ArticleSideNewsProps {
  publisher: Article[];
  latest: Article[];
  popular: Article[];
  className?: string;
  ref?: Ref<HTMLElement>;
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="border-t-2 border-b border-ink-900 py-2 font-display text-md tracking-tight text-ink-900">
      {children}
    </h2>
  );
}

function TitleList({ articles }: { articles: Article[] }) {
  if (articles.length === 0) {
    return <p className="py-4 text-xs text-ink-500">등록된 기사가 없습니다.</p>;
  }

  return (
    <ul className="divide-y divide-ink-900/10">
      {articles.map((article) => (
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
  );
}

/** 첫 기사는 이미지+제목, 나머지는 제목 목록 */
function FeaturedList({ articles }: { articles: Article[] }) {
  const [lead, ...rest] = articles;

  if (!lead) {
    return <p className="py-4 text-xs text-ink-500">등록된 기사가 없습니다.</p>;
  }

  return (
    <div className="mt-3">
      <Link to={`/article/${lead.id}`} className="group block">
        {lead.image && (
          <div className="overflow-hidden bg-ink-100">
            <img
              src={resolveMediaUrl(lead.image)}
              alt=""
              className="aspect-4/3 transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}
        <p className="mt-2 line-clamp-2 text-sm leading-snug text-ink-900 group-hover:text-flash-700">
          {lead.title}
        </p>
      </Link>
      {rest.length > 0 && (
        <ul className="mt-3 divide-y divide-ink-900/10 border-t border-ink-900/10">
          {rest.map((article) => (
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
  );
}

/** 데스크탑 기사 상세 오른쪽 — 발행인 칼럼 · 최신뉴스 · 인기뉴스 */
export default function ArticleSideNews({
  publisher,
  latest,
  popular,
  className,
  ref,
}: ArticleSideNewsProps) {
  return (
    <aside
      ref={ref}
      className={`sticky top-24 hidden min-w-0 w-full max-w-64 shrink self-start xl:block ${className ?? ""}`}
      aria-label="관련 뉴스"
    >
      <section>
        <SectionTitle>발행인 칼럼</SectionTitle>
        <FeaturedList articles={publisher} />
      </section>

      <section className="mt-8">
        <SectionTitle>최신뉴스</SectionTitle>
        <TitleList articles={latest} />
      </section>

      <section className="mt-8">
        <SectionTitle>인기뉴스</SectionTitle>
        <FeaturedList articles={popular} />
      </section>
    </aside>
  );
}
