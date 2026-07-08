import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchArticles } from "../lib/articles";
import type { HotIssueItem } from "../types/news";

export default function HotIssueTicker() {
  const [hotIssues, setHotIssues] = useState<HotIssueItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetchArticles({ limit: 5 })
      .then((articles) => {
        if (!cancelled) {
          setHotIssues(
            articles.map((article) => ({
              id: article.id,
              title: article.title,
            })),
          );
        }
      })
      .catch(() => {
        if (!cancelled) setHotIssues([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (hotIssues.length === 0) return null;

  const items = [...hotIssues, ...hotIssues];

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
          {items.map((item, i) => (
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
