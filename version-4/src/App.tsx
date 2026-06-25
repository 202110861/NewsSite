import MastheadBar from './components/MastheadBar'
import Header from './components/Header'
import CategoryNav from './components/CategoryNav'
import HotIssueTicker from './components/HotIssueTicker'
import HeroHeadlines from './components/HeroHeadlines'
import NewsCarousel from './components/NewsCarousel'
import SectionNewsGrid from './components/SectionNewsGrid'
import Footer from './components/Footer'
import {
  heroArticles,
  videoArticles,
  politicsArticles,
  cultureArticles,
  entertainmentArticles,
  photoArticles,
  eventArticles,
  allSectionArticles,
} from './data/articles'
import { sectionMap } from './data/sections'
import type { SectionId } from './types/news'

function App() {
  const labels = Object.fromEntries(
    Object.entries(sectionMap).map(([id, s]) => [id, s.label]),
  ) as Record<SectionId, string>

  return (
    <div id="top" className="min-h-screen bg-paper-50">
      <MastheadBar />
      <Header />
      <CategoryNav />
      <HotIssueTicker />

      <main>
        <HeroHeadlines articles={heroArticles} />

        <NewsCarousel title="영상뉴스" articles={videoArticles} />
        <NewsCarousel title="정치" articles={politicsArticles} />
        <NewsCarousel title="문화/전시" articles={cultureArticles} />
        <NewsCarousel title="연예/스포츠" articles={entertainmentArticles} />
        <NewsCarousel title="포토뉴스" articles={photoArticles} />
        <NewsCarousel title="이벤트/행사" articles={eventArticles} />
      </main>

      <SectionNewsGrid data={allSectionArticles} labels={labels} />
      <Footer />
    </div>
  )
}

export default App
