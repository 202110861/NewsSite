import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiError } from "../../lib/api";
import {
  approveAdminArticle,
  createAdminArticle,
  deleteAdminArticle,
  fetchAdminArticle,
  updateAdminArticle,
} from "../../lib/admin";
import RichBodyEditor from "../../components/admin/RichBodyEditor";
import { sections } from "../../data/sections";
import type { BodyBlockInput, SectionId } from "../../types/news";

export default function AdminArticleFormPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [sectionId, setSectionId] = useState<SectionId>(
    sections[0]?.id ?? "politics",
  );
  const [blocks, setBlocks] = useState<BodyBlockInput[]>([
    { type: "TEXT", text: "" },
  ]);
  const [loading, setLoading] = useState(!isNew);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isNew || !id) return;

    let cancelled = false;
    setLoading(true);
    fetchAdminArticle(id)
      .then((article) => {
        if (cancelled) return;
        setTitle(article.title);
        setSectionId(article.sectionId as SectionId);
        setBlocks(
          article.blocks.length > 0
            ? article.blocks
            : [{ type: "TEXT", text: "" }],
        );
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "기사를 불러오지 못했습니다.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, isNew]);

  function normalizedBlocks() {
    const cleaned = blocks.filter((block) => {
      if (block.type === "TEXT") return (block.text ?? "").trim().length > 0;
      return Boolean(block.mediaUrl || block.filePath);
    });
    return cleaned.length > 0
      ? cleaned
      : [{ type: "TEXT" as const, text: " " }];
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("제목을 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const payload = {
        title: title.trim(),
        sectionId,
        blocks: normalizedBlocks(),
      };

      if (isNew) {
        const created = await createAdminArticle(payload);
        navigate(`/admin/articles/${created.id}`, { replace: true });
      } else if (id) {
        await updateAdminArticle(id, payload);
        navigate("/admin/reviews");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!id || isNew) return;
    if (!window.confirm("이 기사를 삭제할까요?")) return;

    setSubmitting(true);
    setError("");
    try {
      await deleteAdminArticle(id);
      navigate("/admin/reviews");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "삭제에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApprove() {
    if (!id || isNew) return;
    if (!window.confirm("이 기사를 승인(게시)할까요?")) return;

    setSubmitting(true);
    setError("");
    try {
      await updateAdminArticle(id, {
        title: title.trim(),
        sectionId,
        blocks: normalizedBlocks(),
      });
      await approveAdminArticle(id);
      navigate("/admin/reviews");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "승인에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-sm text-ink-500">
        불러오는 중...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <Link
            to="/admin/reviews"
            className="text-sm font-semibold text-flash-600 hover:underline"
          >
            ← 검수 목록
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-ink-900">
            {isNew ? "새 기사 작성" : "기사 수정"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-ink-700">
            제목
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-ink-900/15 px-3 py-2.5 text-sm outline-none focus:border-flash-600"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink-700">
            섹션
          </label>
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value as SectionId)}
            className="mt-1.5 w-full rounded-lg border border-ink-900/15 px-3 py-2.5 text-sm outline-none focus:border-flash-600"
          >
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-ink-700">
            본문
          </label>
          <RichBodyEditor value={blocks} onChange={setBlocks} />
        </div>

        {error && <p className="text-sm text-flash-600">{error}</p>}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-flash-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-flash-700 disabled:opacity-60"
          >
            {submitting ? "저장 중..." : "저장"}
          </button>
          {!isNew && (
            <>
              <button
                type="button"
                disabled={submitting}
                onClick={handleApprove}
                className="rounded-lg border border-section-economy px-4 py-2.5 text-sm font-bold text-section-economy hover:bg-paper-100 disabled:opacity-60"
              >
                승인(게시)
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDelete}
                className="rounded-lg border border-flash-600 px-4 py-2.5 text-sm font-bold text-flash-600 hover:bg-flash-50 disabled:opacity-60"
              >
                삭제
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
