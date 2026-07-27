import { Skeleton } from "./Skeleton";

function TitleListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <ul className="divide-y divide-ink-900/10">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="py-2.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-1.5 h-4 w-4/5" />
        </li>
      ))}
    </ul>
  );
}

/** 데스크탑 우측 — 발행인 칼럼 · 최신뉴스 · 인기뉴스 스켈레톤 */
export default function ArticleSideNewsSkeleton({
  className = "mt-7",
}: {
  className?: string;
}) {
  return (
    <aside
      className={`sticky top-24 hidden min-w-0 w-full max-w-64 shrink self-start xl:block ${className}`}
      aria-hidden
    >
      <section>
        <Skeleton className="h-9 w-full rounded-sm" />
        <TitleListSkeleton />
      </section>

      <section className="mt-8">
        <Skeleton className="h-9 w-full rounded-sm" />
        <TitleListSkeleton />
      </section>

      <section className="mt-8">
        <Skeleton className="h-9 w-full rounded-sm" />
        <div className="mt-3">
          <Skeleton className="aspect-4/3 w-full" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-1.5 h-4 w-3/4" />
          <ul className="mt-3 divide-y divide-ink-900/10 border-t border-ink-900/10">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="py-2.5">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-1.5 h-4 w-4/5" />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </aside>
  );
}
