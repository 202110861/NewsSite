import { useEffect, useRef, useState } from "react";
import HotIssueTicker from "../components/HotIssueTicker";
import HeroHeadlines from "../components/HeroHeadlines";
import NewsCarousel from "../components/NewsCarousel";
import SectionNewsGrid from "../components/SectionNewsGrid";
import ArticleSideNews from "../components/ArticleSideNews";
import SeoHead from "../components/SeoHead";
import { HomePageSkeleton } from "../components/skeleton";
import { fetchArticles } from "../lib/articles";
import type { Article } from "../types/news";

const GRID_SECTIONS = [
  "politics",
  "economy",
  "culture",
  "entertainment",
  "local",
  "society",
] as const;

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [heroArticles, setHeroArticles] = useState<Article[]>([]);
  const [videoArticles, setVideoArticles] = useState<Article[]>([]);
  const [politicsArticles, setPoliticsArticles] = useState<Article[]>([]);
  const [societyArticles, setSocietyArticles] = useState<Article[]>([]);
  const [entertainmentArticles, setEntertainmentArticles] = useState<Article[]>(
    [],
  );
  const [cultureArticles, setCultureArticles] = useState<Article[]>([]);
  const [publisherNews, setPublisherNews] = useState<Article[]>([]);
  const [latestNews, setLatestNews] = useState<Article[]>([]);
  const [popularNews, setPopularNews] = useState<Article[]>([]);
  const [allSectionArticles, setAllSectionArticles] = useState<
    Record<string, Article[]>
  >({});
  const [showCultureCarousel, setShowCultureCarousel] = useState(false);
  const mainColumnRef = useRef<HTMLDivElement>(null);
  const sideNewsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [
          recent,
          video,
          politics,
          society,
          entertainment,
          culture,
          publisher,
          sidePool,
          ...gridResults
        ] = await Promise.all([
          fetchArticles({ limit: 5 }),
          fetchArticles({ sectionId: "video", limit: 5 }),
          fetchArticles({ sectionId: "politics", limit: 6 }),
          fetchArticles({ sectionId: "society", limit: 5 }),
          fetchArticles({ sectionId: "entertainment", limit: 6 }),
          fetchArticles({ sectionId: "culture", limit: 5 }),
          fetchArticles({ sectionId: "publisher", limit: 5 }),
          fetchArticles({ limit: 40 }),
          ...GRID_SECTIONS.map((sectionId) =>
            fetchArticles({ sectionId, limit: 4 }),
          ),
        ]);

        if (cancelled) return;

        setHeroArticles(recent);
        setVideoArticles(video);
        setPoliticsArticles(politics);
        setSocietyArticles(society);
        setEntertainmentArticles(entertainment);
        setCultureArticles(culture);
        setPublisherNews(publisher);
        setLatestNews(sidePool.slice(0, 5));
        setPopularNews(
          [...sidePool]
            .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
            .slice(0, 5),
        );

        const gridData: Record<string, Article[]> = {};
        GRID_SECTIONS.forEach((sectionId, index) => {
          gridData[sectionId] = gridResults[index] ?? [];
        });
        setAllSectionArticles(gridData);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // 사이드가 메인 칼럼보다 길 때만 문화/전시 캐러셀로 빈 공간을 채움
  useEffect(() => {
    if (loading) return;

    const mainEl = mainColumnRef.current;
    const sideEl = sideNewsRef.current;
    if (!mainEl || !sideEl) return;

    const compare = () => {
      if (getComputedStyle(sideEl).display === "none") {
        setShowCultureCarousel(false);
        return;
      }
      const mainBottom = mainEl.getBoundingClientRect().bottom;
      const sideBottom = sideEl.getBoundingClientRect().bottom;
      setShowCultureCarousel(sideBottom > mainBottom);
    };

    const observer = new ResizeObserver(compare);
    observer.observe(mainEl);
    observer.observe(sideEl);
    compare();

    return () => observer.disconnect();
  }, [loading]);

  if (loading) {
    return (
      <>
        <SeoHead path="/" />
        <HomePageSkeleton />
      </>
    );
  }

  return (
    <>
      <SeoHead path="/" />
      <div className="mx-auto flex w-full min-w-0 justify-center gap-4">
        <div className="min-w-0 flex-1">
          <HotIssueTicker
            items={heroArticles.map((article) => ({
              id: article.id,
              title: article.title,
            }))}
          />

          <div className="flex min-w-0 justify-center gap-4">
            <aside className="hidden w-40 shrink-0 sm:my-6 lg:block">
              <div className="sticky top-4">
                {/* <AdSlot slotKey="home_side_left" className="min-h-[480px]" /> */}
              </div>
            </aside>

            <div className="flex min-w-0 w-full max-w-full flex-col xl:w-[calc(100%-600px)]">
              <div className="mb-6 flex min-w-0 justify-center gap-1">
                <div className="flex min-w-0 flex-1 flex-col">
                  <div ref={mainColumnRef} className="flex min-w-0 flex-col">
                    <HeroHeadlines articles={heroArticles} />
                    <div className="md:hidden">
                      <NewsCarousel
                        title="발행인칼럼"
                        articles={publisherNews}
                        moreHref="/section/publisher"
                      />
                    </div>
                    <NewsCarousel
                      title="정치"
                      articles={politicsArticles}
                      moreHref="/section/politics"
                    />
                    <NewsCarousel
                      title="연예/스포츠"
                      articles={entertainmentArticles}
                      moreHref="/section/entertainment"
                    />
                    <NewsCarousel
                      title="영상뉴스"
                      articles={videoArticles}
                      moreHref="/section/video"
                    />
                    <NewsCarousel
                      title="사회"
                      articles={societyArticles}
                      moreHref="/section/society"
                    />
                  </div>
                  {showCultureCarousel && (
                    <NewsCarousel
                      title="문화/전시"
                      articles={cultureArticles}
                      moreHref="/section/culture"
                    />
                  )}
                </div>
                <ArticleSideNews
                  ref={sideNewsRef}
                  publisher={publisherNews}
                  latest={latestNews}
                  popular={popularNews}
                  className="mt-7 basis-[min(16rem,28%)]"
                />
              </div>

              <SectionNewsGrid data={allSectionArticles} />
            </div>

            <aside className="hidden w-40 shrink-0 sm:my-6 lg:block">
              <div className="sticky top-4">
                {/* <AdSlot slotKey="home_side_right" className="min-h-[480px]" /> */}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
