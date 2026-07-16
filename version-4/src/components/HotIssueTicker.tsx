import { Link } from "react-router-dom";
import type { HotIssueItem } from "../types/news";

export default function HotIssueTicker({ items }: { items: HotIssueItem[] }) {
  if (items.length === 0) return null;

  const tickerItems = [...items, ...items];

  return (
    <div className="flex items-stretch border-b border-ink-900/10 bg-flash-100">
      <div className="flex shrink-0 items-center gap-2 bg-flash-600 px-4 py-2.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
        <span className="text-xs font-black tracking-widest text-white">
          HOT ISSUE
        </span>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <ul className="flex w-max animate-ticker items-center gap-10 whitespace-nowrap px-6 py-2.5">
          {tickerItems.map((item, i) => (
            <li key={`${item.id}-${i}`} className="text-sm text-ink-800">
              <Link to={`/article/${item.id}`} className="hover:text-flash-700">
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
