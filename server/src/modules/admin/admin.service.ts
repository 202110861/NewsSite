import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { prisma } from '../../db/client.js'
import { AppError } from '../../middlewares/errorHandler.middleware.js'
import {
  articleInclude,
  toFrontendArticle,
  type CreateArticleInput,
} from '../articles/article.mapper.js'

export type ArticleStatus = 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED'

export async function listAdminArticles(status?: ArticleStatus) {
  return prisma.article.findMany({
    where: status ? { status } : undefined,
    include: articleInclude,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getAdminArticle(id: string) {
  const article = await prisma.article.findUnique({
    where: { id },
    include: articleInclude,
  })
  if (!article) throw new AppError(404, '기사를 찾을 수 없습니다.')
  return article
}

export async function updateAdminArticle(id: string, input: Partial<CreateArticleInput>) {
  const existing = await prisma.article.findUnique({ where: { id } })
  if (!existing) throw new AppError(404, '기사를 찾을 수 없습니다.')

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.articleParagraph.deleteMany({
      where: { section: { articleId: id } },
    })
    await tx.articleBodySection.deleteMany({ where: { articleId: id } })
    await tx.articleImage.deleteMany({ where: { articleId: id } })

    await tx.article.update({
      where: { id },
      data: {
        title: input.title ?? existing.title,
        sectionId: input.sectionId ?? existing.sectionId,
        thumbnailUrl: input.thumbnailUrl ?? existing.thumbnailUrl,
        isVideo: input.isVideo ?? existing.isVideo,
        excerpt: input.excerpt ?? existing.excerpt,
        reporter: input.reporter ?? existing.reporter,
        sourceUrl: input.sourceUrl ?? existing.sourceUrl,
        bodySections: input.body
          ? {
              create: input.body.map((section, sectionIndex) => ({
                heading: section.heading,
                sortOrder: sectionIndex,
                paragraphs: {
                  create: section.paragraphs.map((content, paragraphIndex) => ({
                    content,
                    sortOrder: paragraphIndex,
                  })),
                },
              })),
            }
          : undefined,
        images: input.images
          ? {
              create: input.images.map((image, index) => ({
                url: image.url,
                caption: image.caption,
                sortOrder: index,
              })),
            }
          : undefined,
      },
    })
  })

  return getAdminArticle(id)
}

export async function approveArticle(id: string) {
  const article = await prisma.article.update({
    where: { id },
    data: { status: 'PUBLISHED', publishedAt: new Date(), rejectedReason: null },
    include: articleInclude,
  })
  return toFrontendArticle(article)
}

export async function rejectArticle(id: string, reason: string) {
  return prisma.article.update({
    where: { id },
    data: { status: 'REJECTED', rejectedReason: reason },
    include: articleInclude,
  })
}

export async function deleteArticle(id: string) {
  await prisma.article.delete({ where: { id } })
}

export async function getDashboardStats() {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [collectedToday, approvedToday, rejectedToday, subscribers, impressions] =
    await Promise.all([
      prisma.article.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.article.count({
        where: { status: 'PUBLISHED', updatedAt: { gte: todayStart } },
      }),
      prisma.article.count({
        where: { status: 'REJECTED', updatedAt: { gte: todayStart } },
      }),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.advertisement.aggregate({ _sum: { impressionCount: true } }),
    ])

  return {
    collectedToday,
    approvedToday,
    rejectedToday,
    activeSubscribers: subscribers,
    totalAdImpressions: impressions._sum.impressionCount ?? 0,
  }
}

export const updateArticleSchema = z.object({
  title: z.string().min(1).optional(),
  sectionId: z.string().min(1).optional(),
  thumbnailUrl: z.string().url().optional(),
  isVideo: z.boolean().optional(),
  excerpt: z.string().optional(),
  reporter: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  body: z
    .array(
      z.object({
        heading: z.string().optional(),
        paragraphs: z.array(z.string().min(1)).min(1),
      }),
    )
    .optional(),
  images: z
    .array(z.object({ url: z.string().url(), caption: z.string().optional() }))
    .optional(),
})

export const rejectSchema = z.object({ reason: z.string().min(1) })
