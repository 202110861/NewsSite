import { prisma } from "../../db/client.js";
import { AppError } from "../../middlewares/errorHandler.middleware.js";
import { articleInclude, toFrontendArticle } from "./article.mapper.js";

export async function listPublishedArticles(params?: {
  sectionId?: string;
  limit?: number;
  page?: number;
}) {
  const where = {
    status: "PUBLISHED" as const,
    ...(params?.sectionId ? { sectionId: params.sectionId } : {}),
  };
  const limit = Math.min(Math.max(params?.limit ?? 100, 1), 100);

  if (params?.page != null) {
    const page = Math.max(params.page, 1);
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: articleInclude,
        orderBy: { publishedAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.article.count({ where }),
    ]);

    return {
      articles: articles.map(toFrontendArticle),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  const articles = await prisma.article.findMany({
    where,
    include: articleInclude,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return articles.map(toFrontendArticle);
}

export async function searchPublishedArticles(query: string) {
  const q = query.trim();
  if (!q) return [];

  const articles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
        {
          bodyBlocks: {
            some: {
              type: "TEXT",
              text: { contains: q, mode: "insensitive" },
            },
          },
        },
      ],
    },
    include: articleInclude,
    orderBy: { publishedAt: "desc" },
    take: 100,
  });

  return articles.map(toFrontendArticle);
}

export async function getPublishedArticle(id: string) {
  const article = await prisma.article.findFirst({
    where: { id, status: "PUBLISHED" },
    include: articleInclude,
  });
  if (!article) throw new AppError(404, "기사를 찾을 수 없습니다.");

  await prisma.article.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  return toFrontendArticle({ ...article, viewCount: article.viewCount + 1 });
}
