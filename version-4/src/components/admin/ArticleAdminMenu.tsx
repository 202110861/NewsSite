import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../lib/errors";
import { deleteAdminArticle } from "../../lib/admin";

import type { SectionId } from "../../types/news";

interface Props {
  articleId: string;
  sectionId: SectionId;
  onEdit: () => void;
  editing?: boolean;
}

export default function ArticleAdminMenu({
  articleId,
  sectionId,
  onEdit,
  editing = false,
}: Props) {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleDelete() {
    if (!window.confirm("이 기사를 삭제할까요?")) return;

    setDeleting(true);
    try {
      await deleteAdminArticle(articleId);
      navigate(`/section/${sectionId}`, { replace: true });
    } catch (err) {
      window.alert(getApiErrorMessage(err, "삭제에 실패했습니다."));
    } finally {
      setDeleting(false);
      setOpen(false);
    }
  }

  function handleEdit() {
    setOpen(false);
    onEdit();
  }

  if (editing) return null;

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        aria-label="기사 관리 메뉴"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-900/15 text-ink-600 hover:border-ink-900/30 hover:bg-paper-100 hover:text-ink-900"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="12" cy="5" r="1.75" />
          <circle cx="12" cy="12" r="1.75" />
          <circle cx="12" cy="19" r="1.75" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[120px] overflow-hidden rounded-lg border border-ink-900/10 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={handleEdit}
            className="block w-full px-4 py-2 text-left text-sm text-ink-800 hover:bg-paper-100"
          >
            수정
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="block w-full px-4 py-2 text-left text-sm text-flash-600 hover:bg-flash-50 disabled:opacity-50"
          >
            {deleting ? "삭제 중..." : "삭제"}
          </button>
        </div>
      )}
    </div>
  );
}
