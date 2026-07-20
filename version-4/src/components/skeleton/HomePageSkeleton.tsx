import { Skeleton } from "./Skeleton";
import ArticleSideNewsSkeleton from "./ArticleSideNewsSkeleton";

function CarouselSkeleton() {
  return (
    <section className="mx-auto w-full min-w-0 max-w-6xl px-6 py-7">
      <div className="mb-4 flex items-baseline justify-between border-b-2 border-ink-900 px-4 pb-2.5 sm:px-6">
        <Skeleton className="h-6 w-24 rounded-sm sm:h-7 sm:w-28" />
        <Skeleton className="h-3.5 w-14" />
      </div>
      <div className="flex gap-3 overflow-hidden px-4 sm:gap-4 sm:px-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="w-[82%] shrink-0 sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.75rem)] lg:w-56"
          >
            <Skeleton className="aspect-[4/3] w-full rounded-md" />
            <div className="mt-2.5 flex flex-col gap-1.5">
              <Skeleton className="h-4 w-12 rounded-sm" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionGridSkeleton() {
  return (
    <section className="w-full min-w-0 overflow-x-hidden border-t-4 border-ink-900 bg-paper-100">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Skeleton className="mb-4 h-6 w-36 rounded-sm sm:mb-5 sm:h-7" />
        <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="min-w-0 overflow-hidden rounded-lg bg-paper-50 p-3 shadow-sm sm:p-4"
            >
              <div className="mb-2.5 flex items-center justify-between border-b border-ink-900/10 pb-2 sm:mb-3">
                <Skeleton className="h-4 w-14 rounded-sm" />
                <Skeleton className="h-3 w-10" />
              </div>
              <ul className="flex min-w-0 flex-col gap-2.5 sm:gap-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <li
                    key={j}
                    className={`flex min-w-0 items-center gap-2.5 sm:gap-3${j >= 3 ? " hidden sm:flex" : ""}`}
                  >
                    <Skeleton className="h-11 w-[4.5rem] shrink-0 rounded sm:h-12 sm:w-16" />
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <Skeleton className="h-3.5 w-full" />
                      <Skeleton className="h-3.5 w-3/4" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePageSkeleton() {
  return (
    <div
      className="mx-auto flex w-full min-w-0 justify-center gap-4"
      aria-busy="true"
      aria-label="뉴스를 불러오는 중"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-stretch border-b border-ink-900/10 bg-flash-100">
          <div className="flex shrink-0 items-center bg-flash-600 py-2.5">
            <Skeleton className="h-3 w-20 bg-white/30" />
          </div>
        </div>

        <div className="flex min-w-0 justify-center gap-4">
          <aside className="hidden w-40 shrink-0 sm:my-6 lg:block" />

          <div className="flex min-w-0 w-full max-w-full flex-col">
            <div className="mb-6 flex justify-center gap-6">
              <div className="flex min-w-0 flex-col">
                <section className="mx-auto w-full min-w-0 max-w-6xl px-6 pt-6 sm:px-6">
                  <Skeleton className="aspect-[16/9] w-full rounded-lg lg:aspect-[21/9]" />
                </section>

                <CarouselSkeleton />
                <CarouselSkeleton />
                <CarouselSkeleton />
                <CarouselSkeleton />
              </div>

              <ArticleSideNewsSkeleton />
            </div>

            <SectionGridSkeleton />
          </div>

          <aside className="hidden w-40 shrink-0 sm:my-6 lg:block" />
        </div>
      </div>
    </div>
  );
}
