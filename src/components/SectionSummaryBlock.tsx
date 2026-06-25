import { RANKING_NEWS, SECTIONS } from "../data/newsData";

export default function SectionSummaryBlock() {
  return (
    <div className="mt-2.5">
      <p className="text-base sm:text-lg font-medium border-b-2 border-black pb-2 sm:pb-2.5 mb-3 sm:mb-4">
        섹션별 주요뉴스
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SECTIONS.slice(0, 4).map((s, idx) => (
          <div key={s.id} className="border border-gray-100">
            <div className="bg-gray-100 font-medium text-sm px-2.5 py-2 flex justify-between items-center">
              {s.name}
              <a
                href={`#${s.id}`}
                className="text-xs text-gray-400 no-underline flex items-center hover:text-gray-600"
              >
                더보기 <i className="ti ti-chevron-right" aria-hidden="true" />
              </a>
            </div>
            <ul className="list-none m-0 px-2 py-1.5">
              {RANKING_NEWS.slice(idx, idx + 4).map((n) => (
                <li
                  key={n.id}
                  className="flex gap-2 py-1.5 border-b border-gray-50"
                >
                  <a href="#article" className="flex-shrink-0">
                    <img
                      src={n.img}
                      alt="메인사진"
                      className="w-11 h-11 object-cover flex-shrink-0"
                    />
                  </a>
                  <a
                    href="#article"
                    className="text-xs text-gray-700 leading-snug no-underline overflow-hidden line-clamp-2"
                  >
                    {n.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
