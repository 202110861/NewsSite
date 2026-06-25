import { BOX_REALTIME } from "../data/newsData";

export default function RealtimeBox() {
  const [main, ...rest] = BOX_REALTIME;

  return (
    <div className="border border-gray-100 px-3 py-2.5">
      <div className="font-medium text-sm sm:text-[15px] border-b border-gray-200 pb-2 mb-2 text-sky-700">
        <a href="#section" className="text-inherit no-underline">
          실시간 주요뉴스
        </a>
      </div>
      <div className="flex gap-2.5 pb-2.5 border-b border-gray-50 mb-2">
        <a href="#article" className="flex-shrink-0">
          <img src={main.img} alt="메인사진" className="w-16 h-16 object-cover flex-shrink-0" />
        </a>
        <a
          href="#article"
          className="text-[13px] font-medium text-gray-900 leading-snug no-underline line-clamp-3"
        >
          {main.title}
        </a>
      </div>
      {rest.map((n) => (
        <div key={n.id} className="flex gap-2.5 py-1.5 border-b border-gray-50">
          <a href="#article" className="flex-shrink-0">
            <img src={n.img} alt="메인사진" className="w-16 h-16 object-cover flex-shrink-0" />
          </a>
          <a
            href="#article"
            className="text-[13px] text-gray-700 leading-snug no-underline line-clamp-3"
          >
            {n.title}
          </a>
        </div>
      ))}
    </div>
  );
}
