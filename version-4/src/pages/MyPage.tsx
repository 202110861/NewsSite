import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  fetchMyComments,
  fetchMyLikes,
  type MyCommentItem,
  type MyLikeItem,
} from "../lib/engagement";
import { getApiErrorMessage } from "../lib/errors";
import { sectionMap } from "../data/sections";
import type { SectionId } from "../types/news";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MyPage() {
  const { user } = useAuth();
  const [likes, setLikes] = useState<MyLikeItem[]>([]);
  const [comments, setComments] = useState<MyCommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    Promise.all([fetchMyLikes(), fetchMyComments()])
      .then(([likeList, commentList]) => {
        if (cancelled) return;
        setLikes(likeList);
        setComments(commentList);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            getApiErrorMessage(err, "마이페이지 정보를 불러오지 못했습니다."),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-ink-500">
        불러오는 중…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-ink-900">마이페이지</h1>
      <p className="mt-2 text-sm text-ink-600">
        {user?.username}님이 좋아요한 기사와 작성한 댓글입니다.
      </p>

      {error && <p className="mt-4 text-sm text-flash-600">{error}</p>}

      <section className="mt-10">
        <h2 className="text-lg font-bold text-ink-900">좋아요한 기사</h2>
        {likes.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">
            아직 좋아요한 기사가 없습니다.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-ink-900/10 border-y border-ink-900/10">
            {likes.map((item) => {
              const sectionLabel =
                sectionMap[item.article.section as SectionId]?.label ?? "뉴스";
              return (
                <li key={item.id}>
                  <Link
                    to={`/article/${item.article.id}`}
                    className="block py-3.5 hover:bg-paper-100"
                  >
                    <span className="text-xs font-semibold text-ink-500">
                      {sectionLabel}
                    </span>
                    <p className="mt-1 text-sm font-semibold text-ink-900">
                      {item.article.title}
                    </p>
                    <time
                      dateTime={item.createdAt}
                      className="mt-1 block text-xs text-ink-400"
                    >
                      좋아요 · {formatDate(item.createdAt)}
                    </time>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-ink-900">작성한 댓글</h2>
        {comments.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">
            아직 작성한 댓글이 없습니다.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-ink-900/10 border-y border-ink-900/10">
            {comments.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/article/${item.article.id}`}
                  className="block py-3.5 hover:bg-paper-100"
                >
                  <p className="text-sm text-ink-800">{item.body}</p>
                  <p className="mt-1.5 text-xs text-ink-500">
                    기사 · {item.article.title}
                  </p>
                  <time
                    dateTime={item.createdAt}
                    className="mt-1 block text-xs text-ink-400"
                  >
                    {formatDate(item.createdAt)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
