import { Skeleton } from "./Skeleton";
import ArticleSideNewsSkeleton from "./ArticleSideNewsSkeleton";

export default function ArticleDetailSkeleton() {
  return (
    <div
      className="mx-auto max-w-6xl px-4 py-8 sm:px-6"
      aria-busy="true"
      aria-label="기사를 불러오는 중"
    >
      <header>
        <nav className="mb-5 flex items-center gap-1.5">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-2" />
          <Skeleton className="h-3 w-14" />
        </nav>

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

      <div className="mt-6 flex gap-6 xl:gap-8">
        <article className="min-w-0 flex-1">
          <Skeleton className="aspect-video w-full rounded-lg" />

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
        </article>

        <ArticleSideNewsSkeleton />
      </div>
    </div>
  );
}
