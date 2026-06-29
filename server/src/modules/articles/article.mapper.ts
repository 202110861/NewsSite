type ArticleStatus = 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED'

interface ArticleParagraphRow {
  content: string
  sortOrder: number
}

interface ArticleBodySectionRow {
  heading: string | null
  sortOrder: number
  paragraphs: ArticleParagraphRow[]
}

interface ArticleImageRow {
  url: string
  caption: string | null
  sortOrder: number
}

interface ArticleRow {
  id: string
  title: string
  sectionId: string
  thumbnailUrl: string | null
  isVideo: boolean
  excerpt: string | null
  reporter: string
  viewCount: number
  publishedAt: Date | null
  createdAt: Date
  bodySections: ArticleBodySectionRow[]
  images: ArticleImageRow[]
}

export interface FrontendArticle {
  id: string
  title: string
  section: string
  image?: string
  isVideo?: boolean
  publishedAt: string
  excerpt?: string
  body?: Array<string | { type: 'image'; src: string; caption?: string }>
  reporter?: string
  viewCount?: number
}

export function toFrontendArticle(article: ArticleRow): FrontendArticle {
  const body: FrontendArticle['body'] = []

  for (const section of article.bodySections.sort((a, b) => a.sortOrder - b.sortOrder)) {
    for (const paragraph of section.paragraphs.sort((a, b) => a.sortOrder - b.sortOrder)) {
      body.push(paragraph.content)
    }
  }

  for (const image of article.images.sort((a, b) => a.sortOrder - b.sortOrder)) {
    body.push({ type: 'image', src: image.url, caption: image.caption ?? undefined })
  }

  return {
    id: article.id,
    title: article.title,
    section: article.sectionId,
    image: article.thumbnailUrl ?? undefined,
    isVideo: article.isVideo,
    publishedAt: (article.publishedAt ?? article.createdAt).toISOString(),
    excerpt: article.excerpt ?? undefined,
    body: body.length > 0 ? body : undefined,
    reporter: article.reporter,
    viewCount: article.viewCount,
  }
}

export const articleInclude = {
  bodySections: { include: { paragraphs: true } },
  images: true,
} as const

export interface CreateArticleInput {
  title: string
  sectionId: string
  thumbnailUrl?: string
  isVideo?: boolean
  excerpt?: string
  reporter?: string
  sourceUrl?: string
  body?: Array<{ heading?: string; paragraphs: string[] }>
  images?: Array<{ url: string; caption?: string }>
}

export function buildArticleCreateData(input: CreateArticleInput, status: ArticleStatus = 'PENDING_REVIEW') {
  return {
    title: input.title,
    sectionId: input.sectionId,
    status,
    thumbnailUrl: input.thumbnailUrl,
    isVideo: input.isVideo ?? false,
    excerpt: input.excerpt,
    reporter: input.reporter ?? '발행인',
    sourceUrl: input.sourceUrl,
    publishedAt: status === 'PUBLISHED' ? new Date() : undefined,
    bodySections: {
      create: (input.body ?? []).map((section, sectionIndex) => ({
        heading: section.heading,
        sortOrder: sectionIndex,
        paragraphs: {
          create: section.paragraphs.map((content, paragraphIndex) => ({
            content,
            sortOrder: paragraphIndex,
          })),
        },
      })),
    },
    images: {
      create: (input.images ?? []).map((image, index) => ({
        url: image.url,
        caption: image.caption,
        sortOrder: index,
      })),
    },
  }
}

export type { ArticleStatus }
