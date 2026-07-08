import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/password.js";
import {
  deriveArticleFlags,
  type BodyBlockInput,
} from "../src/modules/articles/article.mapper.js";
import { articlesById } from "./mockdata.js";

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsImagesDir = path.resolve(__dirname, "../uploads/images");
const frontendImagesDir = path.resolve(__dirname, "../../version-4/src/images");

type MockBodyBlock = string | { type: "image"; src: string; caption?: string };

interface MockArticle {
  id: string;
  title: string;
  subtitle?: string;
  section: string;
  image?: string;
  isVideo?: boolean;
  videoUrl?: string;
  publishedAt: string;
  excerpt?: string;
  reporter?: string;
  body?: MockBodyBlock[];
}

const sections = [
  { id: "politics", label: "정치" },
  { id: "economy", label: "경제" },
  { id: "society", label: "사회" },
  { id: "culture", label: "문화/전시" },
  { id: "entertainment", label: "연예/스포츠" },
  { id: "local", label: "지역뉴스" },
  { id: "event", label: "이벤트/행사" },
  { id: "video", label: "영상뉴스" },
  { id: "cardNews", label: "카드뉴스" },
  { id: "shorts", label: "숏컷뉴스" },
];

function isExternalUrl(src: string) {
  return /^https?:\/\//i.test(src);
}

function basename(src: string) {
  return src.split("/").pop() ?? src;
}

async function copyLocalImages() {
  mkdirSync(uploadsImagesDir, { recursive: true });
  const filePathByName: Record<string, string> = {};

  if (!existsSync(frontendImagesDir)) {
    console.warn("프론트 이미지 폴더를 찾지 못했습니다.");
    return filePathByName;
  }

  const files = readdirSync(frontendImagesDir).filter((name) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(name),
  );

  for (const originalName of files) {
    const sourcePath = path.join(frontendImagesDir, originalName);
    const destPath = path.join(uploadsImagesDir, originalName);
    copyFileSync(sourcePath, destPath);

    const filePath = `images/${originalName}`;
    const url = `/uploads/${filePath}`;
    filePathByName[originalName] = filePath;

    await prisma.mediaAsset.upsert({
      where: { id: originalName },
      update: {
        url,
        filename: originalName,
        originalName,
        mimeType: "image/jpeg",
        size: 0,
      },
      create: {
        id: originalName,
        filename: originalName,
        originalName,
        mimeType: "image/jpeg",
        size: 0,
        url,
      },
    });
  }

  return filePathByName;
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
    excerpt: article.excerpt ?? article.subtitle,
    reporter: article.reporter ?? "발행인",
    publishedAt: new Date(article.publishedAt),
    bodyBlocks: {
      create: blocks.map((block, index) => ({
        type: block.type,
        sortOrder: index,
        text: block.type === "TEXT" ? (block.text ?? "") : null,
        mediaUrl: block.type !== "TEXT" ? (block.mediaUrl ?? null) : null,
        filePath: block.type !== "TEXT" ? (block.filePath ?? null) : null,
        caption: block.caption ?? null,
      })),
    },
  };
}

async function seedBase() {
  for (const section of sections) {
    await prisma.section.upsert({
      where: { id: section.id },
      update: { label: section.label },
      create: section,
    });
  }

  const adminHash = await hashPassword("Songdo94!");
  await prisma.user.upsert({
    where: { username: "lawform0511" },
    update: { passwordHash: adminHash, role: "ADMIN" },
    create: {
      username: "lawform0511",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });
}

async function main() {
  const articles = Object.values(articlesById) as MockArticle[];

  console.log(`mockdata 기사 ${articles.length}건 변환 시작...`);

  await seedBase();
  const localImages = await copyLocalImages();

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
