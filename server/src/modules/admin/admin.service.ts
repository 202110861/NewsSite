import type { Prisma } from "@prisma/client";
import { prisma } from "../../db/client.js";
import { AppError } from "../../middlewares/errorHandler.middleware.js";
import {
  articleInclude,
  buildArticleCreateData,
  buildBlocksCreateData,
  deriveArticleFlags,
  toFrontendArticle,
  type ArticleStatus,
  type BodyBlockInput,
  type CreateArticleInput,
} from "../articles/article.mapper.js";
import {
  publishArticlePage,
  unpublishArticlePage,
} from "../../services/articlePagePublisher.js";
import { publishSitemap } from "../../services/sitemapPublisher.js";
import {
  adminCreateArticleSchema,
  adminUpdateArticleSchema,
  bulkDeleteSchema,
  rejectSchema,
} from "../articles/article.validation.js";

export type { ArticleStatus };
export {
  adminCreateArticleSchema as createArticleSchema,
  adminUpdateArticleSchema as updateArticleSchema,
  bulkDeleteSchema,
  rejectSchema,
};

async function syncPublishedArticlePage(
  article: Prisma.ArticleGetPayload<{ include: typeof articleInclude }>,
): Promise<void> {
  try {
    await publishArticlePage(toFrontendArticle(article));
  } catch (err) {
    console.error(
      `[articlePagePublisher] article ${article.id} S3 동기화 실패:`,
      err,
    );
  }
}

async function syncSitemap(): Promise<void> {
  try {
    await publishSitemap();
  } catch (err) {
    console.error("[sitemapPublisher] sitemap 동기화 실패:", err);
  }
}

function toAdminArticle(
  article: Prisma.ArticleGetPayload<{ include: typeof articleInclude }>,
) {
  return {
    id: article.id,
    title: article.title,
    sectionId: article.sectionId,
    status: article.status,
    excerpt: article.excerpt,
    subtitle: article.subtitle,
    reporter: article.reporter,
    isAI: article.isAI,
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
        isAI: input.isAI ?? existing.isAI,
        excerpt:
          input.excerpt !== undefined
            ? input.excerpt || null
            : existing.excerpt,
        subtitle:
          input.subtitle !== undefined
            ? input.subtitle || null
            : existing.subtitle,
        reporter: input.reporter ?? existing.reporter,
        sourceUrl: input.sourceUrl ?? existing.sourceUrl,
        bodyBlocks: blocks
          ? { create: buildBlocksCreateData(blocks as BodyBlockInput[]) }
          : undefined,
      },
    });
  });

  const updated = await prisma.article.findUnique({
    where: { id },
    include: articleInclude,
  });
  if (!updated) throw new AppError(404, "기사를 찾을 수 없습니다.");

  if (updated.status === "PUBLISHED") {
    await syncPublishedArticlePage(updated);
    await syncSitemap();
  }

  return toAdminArticle(updated);
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

  await syncPublishedArticlePage(article);
  await syncSitemap();
  return toFrontendArticle(article);
}

export async function rejectArticle(id: string, reason: string) {
  const article = await prisma.article.update({
    where: { id },
    data: { status: "REJECTED", rejectedReason: reason },
    include: articleInclude,
  });

  try {
    await unpublishArticlePage(id);
  } catch (err) {
    console.error(
      `[articlePagePublisher] article ${id} S3 삭제 실패:`,
      err,
    );
  }
  await syncSitemap();
  return toAdminArticle(article);
}

export async function deleteArticle(id: string) {
  await prisma.article.delete({ where: { id } });
  try {
    await unpublishArticlePage(id);
  } catch (err) {
    console.error(
      `[articlePagePublisher] article ${id} S3 삭제 실패:`,
      err,
    );
  }
  await syncSitemap();
}

export async function bulkDeleteArticles(ids: string[]) {
  await prisma.article.deleteMany({ where: { id: { in: ids } } });
  await Promise.all(
    ids.map(async (id) => {
      try {
        await unpublishArticlePage(id);
      } catch (err) {
        console.error(
          `[articlePagePublisher] article ${id} S3 삭제 실패:`,
          err,
        );
      }
    }),
  );
  await syncSitemap();
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
