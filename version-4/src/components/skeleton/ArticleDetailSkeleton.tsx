import { Skeleton } from "./Skeleton";

export default function ArticleDetailSkeleton() {
  return (
    <article
      className="mx-auto max-w-3xl px-4 py-8 sm:px-6"
      aria-busy="true"
      aria-label="기사를 불러오는 중"
    >
      <nav className="mb-5 flex items-center gap-1.5">
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-3 w-2" />
        <Skeleton className="h-3 w-14" />
      </nav>

      <header>
        <Skeleton className="h-5 w-14 rounded-sm" />
        <Skeleton className="mt-3 h-8 w-full sm:h-9" />
        <Skeleton className="mt-2 h-8 w-4/5 sm:h-9" />
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-ink-900/10 pb-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-2" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-2" />
          <Skeleton className="h-4 w-20" />
        </div>
      </header>

      <Skeleton className="mt-6 aspect-video w-full rounded-lg" />

      <div className="mt-7 flex flex-col gap-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="mt-2 h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-2 h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      <div className="mt-8 flex gap-2">
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-14 rounded-full" />
        <Skeleton className="h-8 w-12 rounded-full" />
      </div>

      <div className="mt-10 border-t border-ink-900/10 pt-6">
        <div className="mb-4 flex items-baseline justify-between border-b-2 border-ink-900 pb-2.5">
          <Skeleton className="h-6 w-24 rounded-sm" />
        </div>
        <div className="flex gap-3 overflow-hidden sm:gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="w-[82%] shrink-0 sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.75rem)]"
            >
              <Skeleton className="aspect-[4/3] w-full rounded-md" />
              <div className="mt-2.5 flex flex-col gap-1.5">
                <Skeleton className="h-4 w-12 rounded-sm" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
