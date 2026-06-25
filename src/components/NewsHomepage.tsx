import Footer from "./Footer";
import GridNewsSection from "./GridNewsSection";
import Header from "./Header";
import MainNewsSlider from "./MainNewsSlider";
import PhotoNewsTabs from "./PhotoNewsTabs";
import RankingBox from "./RankingBox";
import RealtimeBox from "./RealtimeBox";
import SectionPills from "./SectionPills";
import SectionSummaryBlock from "./SectionSummaryBlock";
import Ticker from "./Ticker";

export default function NewsHomepage() {
  return (
    <div
      id="top"
      className="w-full bg-white text-gray-800"
      style={{
        fontFamily:
          "'Malgun Gothic','맑은 고딕','Apple SD Gothic Neo',Dotum,sans-serif",
      }}
    >
      <Header />
      <SectionPills />

      <main className="max-w-[1280px] mx-auto px-3 pb-7">
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-3 lg:gap-4 mt-2.5">
          <MainNewsSlider />
          <PhotoNewsTabs />
        </div>

        <Ticker />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 lg:gap-5 mb-5 lg:mb-6">
          <div className="order-1">
            <GridNewsSection />
          </div>
          <div className="order-2">
            <RealtimeBox />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 lg:gap-5 mb-5 lg:mb-6">
          <div className="order-1">
            <GridNewsSection />
          </div>
          <div className="order-2">
            <RankingBox />
          </div>
        </div>

        <SectionSummaryBlock />
      </main>

      <Footer />
    </div>
  );
}
