import { PrismaClient } from "@prisma/client";
import {
  buildBlocksCreateData,
  deriveArticleFlags,
  type BodyBlockInput,
} from "../src/modules/articles/article.mapper.js";
import { articlesById } from "./mockdata.js";
import {
  registerUploadImages,
  seedAdminUser,
  seedSections,
} from "./seed-shared.js";

const prisma = new PrismaClient();

type MockBodyBlock = string | { type: "image"; src: string; caption?: string };

interface MockArticle {
  id: string;
  title: string;
  subtitle?: string;
  section: string;
  image?: string;
  isVideo?: boolean;
  isAI?: boolean;
  videoUrl?: string;
  publishedAt: string;
  excerpt?: string;
  reporter?: string;
  body?: MockBodyBlock[];
}

function isExternalUrl(src: string) {
  return /^https?:\/\//i.test(src);
}

function basename(src: string) {
  return src.split("/").pop() ?? src;
}

function resolveMediaRef(
  src: string | undefined,
  localImages: Record<string, string>,
): { mediaUrl?: string; filePath?: string } {
  if (!src) return {};

  if (isExternalUrl(src)) {
    return { mediaUrl: src };
  }

  const name = basename(src);
  const filePath = localImages[name] ?? `images/${name}`;
  return { filePath };
}

function convertBodyBlocks(
  body: MockBodyBlock[] | undefined,
  localImages: Record<string, string>,
): BodyBlockInput[] {
  const blocks: BodyBlockInput[] = [];

  for (const block of body ?? []) {
    if (typeof block === "string") {
      if (block.trim()) blocks.push({ type: "TEXT", text: block });
      continue;
    }

    const media = resolveMediaRef(block.src, localImages);
    blocks.push({
      type: "IMAGE",
      ...media,
      caption: block.caption,
    });
  }

  return blocks;
}

function convertArticle(
  article: MockArticle,
  localImages: Record<string, string>,
) {
  const blocks: BodyBlockInput[] = [];

  if (article.isVideo && article.videoUrl) {
    blocks.push({ type: "VIDEO", mediaUrl: article.videoUrl });
  }

  blocks.push(...convertBodyBlocks(article.body, localImages));

  const flags = deriveArticleFlags(blocks);

  return {
    id: article.id,
    title: article.title,
    sectionId: article.section,
    status: "PUBLISHED" as const,
    isVideo: flags.isVideo,
    isAI: article.isAI ?? false,
    excerpt: article.excerpt ?? null,
    subtitle: article.subtitle ?? null,
    reporter: article.reporter ?? "발행인",
    publishedAt: new Date(article.publishedAt),
    bodyBlocks: {
      create: buildBlocksCreateData(blocks),
    },
  };
}

async function seedBase() {
  await seedSections(prisma);
  await seedAdminUser(prisma);
}

async function main() {
  const articles = Object.values(articlesById) as MockArticle[];

  console.log(`mockdata 기사 ${articles.length}건 변환 시작...`);

  await seedBase();
  const localImages = await registerUploadImages(prisma);

  const deleted = await prisma.article.deleteMany();
  console.log(`기존 기사 ${deleted.count}건 삭제`);

  let imported = 0;
  for (const article of articles) {
    await prisma.article.create({
      data: convertArticle(article, localImages),
    });
    imported += 1;
  }

  console.log(`기사 ${imported}건 DB에 저장 완료`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
