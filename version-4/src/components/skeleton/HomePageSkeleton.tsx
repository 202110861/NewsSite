import { Skeleton } from "./Skeleton";
import ArticleSideNewsSkeleton from "./ArticleSideNewsSkeleton";

function CarouselSkeleton({ className = "" }: { className?: string }) {
  return (
    <section
      className={`mx-auto w-full min-w-0 max-w-6xl px-6 py-2 ${className}`}
    >
      <div className="mb-4 flex items-baseline justify-between border-b-2 border-ink-900 px-2 pb-2.5">
        <Skeleton className="h-6 w-24 rounded-sm sm:h-7 sm:w-28" />
        <Skeleton className="h-3.5 w-14" />
      </div>
      <div className="relative min-w-0">
        <div className="flex gap-1.5 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-[calc((100%-0.75rem)/3)] shrink-0 lg:w-[calc((100%-1.5rem)/5)]"
            >
              <Skeleton className="aspect-4/3 w-full rounded-md" />
              <div className="mt-1 flex flex-col gap-1.5">
                <Skeleton className="h-4 w-12 rounded-sm" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          ))}
        </div>
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
          {Array.from({ length: 6 }).map((_, i) => (
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
          <div className="flex shrink-0 items-center gap-2 bg-flash-600 px-4 py-2.5">
            <Skeleton className="h-2 w-2 rounded-full bg-white/30" />
            <Skeleton className="h-3 w-20 bg-white/30" />
          </div>
        </div>

        <div className="flex min-w-0 justify-center gap-4">
          <aside className="hidden w-40 shrink-0 sm:my-6 lg:block" />

          <div className="flex min-w-0 w-full max-w-full flex-col xl:w-[calc(100%-600px)]">
            <div className="mb-6 flex min-w-0 justify-center gap-1">
              <div className="flex min-w-0 flex-1 flex-col">
                <section className="mx-auto w-full min-w-0 max-w-6xl px-6 py-6 sm:px-6">
                  <Skeleton className="aspect-video w-full rounded-lg" />
                </section>

                <CarouselSkeleton className="md:hidden" />
                <CarouselSkeleton />
                <CarouselSkeleton />
                <CarouselSkeleton />
                <CarouselSkeleton />
              </div>

              <ArticleSideNewsSkeleton className="mt-7 basis-[min(16rem,28%)]" />
            </div>

            <SectionGridSkeleton />
          </div>

          <aside className="hidden w-40 shrink-0 sm:my-6 lg:block" />
        </div>
      </div>
    </div>
  );
}
