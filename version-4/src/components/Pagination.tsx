interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

function getVisiblePages(page: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  if (page <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (page >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
    pages.add(totalPages - 3);
  }

  return [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
}

export default function Pagination({
  page,
  totalPages,
  onChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getVisiblePages(page, totalPages);

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-1"
      aria-label="페이지 탐색"
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-md px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-paper-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        이전
      </button>

      {pages.map((pageNumber, index) => {
        const prev = pages[index - 1];
        const showEllipsis = prev != null && pageNumber - prev > 1;

        return (
          <span key={pageNumber} className="contents">
            {showEllipsis && (
              <span className="px-1 text-sm text-ink-400" aria-hidden>
                …
              </span>
            )}
            <button
              type="button"
              onClick={() => onChange(pageNumber)}
              aria-current={pageNumber === page ? "page" : undefined}
              className={`min-w-9 rounded-md px-3 py-2 text-sm font-semibold ${
                pageNumber === page
                  ? "bg-ink-900 text-white"
                  : "text-ink-700 hover:bg-paper-100"
              }`}
            >
              {pageNumber}
            </button>
          </span>
        );
      })}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-md px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-paper-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        다음
      </button>
    </nav>
  );
}
