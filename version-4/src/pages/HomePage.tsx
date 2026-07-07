import { useEffect, useState } from "react";
import HotIssueTicker from "../components/HotIssueTicker";
import HeroHeadlines from "../components/HeroHeadlines";
import NewsCarousel from "../components/NewsCarousel";
import SectionNewsGrid from "../components/SectionNewsGrid";
import { fetchArticles, pickArticlesByIds } from "../lib/articles";
import type { Article } from "../types/news";

const HERO_IDS = ["43", "6", "1", "27"];
const PHOTO_IDS = ["31", "32", "33", "34", "35", "36", "37", "38", "39", "40"];
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
  const [cultureArticles, setCultureArticles] = useState<Article[]>([]);
  const [entertainmentArticles, setEntertainmentArticles] = useState<Article[]>(
    [],
  );
  const [photoArticles, setPhotoArticles] = useState<Article[]>([]);
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
          culture,
          entertainment,
          event,
          ...gridResults
        ] = await Promise.all([
          fetchArticles({ limit: 50 }),
          fetchArticles({ sectionId: "video", limit: 5 }),
          fetchArticles({ sectionId: "politics", limit: 11 }),
          fetchArticles({ sectionId: "culture", limit: 5 }),
          fetchArticles({ sectionId: "entertainment", limit: 7 }),
          fetchArticles({ sectionId: "event", limit: 5 }),
          ...GRID_SECTIONS.map((sectionId) =>
            fetchArticles({ sectionId, limit: 4 }),
          ),
        ]);

        if (cancelled) return;

        setHeroArticles(pickArticlesByIds(recent, HERO_IDS));
        setVideoArticles(video);
        setPoliticsArticles(politics);
        setCultureArticles(culture);
        setEntertainmentArticles(entertainment);
        setEventArticles(event);
        setPhotoArticles(pickArticlesByIds(recent, PHOTO_IDS));

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
    <div className="mx-auto flex justify-center gap-4">
      <div className="min-w-0 flex-1">
        <HotIssueTicker />

        <div className="flex gap-4 justify-center">
          <aside className="hidden w-40 shrink-0 lg:block sm:my-6">
            <div className="sticky top-4">
              {/* <AdSlot slotKey="home_side_left" className="min-h-[480px]" /> */}
            </div>
          </aside>

          <div>
            <HeroHeadlines articles={heroArticles} />
            <NewsCarousel
              title="영상뉴스"
              articles={videoArticles}
              moreHref="/section/video"
            />
            <NewsCarousel
              title="정치"
              articles={politicsArticles}
              moreHref="/section/politics"
            />
            <NewsCarousel
              title="문화/전시"
              articles={cultureArticles}
              moreHref="/section/culture"
            />
            <NewsCarousel
              title="연예/스포츠"
              articles={entertainmentArticles}
              moreHref="/section/entertainment"
            />
            <NewsCarousel title="포토뉴스" articles={photoArticles} />
            <NewsCarousel
              title="이벤트/행사"
              articles={eventArticles}
              moreHref="/section/event"
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
