import { prisma } from "../../db/client.js";
import { AppError } from "../../middlewares/errorHandler.middleware.js";
import { articleInclude, toFrontendArticle } from "../articles/article.mapper.js";

async function assertPublishedArticle(articleId: string) {
  const article = await prisma.article.findFirst({
    where: { id: articleId, status: "PUBLISHED" },
    select: { id: true },
  });
  if (!article) throw new AppError(404, "기사를 찾을 수 없습니다.");
  return article;
}

export async function getLikeStatus(articleId: string, userId?: string) {
  await assertPublishedArticle(articleId);

  const [likeCount, liked] = await Promise.all([
    prisma.articleLike.count({ where: { articleId } }),
    userId
      ? prisma.articleLike
          .findUnique({
            where: { userId_articleId: { userId, articleId } },
            select: { id: true },
          })
          .then((row) => Boolean(row))
      : Promise.resolve(false),
  ]);

  return { likeCount, liked };
}

export async function toggleLike(articleId: string, userId: string) {
  await assertPublishedArticle(articleId);

  const existing = await prisma.articleLike.findUnique({
    where: { userId_articleId: { userId, articleId } },
  });

  if (existing) {
    await prisma.articleLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.articleLike.create({ data: { userId, articleId } });
  }

  return getLikeStatus(articleId, userId);
}

export async function listComments(articleId: string) {
  await assertPublishedArticle(articleId);

  const comments = await prisma.comment.findMany({
    where: { articleId },
    include: { user: { select: { id: true, username: true } } },
    orderBy: { createdAt: "asc" },
  });

  return comments.map((comment) => ({
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    user: {
      id: comment.user.id,
      username: comment.user.username,
    },
  }));
}

export async function createComment(
  articleId: string,
  userId: string,
  body: string,
) {
  await assertPublishedArticle(articleId);

  const comment = await prisma.comment.create({
    data: { articleId, userId, body },
    include: { user: { select: { id: true, username: true } } },
  });

  return {
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    user: {
      id: comment.user.id,
      username: comment.user.username,
    },
  };
}

export async function listMyLikes(userId: string) {
  const likes = await prisma.articleLike.findMany({
    where: {
      userId,
      article: { status: "PUBLISHED" },
    },
    include: {
      article: { include: articleInclude },
    },
    orderBy: { createdAt: "desc" },
  });

  return likes.map((like) => ({
    id: like.id,
    createdAt: like.createdAt.toISOString(),
    article: toFrontendArticle(like.article),
  }));
}

export async function listMyComments(userId: string) {
  const comments = await prisma.comment.findMany({
    where: {
      userId,
      article: { status: "PUBLISHED" },
    },
    include: {
      article: {
        select: {
          id: true,
          title: true,
          sectionId: true,
          publishedAt: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return comments.map((comment) => ({
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    article: {
      id: comment.article.id,
      title: comment.article.title,
      section: comment.article.sectionId,
      publishedAt: (
        comment.article.publishedAt ?? comment.article.createdAt
      ).toISOString(),
    },
  }));
}
