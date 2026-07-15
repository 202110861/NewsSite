import { useEffect, useState } from "react";
import HotIssueTicker from "../components/HotIssueTicker";
import HeroHeadlines from "../components/HeroHeadlines";
import NewsCarousel from "../components/NewsCarousel";
import SectionNewsGrid from "../components/SectionNewsGrid";
import { fetchArticles } from "../lib/articles";
import type { Article } from "../types/news";

const GRID_SECTIONS = [
  "politics",
  "economy",
  "culture",
  "entertainment",
  "local",
  "event",
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
  const [eventArticles, setEventArticles] = useState<Article[]>([]);
  const [allSectionArticles, setAllSectionArticles] = useState<
    Record<string, Article[]>
  >({});

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
          event,
          ...gridResults
        ] = await Promise.all([
          fetchArticles({ limit: 5 }),
          fetchArticles({ sectionId: "video", limit: 5 }),
          fetchArticles({ sectionId: "politics", limit: 6 }),
          fetchArticles({ sectionId: "society", limit: 5 }),
          fetchArticles({ sectionId: "entertainment", limit: 6 }),
          fetchArticles({ sectionId: "event", limit: 5 }),
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
        setEventArticles(event);

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

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center text-sm text-ink-500">
        뉴스를 불러오는 중…
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full min-w-0 justify-center gap-4 overflow-x-hidden">
      <div className="min-w-0 flex-1">
        <HotIssueTicker />

        <div className="flex min-w-0 justify-center gap-4">
          <aside className="hidden w-40 shrink-0 lg:block sm:my-6">
            <div className="sticky top-4">
              {/* <AdSlot slotKey="home_side_left" className="min-h-[480px]" /> */}
            </div>
          </aside>

          <div className="min-w-0 w-full max-w-full">
            <HeroHeadlines articles={heroArticles} />
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
            <SectionNewsGrid data={allSectionArticles} />
          </div>

          <aside className="hidden w-40 shrink-0 lg:block sm:my-6">
            <div className="sticky top-4">
              {/* <AdSlot slotKey="home_side_right" className="min-h-[480px]" /> */}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
