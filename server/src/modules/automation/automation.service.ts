import { prisma } from "../../db/client.js";
import { ingestArticleBlocks } from "../../utils/mediaIngest.js";
import {
  buildArticleCreateData,
  type CreateArticleInput,
} from "../articles/article.mapper.js";

export async function createAutomationArticle(input: CreateArticleInput) {
  const blocks = await ingestArticleBlocks(input.blocks);
  return prisma.article.create({
    data: buildArticleCreateData({ ...input, blocks }, "PENDING_REVIEW"),
    include: { section: true, bodyBlocks: true },
  });
}

export async function createAutomationArticlesBatch(
  inputs: CreateArticleInput[],
) {
  const results = [];
  for (const input of inputs) {
    results.push(await createAutomationArticle(input));
  }
  return results;
}
