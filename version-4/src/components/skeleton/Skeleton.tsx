interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-ink-900/10 ${className}`}
      aria-hidden
    />
  );
}
