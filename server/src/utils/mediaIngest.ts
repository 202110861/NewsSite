import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { prisma } from "../db/client.js";
import type { BodyBlockInput } from "../modules/articles/article.mapper.js";
import { AppError } from "../middlewares/errorHandler.middleware.js";
import { uploadsRoot } from "../modules/uploads/uploads.routes.js";

const MAX_MEDIA_BYTES = 50 * 1024 * 1024;
const DOWNLOAD_TIMEOUT_MS = 30_000;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
};

function isRemoteUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function isYoutubeUrl(value: string) {
  return /youtu\.be|youtube\.com/i.test(value);
}

function normalizeUploadFilePath(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/uploads/")) {
    return trimmed.slice("/uploads/".length);
  }

  if (trimmed.startsWith("images/") || trimmed.startsWith("videos/")) {
    return trimmed;
  }

  return null;
}

function extensionFromUrl(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname).toLowerCase();
    if (/^\.(jpe?g|png|gif|webp|mp4|webm)$/.test(ext)) {
      return ext;
    }
  } catch {
    // ignore invalid URL parsing
  }
  return "";
}

function extensionFromMime(mimeType: string | null, fallbackUrl: string) {
  if (mimeType && MIME_TO_EXT[mimeType]) {
    return MIME_TO_EXT[mimeType];
  }
  return extensionFromUrl(fallbackUrl) || ".jpg";
}

async function downloadRemoteMedia(
  url: string,
  folder: "images" | "videos",
): Promise<{
  filePath: string;
  filename: string;
  mimeType: string;
  size: number;
  originalName: string;
}> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "NewsSite-Automation/1.0",
      },
    });

    if (!response.ok) {
      throw new AppError(
        400,
        `이미지 다운로드에 실패했습니다. (${response.status})`,
      );
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength === 0) {
      throw new AppError(400, "다운로드한 이미지 파일이 비어 있습니다.");
    }
    if (buffer.byteLength > MAX_MEDIA_BYTES) {
      throw new AppError(400, "이미지 파일 크기가 50MB를 초과합니다.");
    }

    const mimeType =
      response.headers.get("content-type")?.split(";")[0]?.trim() ??
      (folder === "videos" ? "video/mp4" : "image/jpeg");
    const ext = extensionFromMime(mimeType, url);
    const filename = `${randomUUID()}${ext}`;
    const destDir = path.join(uploadsRoot, folder);
    mkdirSync(destDir, { recursive: true });
    writeFileSync(path.join(destDir, filename), buffer);

    const originalName = path.basename(new URL(url).pathname) || filename;
    const filePath = `${folder}/${filename}`;
    const assetUrl = `/uploads/${filePath}`;

    await prisma.mediaAsset.create({
      data: {
        filename,
        originalName,
        mimeType,
        size: buffer.byteLength,
        url: assetUrl,
      },
    });

    return {
      filePath,
      filename,
      mimeType,
      size: buffer.byteLength,
      originalName,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new AppError(400, "이미지 다운로드 시간이 초과되었습니다.");
    }
    throw new AppError(400, "이미지 다운로드 중 오류가 발생했습니다.");
  } finally {
    clearTimeout(timeout);
  }
}

async function ingestMediaBlock(
  block: BodyBlockInput,
): Promise<BodyBlockInput> {
  if (block.type === "TEXT") return block;
  if (block.filePath) {
    return {
      ...block,
      mediaUrl: undefined,
    };
  }

  const mediaUrl = block.mediaUrl?.trim();
  if (!mediaUrl) return block;

  const existingFilePath = normalizeUploadFilePath(mediaUrl);
  if (existingFilePath) {
    return {
      ...block,
      mediaUrl: undefined,
      filePath: existingFilePath,
    };
  }

  if (block.type === "VIDEO" && isYoutubeUrl(mediaUrl)) {
    return block;
  }

  if (!isRemoteUrl(mediaUrl)) {
    return block;
  }

  const folder = block.type === "VIDEO" ? "videos" : "images";
  const saved = await downloadRemoteMedia(mediaUrl, folder);

  return {
    ...block,
    mediaUrl: undefined,
    filePath: saved.filePath,
  };
}

export async function ingestArticleBlocks(
  blocks: BodyBlockInput[] = [],
): Promise<BodyBlockInput[]> {
  const ingested: BodyBlockInput[] = [];

  for (const block of blocks) {
    ingested.push(await ingestMediaBlock(block));
  }

  return ingested;
}
