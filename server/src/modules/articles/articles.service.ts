import { prisma } from '../../db/client.js'
import { AppError } from '../../middlewares/errorHandler.middleware.js'
import { articleInclude, toFrontendArticle } from './article.mapper.js'

export async function listPublishedArticles(params?: { sectionId?: string; limit?: number }) {
  const articles = await prisma.article.findMany({
    where: {
      status: 'PUBLISHED',
      ...(params?.sectionId ? { sectionId: params.sectionId } : {}),
    },
    include: articleInclude,
    orderBy: { publishedAt: 'desc' },
    take: params?.limit ?? 100,
  })
  return articles.map(toFrontendArticle)
}

export async function getPublishedArticle(id: string) {
  const article = await prisma.article.findFirst({
    where: { id, status: 'PUBLISHED' },
    include: articleInclude,
  })
  if (!article) throw new AppError(404, '기사를 찾을 수 없습니다.')

  await prisma.article.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  })

  return toFrontendArticle({ ...article, viewCount: article.viewCount + 1 })
}
