import { z } from "zod";

export const bodyBlockSchema = z.object({
  type: z.enum(["TEXT", "IMAGE", "VIDEO"]),
  text: z.string().optional(),
  mediaUrl: z.string().optional(),
  filePath: z.string().optional(),
  caption: z.string().optional(),
});

const articleBaseFields = {
  title: z.string().min(1),
  sectionId: z.string().min(1),
  excerpt: z.string().optional(),
  subtitle: z.string().optional(),
  reporter: z.string().optional(),
  sourceUrl: z.string().optional(),
  isAI: z.boolean().optional(),
};

export const adminCreateArticleSchema = z.object({
  ...articleBaseFields,
  blocks: z.array(bodyBlockSchema).min(1),
});

export const adminUpdateArticleSchema = z.object({
  title: z.string().min(1).optional(),
  sectionId: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  subtitle: z.string().optional(),
  reporter: z.string().optional(),
  sourceUrl: z.string().optional(),
  isAI: z.boolean().optional(),
  blocks: z.array(bodyBlockSchema).optional(),
});

export const automationCreateArticleSchema = z.object({
  ...articleBaseFields,
  blocks: z.array(bodyBlockSchema).optional(),
});

export const batchCreateSchema = z.object({
  articles: z.array(automationCreateArticleSchema).min(1),
});

export const rejectSchema = z.object({ reason: z.string().min(1) });

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});
