import { z } from "zod";

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
  blocks: z.array(bodyBlockSchema).optional(),
});

export const batchCreateSchema = z.object({
  articles: z.array(createArticleSchema).min(1),
});
