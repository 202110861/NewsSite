import { z } from 'zod'

const bodySectionSchema = z.object({
  heading: z.string().optional(),
  paragraphs: z.array(z.string().min(1)).min(1),
})

const imageSchema = z.object({
  url: z.string().url(),
  caption: z.string().optional(),
})

export const createArticleSchema = z.object({
  title: z.string().min(1),
  sectionId: z.string().min(1),
  thumbnailUrl: z.string().url().optional(),
  isVideo: z.boolean().optional(),
  excerpt: z.string().optional(),
  reporter: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  body: z.array(bodySectionSchema).optional(),
  images: z.array(imageSchema).optional(),
})

export const batchCreateSchema = z.object({
  articles: z.array(createArticleSchema).min(1),
})
