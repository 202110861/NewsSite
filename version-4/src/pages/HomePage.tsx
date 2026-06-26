import HotIssueTicker from "../components/HotIssueTicker";
import HeroHeadlines from "../components/HeroHeadlines";
import NewsCarousel from "../components/NewsCarousel";
import SectionNewsGrid from "../components/SectionNewsGrid";
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
    <>
      <HotIssueTicker />
      <HeroHeadlines articles={heroArticles} />

      {/* <NewsCarousel title="영상뉴스" articles={videoArticles} /> */}
      <NewsCarousel title="정치" articles={politicsArticles} />
      <NewsCarousel title="문화/전시" articles={cultureArticles} />
      {/* <NewsCarousel title="연예/스포츠" articles={entertainmentArticles} />
      <NewsCarousel title="포토뉴스" articles={photoArticles} />
      <NewsCarousel title="이벤트/행사" articles={eventArticles} /> */}

      <SectionNewsGrid data={allSectionArticles} />
    </>
  );
}
