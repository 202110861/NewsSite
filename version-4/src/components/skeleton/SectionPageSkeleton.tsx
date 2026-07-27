import { Skeleton } from "./Skeleton";
import ArticleSideNewsSkeleton from "./ArticleSideNewsSkeleton";

interface SectionPageSkeletonProps {
  label?: string;
}

export default function SectionPageSkeleton({
  label,
}: SectionPageSkeletonProps) {
  return (
    <section
      className="mx-auto max-w-6xl px-4 py-8 sm:px-6"
      aria-busy="true"
      aria-label={label ? `${label} 기사를 불러오는 중` : "기사를 불러오는 중"}
    >
      <nav className="mb-4 flex items-center gap-1.5">
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-3 w-2" />
        <Skeleton className="h-3 w-14" />
      </nav>

      <div className="grid min-w-0 xl:grid-cols-[minmax(0,1fr)_minmax(0,min(16rem,28%))] xl:gap-x-6">
        <div className="flex items-baseline justify-between border-b-2 border-ink-900 pb-3 xl:col-start-1">
          {label ? (
            <h1 className="font-display text-2xl font-black tracking-tight text-ink-900 sm:text-3xl">
              {label}
            </h1>
          ) : (
            <Skeleton className="h-8 w-28 rounded-sm sm:h-9 sm:w-32" />
          )}
          <Skeleton className="h-4 w-14" />
        </div>

        <div className="min-w-0 pt-6 xl:col-start-1 xl:row-start-2">
          <div className="grid gap-x-2 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-4/3 w-full rounded-md" />
                <div className="mt-2.5 flex flex-col gap-1.5">
                  <Skeleton className="h-4 w-12 rounded-sm" />
                  <Skeleton className="h-4 w-full sm:h-5" />
                  <Skeleton className="h-4 w-4/5 sm:h-5" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/5" />
                  <Skeleton className="mt-0.5 h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <ArticleSideNewsSkeleton className="mt-0 xl:col-start-2 xl:row-start-2" />
      </div>
    </section>
  );
}
