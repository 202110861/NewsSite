import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ArticleComment } from "../lib/engagement";
import { deleteComment, updateComment } from "../lib/engagement";
import { getApiErrorMessage } from "../lib/errors";

interface Props {
  articleId: string;
  comment: ArticleComment;
  isOwner: boolean;
  onUpdated: (comment: ArticleComment) => void;
  onDeleted: (commentId: string) => void;
}

export default function ArticleCommentItem({
  articleId,
  comment,
  isOwner,
  onUpdated,
  onDeleted,
}: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!isEditing) setEditBody(comment.body);
  }, [comment.body, isEditing]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    const body = editBody.trim();
    if (!body) {
      setError("댓글 내용을 입력해 주세요.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const updated = await updateComment(articleId, comment.id, body);
      onUpdated(updated);
      setIsEditing(false);
      setMenuOpen(false);
    } catch (err) {
      setError(getApiErrorMessage(err, "댓글 수정에 실패했습니다."));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("이 댓글을 삭제하시겠습니까?")) return;
    setBusy(true);
    setError("");
    setMenuOpen(false);
    try {
      await deleteComment(articleId, comment.id);
      onDeleted(comment.id);
    } catch (err) {
      setError(getApiErrorMessage(err, "댓글 삭제에 실패했습니다."));
      setBusy(false);
    }
  }

  return (
    <li className="text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-semibold text-ink-800">
              {comment.user.username}
            </span>
            <time dateTime={comment.createdAt} className="text-xs text-ink-400">
              {new Date(comment.createdAt).toLocaleString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </div>

          {isEditing ? (
            <form onSubmit={(e) => void handleSave(e)} className="mt-2 space-y-2">
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                maxLength={2000}
                rows={3}
                disabled={busy}
                className="w-full resize-y rounded-md border border-ink-900/15 bg-white px-3 py-2 text-sm text-ink-800 outline-none focus:border-flash-600 disabled:opacity-60"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditBody(comment.body);
                    setError("");
                  }}
                  disabled={busy}
                  className="rounded-full border border-ink-900/15 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-paper-50 disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={busy || !editBody.trim()}
                  className="rounded-full bg-flash-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-flash-700 disabled:opacity-50"
                >
                  {busy ? "저장 중…" : "저장"}
                </button>
              </div>
            </form>
          ) : (
            <p className="mt-1 whitespace-pre-wrap text-ink-700">{comment.body}</p>
          )}

          {error && <p className="mt-1.5 text-xs text-flash-600">{error}</p>}
        </div>

        {isOwner && !isEditing && (
          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              aria-label="댓글 메뉴"
              aria-expanded={menuOpen}
              disabled={busy}
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-ink-500 hover:bg-ink-900/5 hover:text-ink-800 disabled:opacity-50"
            >
              <span aria-hidden className="text-base leading-none tracking-tighter">
                ⋮
              </span>
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 z-10 mt-1 min-w-24 overflow-hidden rounded-md border border-ink-900/10 bg-white py-1 shadow-md"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setIsEditing(true);
                    setError("");
                  }}
                  className="block w-full px-3 py-2 text-left text-xs font-semibold text-ink-700 hover:bg-paper-100"
                >
                  수정
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => void handleDelete()}
                  className="block w-full px-3 py-2 text-left text-xs font-semibold text-flash-600 hover:bg-paper-100"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
