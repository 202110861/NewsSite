import { RANKING_NEWS } from "../data/newsData";

export default function RankingBox() {
  return (
    <div className="border border-gray-200 px-3 py-2.5">
      <div className="font-medium text-base border-b border-gray-200 pb-2.5 mb-1.5">
        많이 본 기사
      </div>
      {RANKING_NEWS.map((n, i) => (
        <div key={n.id} className="flex items-center gap-2 py-2 border-b border-gray-50">
          <a href="#article" className="flex-shrink-0">
            <img src={n.img} alt="메인사진" className="w-11 h-11 object-cover flex-shrink-0" />
          </a>
          <span className="text-sm text-sky-700 font-medium w-4 flex-shrink-0">
            {i + 1}
          </span>
          <a
            href="#article"
            className="text-[13px] text-gray-700 leading-snug no-underline overflow-hidden line-clamp-2"
          >
            {n.title}
          </a>
        </div>
      ))}
    </div>
  );
}
