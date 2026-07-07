import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../../lib/api";
import { bulkDeleteAdminArticles, fetchReviewArticles } from "../../lib/admin";
import { sectionMap } from "../../data/sections";
import type { AdminArticle } from "../../types/news";

export default function AdminReviewListPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchReviewArticles();
      setArticles(data);
      setSelected(new Set());
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "목록을 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === articles.length) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(articles.map((a) => a.id)));
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return;
    if (!window.confirm(`선택한 ${selected.size}건을 삭제할까요?`)) return;

    setDeleting(true);
    setError("");
    try {
      await bulkDeleteAdminArticles(Array.from(selected));
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "삭제에 실패했습니다.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">기사 검수</h1>
          <p className="mt-1 text-sm text-ink-500">
            검수 대기 중인 기사를 확인하고 승인·수정·삭제할 수 있습니다.
          </p>
        </div>
        <Link
          to="/admin/articles/new"
          className="rounded-lg bg-flash-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-flash-700"
        >
          새 기사 작성
        </Link>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          disabled={selected.size === 0 || deleting}
          onClick={handleBulkDelete}
          className="rounded border border-flash-600 px-3 py-1.5 text-sm font-semibold text-flash-600 hover:bg-flash-50 disabled:opacity-40"
        >
          {deleting ? "삭제 중..." : `선택 삭제 (${selected.size})`}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-flash-600">{error}</p>}

      {loading ? (
        <p className="mt-10 text-center text-sm text-ink-500">불러오는 중...</p>
      ) : articles.length === 0 ? (
        <p className="mt-10 text-center text-sm text-ink-500">
          검수 대기 기사가 없습니다.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-ink-900/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper-100 text-ink-600">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      selected.size === articles.length && articles.length > 0
                    }
                    onChange={toggleAll}
                  />
                </th>
                <th className="px-4 py-3">제목</th>
                <th className="px-4 py-3">섹션</th>
                <th className="px-4 py-3">작성일</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr
                  key={article.id}
                  className="cursor-pointer border-t border-ink-900/10 hover:bg-paper-50"
                  onClick={() => navigate(`/admin/articles/${article.id}`)}
                >
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(article.id)}
                      onChange={() => toggleOne(article.id)}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-ink-900">
                    {article.title}
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    {sectionMap[article.sectionId]?.label ?? article.sectionId}
                  </td>
                  <td className="px-4 py-3 text-ink-500">
                    {new Date(article.createdAt).toLocaleString("ko-KR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
