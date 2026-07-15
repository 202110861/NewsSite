import { Link } from "react-router-dom";
import type { Article } from "../types/news";
import SectionTag from "./SectionTag";
import { resolveMediaUrl } from "../utils/media";

export default function HeroHeadlines({ articles }: { articles: Article[] }) {
  const [main, ...rest] = articles;

  if (!main) return null;

  return (
    <section className="mx-auto w-full min-w-0 max-w-6xl pt-6 sm:px-6">
      <div className="grid min-w-0 gap-4 lg:grid-cols-[1.6fr_1fr] lg:gap-5">
        {/* 메인 헤드라인 */}
        <Link
          to={`/article/${main.id}`}
          className="group relative block min-w-0 overflow-hidden rounded-lg bg-ink-950"
        >
          <div className="relative aspect-[16/9] max-h-[52vw] w-full sm:max-h-[280px] lg:aspect-[16/12] lg:max-h-none">
            <img
              src={resolveMediaUrl(main.image ?? "")}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-7">
              <SectionTag section={main.section} />
              <h1 className="mt-2 text-lg font-bold leading-snug text-white sm:mt-3 sm:text-2xl lg:text-3xl">
                {main.title}
              </h1>
            </div>
          </div>
        </Link>

        {/* 보조 헤드라인 — 모바일: 세로 / PC(lg+): 가로 */}
        <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
          {rest.map((a, index) => (
            <Link
              key={a.id}
              to={`/article/${a.id}`}
              className={`group flex min-w-0 flex-col overflow-hidden rounded-lg transition hover:bg-paper-100 lg:flex-row lg:gap-4 lg:p-1${index >= 2 ? " hidden sm:flex" : ""}`}
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md bg-ink-100 sm:aspect-[4/3] lg:aspect-auto lg:h-28 lg:w-36 lg:shrink-0">
                <img
                  src={resolveMediaUrl(a.image ?? "")}
                  alt=""
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="flex min-w-0 flex-col gap-1.5 pt-2 sm:gap-2 sm:pt-2.5 lg:justify-center lg:gap-2 lg:pt-0">
                <SectionTag section={a.section} />
                <h2 className="line-clamp-2 text-xs font-bold leading-snug text-ink-900 group-hover:text-flash-700 sm:text-sm lg:text-base">
                  {a.title}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
