import { Link, Navigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchArticles } from "../lib/articles";
import { sectionMap } from "../data/sections";
import SectionTag from "../components/SectionTag";
import ArticleSideNews from "../components/ArticleSideNews";
import { SectionPageSkeleton } from "../components/skeleton";
import { resolveMediaUrl } from "../utils/media";
import type { Article } from "../types/news";

export default function SectionPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [publisherNews, setPublisherNews] = useState<Article[]>([]);
  const [latestNews, setLatestNews] = useState<Article[]>([]);
  const [popularNews, setPopularNews] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const meta = sectionId ? sectionMap[sectionId] : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [sectionId]);

  useEffect(() => {
    if (!sectionId || !meta) return;

    let cancelled = false;
    setLoading(true);

    Promise.all([
      fetchArticles({ sectionId, limit: 100 }),
      fetchArticles({ sectionId: "publisher", limit: 5 }),
      fetchArticles({ limit: 40 }),
    ])
      .then(([sectionArticles, publisher, sidePool]) => {
        if (cancelled) return;
        setArticles(sectionArticles);
        setPublisherNews(publisher);
        setLatestNews(sidePool.slice(0, 5));
        setPopularNews(
          [...sidePool]
            .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
            .slice(0, 5),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setArticles([]);
          setPublisherNews([]);
          setLatestNews([]);
          setPopularNews([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sectionId, meta]);

  if (!sectionId || !meta) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <>
        <SeoHead
          title={`${meta.label} - 경제인뉴스`}
          description={`${meta.label} 섹션 최신 뉴스를 확인하세요.`}
          path={`/section/${sectionId}`}
        />
        <SectionPageSkeleton label={meta.label} />
      </>
    );
  }

  return (
    <>
      <SeoHead
        title={`${meta.label} - 경제인뉴스`}
        description={`${meta.label} 섹션 최신 뉴스를 확인하세요.`}
        path={`/section/${sectionId}`}
      />
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-ink-500">
          <Link to="/" className="hover:text-flash-600">
            홈
          </Link>
          <span>›</span>
          <span>{meta.label}</span>
        </nav>
      <div className="grid min-w-0 xl:grid-cols-[minmax(0,1fr)_16rem] xl:gap-x-6">
        <div className="flex items-baseline justify-between border-b-2 border-ink-900 pb-3 xl:col-start-1">
          <h1 className="font-display text-2xl font-black tracking-tight text-ink-900 sm:text-3xl">
            {meta.label}
          </h1>
          <span className="text-sm text-ink-500">총 {articles.length}건</span>
        </div>
        <div className="min-w-0 pt-6 xl:col-start-1 xl:row-start-2">
          {articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg bg-paper-100 py-20 text-center">
              <p className="text-base font-semibold text-ink-700">
                아직 등록된 {meta.label} 기사가 없습니다.
              </p>
              <p className="text-sm text-ink-500">
                곧 새로운 소식으로 채워드릴게요.
              </p>
            </div>
          ) : (
            <div className="grid gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => (
                <Link key={a.id} to={`/article/${a.id}`} className="group">
                  <div className="relative overflow-hidden rounded-md bg-ink-100">
                    <img
                      src={resolveMediaUrl(a.image ?? "")}
                      alt=""
                      className="aspect-4/3 h-full transition duration-500 group-hover:scale-105"
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
                    <h2 className="line-clamp-2 text-sm font-bold leading-snug text-ink-900 group-hover:text-flash-700 sm:text-base">
                      {a.title}
                    </h2>
                    {a.excerpt && (
                      <p className="line-clamp-2 text-xs text-ink-500">
                        {a.excerpt}
                      </p>
                    )}
                    <time
                      dateTime={a.publishedAt}
                      className="text-xs text-ink-500"
                    >
                      {new Date(a.publishedAt).toLocaleString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </time>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <ArticleSideNews
          publisher={publisherNews}
          latest={latestNews}
          popular={popularNews}
          className="mt-0 xl:col-start-2 xl:row-start-2"
        />
      </div>
    </section>
  );
}
