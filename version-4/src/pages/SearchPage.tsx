import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { searchArticles } from "../data/articles";
import SectionTag from "../components/SectionTag";
import { formatTimeAgo } from "../utils/format";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const [inputValue, setInputValue] = useState(query);

  useEffect(() => {
    window.scrollTo(0, 0);
    setInputValue(query);
  }, [query]);

  const results = query ? searchArticles(query) : [];

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* 브레드크럼 */}
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-ink-500">
        <Link to="/" className="hover:text-flash-600">
          홈
        </Link>
        <span>›</span>
        <span>검색</span>
      </nav>

      {/* 검색 헤더 */}
      <div className="mb-6 border-b-2 border-ink-900 pb-4">
        <h1 className="font-display text-xl font-black tracking-tight text-ink-900 sm:text-2xl">
          {query ? (
            <>
              <span className="text-flash-600">'{query}'</span> 검색 결과
            </>
          ) : (
            "뉴스 검색"
          )}
        </h1>
        {query && (
          <p className="mt-1.5 text-sm text-ink-500">총 {results.length}건</p>
        )}

        {/* 검색창 — 결과 페이지에서도 바로 재검색 가능 */}
        <form
          className="mt-4 flex max-w-md items-center overflow-hidden rounded-full border border-ink-900/15 focus-within:border-ink-900"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="제목, 본문 내용으로 검색"
            className="flex-1 bg-transparent px-4 py-2.5 text-sm text-ink-900 outline-none placeholder:text-ink-300"
          />
          <Link
            to={
              inputValue.trim()
                ? `/search?q=${encodeURIComponent(inputValue.trim())}`
                : "#"
            }
            className="px-4 py-2.5 text-sm font-semibold text-ink-700 hover:text-flash-600"
          >
            검색
          </Link>
        </form>
      </div>

      {!query ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg bg-paper-100 py-20 text-center">
          <p className="text-base font-semibold text-ink-700">
            검색어를 입력해 주세요.
          </p>
          <p className="text-sm text-ink-500">
            기사 제목과 본문에서 찾아드릴게요.
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg bg-paper-100 py-20 text-center">
          <p className="text-base font-semibold text-ink-700">
            '{query}'에 대한 검색 결과가 없습니다.
          </p>
          <p className="text-sm text-ink-500">
            다른 검색어로 다시 시도해 보세요.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-ink-900/10">
          {results.map((a) => (
            <li key={a.id}>
              <Link
                to={`/article/${a.id}`}
                className="group flex gap-4 py-5 hover:bg-paper-100"
              >
                {a.image && (
                  <div className="h-20 w-28 shrink-0 overflow-hidden rounded-md bg-ink-100 sm:h-24 sm:w-32">
                    <img
                      src={a.image}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex min-w-0 flex-col gap-1.5">
                  <SectionTag section={a.section} />
                  <h2 className="line-clamp-2 text-sm font-bold leading-snug text-ink-900 group-hover:text-flash-700 sm:text-base">
                    {a.title}
                  </h2>
                  {a.excerpt && (
                    <p className="line-clamp-2 text-xs text-ink-500 sm:text-sm">
                      {a.excerpt}
                    </p>
                  )}
                  <p className="text-xs text-ink-500">
                    {formatTimeAgo(a.publishedAt)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
