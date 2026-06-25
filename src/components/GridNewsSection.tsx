import { GRID_NEWS } from "../data/newsData";

export default function GridNewsSection() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {GRID_NEWS.map((n) => (
        <div key={n.id} className="border border-gray-100 pb-2.5">
          <div className="text-[11px] sm:text-xs font-medium text-blue-600 px-2 sm:px-2.5 py-1.5">
            <a href="#section">{n.section}</a>
          </div>
          <a href="#article">
            <img
              src={n.img}
              alt="메인사진"
              className="w-full block aspect-[250/160] object-cover"
            />
          </a>
          <p className="text-[13px] sm:text-sm font-medium mx-2 sm:mx-2.5 mt-2 mb-1 leading-snug text-gray-900 line-clamp-2">
            <a href="#article" className="text-inherit no-underline">
              {n.title}
            </a>
          </p>
          <p className="hidden sm:block text-xs text-gray-500 mx-2.5 leading-relaxed line-clamp-2">
            <a href="#article" className="text-inherit no-underline">
              {n.body}
            </a>
          </p>
        </div>
      ))}
    </div>
  );
}
