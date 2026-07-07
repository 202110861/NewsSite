import { Link } from "react-router-dom";
import type { Article } from "../types/news";
import SectionTag from "./SectionTag";
import { formatTimeAgo } from "../utils/format";
import { resolveMediaUrl } from "../utils/media";

export default function HeroHeadlines({ articles }: { articles: Article[] }) {
  const [main, ...rest] = articles;

  if (!main) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        {/* 메인 헤드라인 */}
        <Link
          to={`/article/${main.id}`}
          className="group relative block overflow-hidden rounded-lg bg-ink-950"
        >
          <img
            src={resolveMediaUrl(main.image ?? "")}
            alt=""
            className="aspect-[16/10] w-full object-cover opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
            <SectionTag section={main.section} />
            <h1 className="mt-3 text-xl font-bold leading-snug text-white sm:text-2xl lg:text-3xl">
              {main.title}
            </h1>
          </div>
        </Link>

        {/* 보조 헤드라인 */}
        <div className="flex flex-col gap-4">
          {rest.map((a) => (
            <Link
              key={a.id}
              to={`/article/${a.id}`}
              className="group flex gap-4 rounded-lg p-1 transition hover:bg-paper-100"
            >
              <div className="h-24 w-32 shrink-0 overflow-hidden rounded-md bg-ink-100 sm:h-28 sm:w-36">
                <img
                  src={resolveMediaUrl(a.image ?? "")}
                  alt=""
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-col justify-center gap-2">
                <SectionTag section={a.section} />
                <h2 className="line-clamp-2 text-sm font-bold leading-snug text-ink-900 sm:text-base">
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
