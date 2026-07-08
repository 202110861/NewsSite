import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../db/client.js";
import { AppError } from "../../middlewares/errorHandler.middleware.js";
import {
  articleInclude,
  buildArticleCreateData,
  buildBlocksCreateData,
  deriveArticleFlags,
  toFrontendArticle,
  type BodyBlockInput,
  type CreateArticleInput,
} from "../articles/article.mapper.js";

export type ArticleStatus =
  | "PENDING_REVIEW"
  | "PUBLISHED"
  | "REJECTED"
  | "ARCHIVED";

const bodyBlockSchema = z.object({
  type: z.enum(["TEXT", "IMAGE", "VIDEO"]),
  text: z.string().optional(),
  mediaUrl: z.string().optional(),
  filePath: z.string().optional(),
  caption: z.string().optional(),
});

export const createArticleSchema = z.object({
  title: z.string().min(1),
  sectionId: z.string().min(1),
  excerpt: z.string().optional(),
  reporter: z.string().optional(),
  sourceUrl: z.string().optional(),
  blocks: z.array(bodyBlockSchema).min(1),
});

export const updateArticleSchema = z.object({
  title: z.string().min(1).optional(),
  sectionId: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  reporter: z.string().optional(),
  sourceUrl: z.string().optional(),
  blocks: z.array(bodyBlockSchema).optional(),
});

export const rejectSchema = z.object({ reason: z.string().min(1) });
export const bulkDeleteSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

function toAdminArticle(
  article: Prisma.ArticleGetPayload<{ include: typeof articleInclude }>,
) {
  return {
    id: article.id,
    title: article.title,
    sectionId: article.sectionId,
    status: article.status,
    excerpt: article.excerpt,
    reporter: article.reporter,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    blocks: article.bodyBlocks
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((block) => ({
        type: block.type,
        text: block.text ?? undefined,
        mediaUrl: block.mediaUrl ?? undefined,
        filePath: block.filePath ?? undefined,
        caption: block.caption ?? undefined,
      })),
  };
}

export async function listAdminArticles(status?: ArticleStatus) {
  const articles = await prisma.article.findMany({
    where: status ? { status } : undefined,
    include: articleInclude,
    orderBy: { createdAt: "desc" },
  });
  return articles.map(toAdminArticle);
}

export async function getAdminArticle(id: string) {
  const article = await prisma.article.findUnique({
    where: { id },
    include: articleInclude,
  });
  if (!article) throw new AppError(404, "기사를 찾을 수 없습니다.");
  return toAdminArticle(article);
}

export async function createAdminArticle(input: CreateArticleInput) {
  const article = await prisma.article.create({
    data: buildArticleCreateData(input, "PENDING_REVIEW"),
    include: articleInclude,
  });
  return toAdminArticle(article);
}

export async function updateAdminArticle(
  id: string,
  input: Partial<CreateArticleInput>,
) {
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "기사를 찾을 수 없습니다.");

  const blocks = input.blocks;
  const flags = blocks ? deriveArticleFlags(blocks) : null;

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    if (blocks) {
      await tx.articleBodyBlock.deleteMany({ where: { articleId: id } });
    }

    await tx.article.update({
      where: { id },
      data: {
        title: input.title ?? existing.title,
        sectionId: input.sectionId ?? existing.sectionId,
        isVideo: flags?.isVideo ?? existing.isVideo,
        excerpt: input.excerpt ?? existing.excerpt,
        reporter: input.reporter ?? existing.reporter,
        sourceUrl: input.sourceUrl ?? existing.sourceUrl,
        bodyBlocks: blocks
          ? { create: buildBlocksCreateData(blocks as BodyBlockInput[]) }
          : undefined,
      },
    });
  });

  return getAdminArticle(id);
}

export async function approveArticle(id: string) {
  const article = await prisma.article.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
      rejectedReason: null,
    },
    include: articleInclude,
  });
  return toFrontendArticle(article);
}

export async function rejectArticle(id: string, reason: string) {
  const article = await prisma.article.update({
    where: { id },
    data: { status: "REJECTED", rejectedReason: reason },
    include: articleInclude,
  });
  return toAdminArticle(article);
}

export async function deleteArticle(id: string) {
  await prisma.article.delete({ where: { id } });
}

export async function bulkDeleteArticles(ids: string[]) {
  await prisma.article.deleteMany({ where: { id: { in: ids } } });
}

export async function getDashboardStats() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    collectedToday,
    approvedToday,
    rejectedToday,
    subscribers,
    impressions,
  ] = await Promise.all([
    prisma.article.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.article.count({
      where: { status: "PUBLISHED", updatedAt: { gte: todayStart } },
    }),
    prisma.article.count({
      where: { status: "REJECTED", updatedAt: { gte: todayStart } },
    }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.advertisement.aggregate({ _sum: { impressionCount: true } }),
  ]);

  return {
    collectedToday,
    approvedToday,
    rejectedToday,
    activeSubscribers: subscribers,
    totalAdImpressions: impressions._sum.impressionCount ?? 0,
  };
}
