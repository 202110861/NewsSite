import { existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/password.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsImagesDir = path.resolve(__dirname, "../uploads/images");

export const sections = [
  { id: "politics", label: "정치" },
  { id: "economy", label: "경제" },
  { id: "society", label: "사회" },
  { id: "culture", label: "문화/전시" },
  { id: "entertainment", label: "연예/스포츠" },
  { id: "local", label: "지역뉴스" },
  { id: "video", label: "영상뉴스" },
  { id: "cardNews", label: "카드뉴스" },
  { id: "publisher", label: "발행인칼럼" },
  // { id: "shorts", label: "숏컷뉴스" },
];

export async function seedSections(prisma: PrismaClient) {
  for (const section of sections) {
    await prisma.section.upsert({
      where: { id: section.id },
      update: { label: section.label },
      create: section,
    });
  }
}

export async function seedAdminUser(prisma: PrismaClient) {
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

/** uploads/images에 이미 있는 파일을 MediaAsset으로 등록 */
export async function registerUploadImages(
  prisma: PrismaClient,
): Promise<Record<string, string>> {
  mkdirSync(uploadsImagesDir, { recursive: true });
  const registered: Record<string, string> = {};

  if (!existsSync(uploadsImagesDir)) {
    return registered;
  }

  const files = readdirSync(uploadsImagesDir).filter((name) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(name),
  );

  for (const originalName of files) {
    const filePath = `images/${originalName}`;
    const url = `/uploads/${filePath}`;

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

    registered[originalName] = filePath;
  }

  return registered;
}
