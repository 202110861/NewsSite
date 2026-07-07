import { prisma } from "../../db/client.js";
import {
  buildArticleCreateData,
  type CreateArticleInput,
} from "../articles/article.mapper.js";

export async function createAutomationArticle(input: CreateArticleInput) {
  return prisma.article.create({
    data: buildArticleCreateData(input, "PENDING_REVIEW"),
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
