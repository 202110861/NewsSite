import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, type FormEvent } from "react";
import { fetchArticle, fetchArticles } from "../lib/articles";
import {
  createComment,
  fetchComments,
  fetchLikeStatus,
  toggleArticleLike,
  type ArticleComment,
} from "../lib/engagement";
import ArticleCommentItem from "../components/ArticleCommentItem";
import { sectionMap, sections } from "../data/sections";
import SectionTag from "../components/SectionTag";
import NewsCarousel from "../components/NewsCarousel";
import ArticleSocialLoginRail from "../components/ArticleSocialLoginRail";
import ArticleSideNews from "../components/ArticleSideNews";
import { ArticleDetailSkeleton } from "../components/skeleton";
import ArticleAdminMenu from "../components/admin/ArticleAdminMenu";
import ArticleInlineEditBody from "../components/admin/ArticleInlineEditBody";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import { getApiErrorMessage } from "../lib/errors";
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
import SeoHead from "../components/SeoHead";

import { youtubeEmbedUrl } from "../utils/youtube";

function renderBodyBlock(block: ArticleBodyBlock, key: number) {
  if (typeof block === "string") {
    const lines = block.split("\n");
    return (
      <p
        key={key}
        className="whitespace-pre-line text-base leading-[1.85] text-ink-800"
      >
        {lines.map((line, i) => {
          const isHeading = line.trimStart().startsWith("■");
          const content = isHeading ? (
            <span className="text-lg font-bold">{line}</span>
          ) : (
            line
          );
          return (
            <span key={i}>
              {i > 0 ? "\n" : null}
              {content}
            </span>
          );
        })}
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
  const navigate = useNavigate();
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

  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeBusy, setLikeBusy] = useState(false);
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setIsEditing(false);
    setIsCommentOpen(false);
    setCommentBody("");
    setCommentError("");
    setShareMessage("");

    Promise.all([
      fetchArticle(id),
      fetchArticles({ limit: 100 }),
      fetchLikeStatus(id).catch(() => ({ likeCount: 0, liked: false })),
      fetchComments(id).catch(() => [] as ArticleComment[]),
    ])
      .then(([detail, list, likeStatus, commentList]) => {
        if (cancelled) return;
        setArticle(detail);
        setAllArticles(list);
        setLikeCount(likeStatus.likeCount);
        setLiked(likeStatus.liked);
        setComments(commentList);
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

  useEffect(() => {
    if (!id || !user) return;
    let cancelled = false;
    fetchLikeStatus(id)
      .then((status) => {
        if (cancelled) return;
        setLikeCount(status.likeCount);
        setLiked(status.liked);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id, user]);

  function requireLogin() {
    if (!id) return;
    navigate("/login", { state: { from: `/article/${id}` } });
  }

  async function handleLike() {
    if (!id) return;
    if (!user) {
      requireLogin();
      return;
    }
    if (likeBusy) return;
    setLikeBusy(true);
    try {
      const status = await toggleArticleLike(id);
      setLiked(status.liked);
      setLikeCount(status.likeCount);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        requireLogin();
      }
    } finally {
      setLikeBusy(false);
    }
  }

  function handleCommentToggle() {
    setIsCommentOpen((open) => !open);
    setCommentError("");
  }

  async function handleSubmitComment(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    if (!user) {
      requireLogin();
      return;
    }
    const body = commentBody.trim();
    if (!body) {
      setCommentError("댓글 내용을 입력해 주세요.");
      return;
    }
    setCommentSubmitting(true);
    setCommentError("");
    try {
      const created = await createComment(id, body);
      setComments((prev) => [...prev, created]);
      setCommentBody("");
    } catch (err) {
      setCommentError(getApiErrorMessage(err, "댓글 등록에 실패했습니다."));
    } finally {
      setCommentSubmitting(false);
    }
  }

  async function handleShare() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShareMessage("링크가 복사되었습니다");
      window.setTimeout(() => setShareMessage(""), 2000);
    } catch {
      setShareMessage("복사에 실패했습니다");
      window.setTimeout(() => setShareMessage(""), 2000);
    }
  }

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
      setEditError(getApiErrorMessage(err, "저장에 실패했습니다."));
    } finally {
      setSaving(false);
    }
  }

  if (!id) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return <ArticleDetailSkeleton />;
  }

  if (notFound || !article) {
    return <Navigate to="/" replace />;
  }

  const meta = sectionMap[isEditing ? editSectionId : article.section];
  const related = getRelatedArticles(allArticles, article);
  const { prev, next } = getAdjacentArticles(allArticles, article);
  const others = allArticles.filter((a) => a.id !== article.id);
  const publisherNews = others
    .filter((a) => a.section === "publisher")
    .slice(0, 5);
  const latestNews = others.slice(0, 5);
  const popularNews = [...others]
    .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
    .slice(0, 5);
  return (
    <>
      <SeoHead
        title={`${article.title} - 경제인뉴스`}
        description={article.excerpt?.trim() || article.title}
        path={`/article/${article.id}`}
        image={
          article.image ? resolveAbsoluteMediaUrl(article.image) : undefined
        }
        type="article"
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <header>
          <nav className="mb-5 flex items-center gap-1.5 text-xs text-ink-500">
            <Link to="/" className="hover:text-flash-600">
              홈
            </Link>
            <span>›</span>
            <span>{meta?.label ?? "뉴스"}</span>
          </nav>

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
                <div className="flex justify-between w-20">
                  <SectionTag section={article.section} />
                </div>
              )}

              {isEditing ? (
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-3 w-full border-0 bg-transparent p-0 text-2xl font-bold leading-snug text-ink-900 outline-none focus:ring-2 focus:ring-flash-600/20 sm:text-3xl"
                />
              ) : (
                <h1 className="mt-3 text-4xl font-bold leading-snug text-ink-900 sm:text-4xl">
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

        <div className="mt-6 flex gap-6 xl:gap-8">
          {!isEditing && !user && <ArticleSocialLoginRail />}

          <article className="flex min-w-0 flex-1 flex-col">
            {!isEditing &&
              article.videoUrl &&
              youtubeEmbedUrl(article.videoUrl) && (
                <figure>
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
              <ArticleInlineEditBody
                blocks={editBlocks}
                onChange={setEditBlocks}
              />
            ) : (
              <div className="flex flex-1 flex-col gap-4">
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

            {!isEditing && (
              <div className="mt-8 flex flex-col gap-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void handleLike()}
                    disabled={likeBusy}
                    className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
                      liked
                        ? "border-flash-600 bg-flash-600/10 text-flash-600"
                        : "border-ink-900/15 text-ink-700 hover:border-ink-900 hover:text-ink-900"
                    }`}
                  >
                    좋아요
                    {likeCount >= 2
                      ? ` ${likeCount.toLocaleString("ko-KR")}`
                      : ""}
                  </button>
                  <button
                    type="button"
                    onClick={handleCommentToggle}
                    className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      isCommentOpen
                        ? "border-ink-900 text-ink-900"
                        : "border-ink-900/15 text-ink-700 hover:border-ink-900 hover:text-ink-900"
                    }`}
                  >
                    댓글
                    {comments.length > 0
                      ? ` ${comments.length.toLocaleString("ko-KR")}`
                      : ""}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleShare()}
                    className="cursor-pointer rounded-full border border-ink-900/15 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:border-ink-900 hover:text-ink-900"
                  >
                    {shareMessage || "공유"}
                  </button>
                </div>

                {isCommentOpen && (
                  <div className="flex flex-col gap-4 rounded-lg bg-paper-100 px-4 py-3.5">
                    <p className="text-sm text-ink-500">
                      기사에 대한 의견을 남겨보세요.
                    </p>
                    <form
                      onSubmit={(e) => void handleSubmitComment(e)}
                      className="flex flex-col gap-2 sm:flex-row sm:items-start"
                    >
                      <input
                        type="text"
                        value={commentBody}
                        onChange={(e) => setCommentBody(e.target.value)}
                        placeholder={
                          user
                            ? "댓글을 입력하세요"
                            : "로그인 후 댓글을 작성할 수 있습니다"
                        }
                        maxLength={2000}
                        disabled={!user || commentSubmitting}
                        className="min-w-0 flex-1 rounded-md border border-ink-900/15 bg-white px-3 py-2 text-sm text-ink-800 outline-none placeholder:text-ink-400 focus:border-flash-600 disabled:bg-paper-50"
                      />
                      <button
                        type="submit"
                        disabled={
                          !user || commentSubmitting || !commentBody.trim()
                        }
                        className="shrink-0 rounded-full bg-flash-600 px-4 py-2 text-xs font-semibold text-white hover:bg-flash-700 disabled:opacity-50"
                      >
                        {commentSubmitting ? "등록 중…" : "등록"}
                      </button>
                    </form>
                    {commentError && (
                      <p className="text-sm text-flash-600">{commentError}</p>
                    )}
                    {comments.length > 0 && (
                      <ul className="flex flex-col gap-3 border-t border-ink-900/10 pt-3">
                        {comments.map((comment) => (
                          <ArticleCommentItem
                            key={comment.id}
                            articleId={id!}
                            comment={comment}
                            isOwner={user?.id === comment.user.id}
                            onUpdated={(updated) => {
                              setComments((prev) =>
                                prev.map((item) =>
                                  item.id === updated.id ? updated : item,
                                ),
                              );
                            }}
                            onDeleted={(commentId) => {
                              setComments((prev) =>
                                prev.filter((item) => item.id !== commentId),
                              );
                            }}
                          />
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}

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

          {!isEditing && (
            <ArticleSideNews
              publisher={publisherNews}
              latest={latestNews}
              popular={popularNews}
            />
          )}
        </div>
      </div>

      {!isEditing && related.length > 0 && (
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <NewsCarousel
            title={`${meta?.label ?? ""} 관련기사`}
            articles={related}
            moreHref={`/section/${article.section}`}
          />
        </div>
      )}
    </>
  );
}
