import HotIssueTicker from "../components/HotIssueTicker";
import HeroHeadlines from "../components/HeroHeadlines";
import NewsCarousel from "../components/NewsCarousel";
import SectionNewsGrid from "../components/SectionNewsGrid";
import AdSlot from "../components/AdSlot";
import {
  heroArticles,
  videoArticles,
  politicsArticles,
  cultureArticles,
  entertainmentArticles,
  photoArticles,
  eventArticles,
  allSectionArticles,
} from "../data/articles";

export default function HomePage() {
  return (
    <div className="mx-auto flex justify-center gap-4">
      <div className="min-w-0 flex-1">
        <HotIssueTicker />

        <div className="flex gap-4 justify-center">
          <aside className="hidden w-40 shrink-0 lg:block sm:my-6">
            <div className="sticky top-4">
              <AdSlot slotKey="home_side_left" className="min-h-[480px]" />
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
              <AdSlot slotKey="home_side_right" className="min-h-[480px]" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
