import { Link, Navigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchArticle, fetchArticles } from "../lib/articles";
import { sectionMap, sections } from "../data/sections";
import SectionTag from "../components/SectionTag";
import NewsCarousel from "../components/NewsCarousel";
import ArticleAdminMenu from "../components/admin/ArticleAdminMenu";
import ArticleInlineEditBody from "../components/admin/ArticleInlineEditBody";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import { fetchAdminArticle, updateAdminArticle } from "../lib/admin";
import { resolveAbsoluteMediaUrl, resolveMediaUrl } from "../utils/media";
import {
  articleBlocksToBodyInput,
  mergeArticleWithBlocks,
  stripBlockKeys,
  withBlockKeys,
  type EditableBlock,
} from "../utils/articleBlocks";
import type { Article, ArticleBodyBlock, SectionId } from "../types/news";
import { Helmet } from "react-helmet-async";

function youtubeEmbedUrl(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/,
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function renderBodyBlock(block: ArticleBodyBlock, key: number) {
  if (typeof block === "string") {
    return (
      <p
        key={key}
        className="whitespace-pre-line text-base leading-[1.85] text-ink-800"
      >
        {block}
      </p>
    );
  }

  if (block.type === "image") {
    return (
      <figure key={key}>
        <div className="overflow-hidden rounded-lg bg-ink-100">
          <img
            src={resolveMediaUrl(block.src)}
            alt={block.caption ?? ""}
            className="w-full object-cover"
          />
        </div>
        {block.caption && (
          <figcaption className="mt-2 text-xs text-ink-500">
            {block.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  const embedUrl = youtubeEmbedUrl(block.src);
  return (
    <figure key={key}>
      <div className="overflow-hidden rounded-lg bg-ink-100">
        {embedUrl ? (
          <div className="aspect-video">
            <iframe
              src={embedUrl}
              title={block.caption ?? "동영상"}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <video src={resolveMediaUrl(block.src)} controls className="w-full" />
        )}
      </div>
      {block.caption && (
        <figcaption className="mt-2 text-xs text-ink-500">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}

function getRelatedArticles(all: Article[], current: Article, count = 6) {
  const sameSection = all.filter(
    (a) => a.id !== current.id && a.section === current.section,
  );
  if (sameSection.length >= count) return sameSection.slice(0, count);

  const others = all.filter(
    (a) => a.id !== current.id && a.section !== current.section,
  );
  return [...sameSection, ...others].slice(0, count);
}

function getAdjacentArticles(all: Article[], current: Article) {
  const idx = all.findIndex((a) => a.id === current.id);
  const prev = idx >= 0 ? all[idx + 1] : undefined;
  const next = idx > 0 ? all[idx - 1] : undefined;
  return { prev, next };
}

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSectionId, setEditSectionId] = useState<SectionId>("politics");
  const [editBlocks, setEditBlocks] = useState<EditableBlock[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setIsEditing(false);

    Promise.all([fetchArticle(id), fetchArticles({ limit: 100 })])
      .then(([detail, list]) => {
        if (cancelled) return;
        setArticle(detail);
        setAllArticles(list);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function startEditing() {
    if (!article) return;

    setEditError("");
    setEditLoading(true);

    try {
      const adminArticle = await fetchAdminArticle(article.id);
      setEditTitle(adminArticle.title);
      setEditSectionId(adminArticle.sectionId as SectionId);
      setEditBlocks(
        withBlockKeys(
          adminArticle.blocks.length > 0
            ? adminArticle.blocks
            : articleBlocksToBodyInput(article.body),
        ),
      );
      setIsEditing(true);
    } catch (err) {
      setEditBlocks(withBlockKeys(articleBlocksToBodyInput(article.body)));
      setEditTitle(article.title);
      setEditSectionId(article.section);
      setIsEditing(true);
      if (err instanceof ApiError && err.status !== 404) {
        setEditError(err.message);
      }
    } finally {
      setEditLoading(false);
    }
  }

  function cancelEditing() {
    setIsEditing(false);
    setEditError("");
  }

  async function saveEditing() {
    if (!article || !editTitle.trim()) {
      setEditError("제목을 입력해 주세요.");
      return;
    }

    setSaving(true);
    setEditError("");

    try {
      const blocks = stripBlockKeys(editBlocks);
      await updateAdminArticle(article.id, {
        title: editTitle.trim(),
        sectionId: editSectionId,
        blocks,
      });

      const updated = mergeArticleWithBlocks(article, blocks, {
        title: editTitle.trim(),
        sectionId: editSectionId,
      });

      setArticle(updated);
      setAllArticles((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      setIsEditing(false);
    } catch (err) {
      setEditError(
        err instanceof ApiError ? err.message : "저장에 실패했습니다.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!id) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-sm text-ink-500">
        기사를 불러오는 중…
      </div>
    );
  }

  if (notFound || !article) {
    return <Navigate to="/" replace />;
  }

  const meta = sectionMap[isEditing ? editSectionId : article.section];
  const related = getRelatedArticles(allArticles, article);
  const { prev, next } = getAdjacentArticles(allArticles, article);
  const pageUrl =
    import.meta.env.VITE_SITE_URL?.replace(/\/$/, "") ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "https://newsin.kr");

  return (
    <>
      <Helmet>
        <title>{article.title} - 경제인뉴스</title>
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta
          property="og:image"
          content={
            article.image ? resolveAbsoluteMediaUrl(article.image) : undefined
          }
        />
        <meta property="og:url" content={`${pageUrl}/article/${article.id}`} />
      </Helmet>
      <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <nav className="mb-5 flex items-center gap-1.5 text-xs text-ink-500">
          <Link to="/" className="hover:text-flash-600">
            홈
          </Link>
          <span>›</span>
          <span>{meta?.label ?? "뉴스"}</span>
        </nav>

        <header>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {isEditing ? (
                <select
                  value={editSectionId}
                  onChange={(e) =>
                    setEditSectionId(e.target.value as SectionId)
                  }
                  className="rounded-md border border-ink-900/15 bg-white px-2 py-1 text-xs font-semibold text-ink-700 outline-none focus:border-flash-600"
                >
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.label}
                    </option>
                  ))}
                </select>
              ) : (
                <SectionTag section={article.section} />
              )}

              {isEditing ? (
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-3 w-full border-0 bg-transparent p-0 text-2xl font-bold leading-snug text-ink-900 outline-none focus:ring-2 focus:ring-flash-600/20 sm:text-3xl"
                />
              ) : (
                <h1 className="mt-3 text-2xl font-bold leading-snug text-ink-900 sm:text-3xl">
                  {article.title}
                </h1>
              )}
            </div>

            {user?.role === "ADMIN" && !isEditing && (
              <ArticleAdminMenu
                articleId={article.id}
                sectionId={article.section}
                onEdit={startEditing}
                editing={isEditing}
              />
            )}

            {user?.role === "ADMIN" && isEditing && (
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                  className="rounded-full border border-ink-900/15 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:border-ink-900 disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => void saveEditing()}
                  disabled={saving || editLoading}
                  className="rounded-full bg-flash-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-flash-700 disabled:opacity-50"
                >
                  {saving ? "저장 중..." : "저장"}
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-ink-900/10 pb-4 text-sm text-ink-500">
            {article.reporter && (
              <span className="font-semibold text-ink-700">
                {article.reporter}
              </span>
            )}
            <span>·</span>
            <time dateTime={article.publishedAt}>
              {new Date(article.publishedAt).toLocaleString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
            {typeof article.viewCount === "number" && (
              <>
                <span>·</span>
                <span>조회 {article.viewCount.toLocaleString("ko-KR")}</span>
              </>
            )}
          </div>

          {editError && (
            <p className="mt-3 text-sm text-flash-600">{editError}</p>
          )}
          {editLoading && (
            <p className="mt-3 text-sm text-ink-500">
              편집 데이터 불러오는 중…
            </p>
          )}
        </header>

        {!isEditing &&
          article.videoUrl &&
          youtubeEmbedUrl(article.videoUrl) && (
            <figure className="mt-6">
              <div className="aspect-video overflow-hidden rounded-lg bg-ink-100">
                <iframe
                  src={youtubeEmbedUrl(article.videoUrl)!}
                  title={article.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </figure>
          )}

        {isEditing ? (
          <ArticleInlineEditBody blocks={editBlocks} onChange={setEditBlocks} />
        ) : (
          <div className="mt-7 flex flex-col gap-4">
            {article.subtitle && (
              <p className="text-lg font-bold">{article.subtitle}</p>
            )}
            {article.body && article.body.length > 0 ? (
              <>
                {article.body.map((block, i) => renderBodyBlock(block, i))}
                {article.isAI && (
                  <p className="text-sm text-ink-500">
                    이 기사는 AI가 작성하였습니다.
                  </p>
                )}
              </>
            ) : (
              renderBodyBlock(
                article.excerpt ?? "본문 내용이 준비 중입니다.",
                0,
              )
            )}
          </div>
        )}

        {/* {!isEditing && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-paper-100 px-4 py-3.5">
            <p className="text-sm text-ink-700">
              {article.reporter ? `${article.reporter} ` : ""}
              <span className="text-ink-500">기사에 대한 의견을 남겨보세요.</span>
            </p>
            <div className="flex gap-2">
              {["공유", "스크랩", "인쇄"].map((label) => (
                <button
                  key={label}
                  type="button"
                  className="rounded-full border border-ink-900/15 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:border-ink-900 hover:text-ink-900"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )} */}

        {!isEditing && (
          <nav className="mt-8 divide-y divide-ink-900/10 border-y border-ink-900/10">
            {next && (
              <Link
                to={`/article/${next.id}`}
                className="flex items-center gap-3 py-3.5 hover:bg-paper-100"
              >
                <span className="shrink-0 text-xs font-bold text-flash-600">
                  다음기사
                </span>
                <span className="line-clamp-1 flex-1 text-sm text-ink-800">
                  {next.title}
                </span>
                <span className="text-ink-300">›</span>
              </Link>
            )}
            {prev && (
              <Link
                to={`/article/${prev.id}`}
                className="flex items-center gap-3 py-3.5 hover:bg-paper-100"
              >
                <span className="shrink-0 text-xs font-bold text-ink-500">
                  이전기사
                </span>
                <span className="line-clamp-1 flex-1 text-sm text-ink-800">
                  {prev.title}
                </span>
                <span className="text-ink-300">›</span>
              </Link>
            )}
          </nav>
        )}
      </article>

      {!isEditing && related.length > 0 && (
        <NewsCarousel
          title={`${meta?.label ?? ""} 관련기사`}
          articles={related}
          moreHref={`/section/${article.section}`}
        />
      )}
    </>
  );
}
