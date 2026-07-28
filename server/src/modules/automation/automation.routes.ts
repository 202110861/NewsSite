import { randomUUID } from "node:crypto";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import type { Request } from "express";
import { env } from "../../config/env.js";
import { prisma } from "../../db/client.js";
import { AppError } from "../../middlewares/errorHandler.middleware.js";
import { automationAuth } from "../../middlewares/automationAuth.middleware.js";
import { uploadsRoot } from "../uploads/uploads.routes.js";
import * as automationService from "./automation.service.js";
import {
  batchCreateSchema,
  createArticleSchema,
} from "./automation.validation.js";

export const automationRouter = Router();

automationRouter.use(automationAuth);

const imageDir = path.join(uploadsRoot, "images");

const coverUpload = multer({
  storage: multer.diskStorage({
    destination(_req, _file, cb) {
      cb(null, imageDir);
    },
    filename(_req, file, cb) {
      const ext = path.extname(file.originalname) || ".jpg";
      cb(null, `${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
      return;
    }
    cb(new AppError(400, "커버 이미지는 이미지 파일만 업로드할 수 있습니다."));
  },
});

function resolvePublicUploadUrl(req: Request, filePath: string): string {
  const configured = env.API_PUBLIC_URL?.replace(/\/$/, "");
  if (configured) {
    return `${configured}/uploads/${filePath}`;
  }

  const host = req.get("host");
  if (!host) {
    return `/uploads/${filePath}`;
  }

  const protocol =
    (req.get("x-forwarded-proto")?.split(",")[0]?.trim() || req.protocol) ??
    "http";
  return `${protocol}://${host}/uploads/${filePath}`;
}

/**
 * 커버 이미지 1장 업로드.
 * 응답 mediaUrl/url 을 기사 등록 blocks[].mediaUrl 에 넣어 사용한다.
 * 순서: 업로드 → URL 확보 → POST /articles
 */
automationRouter.post(
  "/uploads",
  coverUpload.single("file"),
  async (req, res, next) => {
    try {
      const file = req.file;
      if (!file) throw new AppError(400, "파일이 없습니다.");

      const filePath = `images/${file.filename}`;
      const publicUrl = resolvePublicUploadUrl(req, filePath);
      const relativeUrl = `/uploads/${filePath}`;

      const asset = await prisma.mediaAsset.create({
        data: {
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: relativeUrl,
        },
      });

      res.status(201).json({
        id: asset.id,
        filePath,
        url: publicUrl,
        mediaUrl: publicUrl,
        mimeType: file.mimetype,
        originalName: file.originalname,
      });
    } catch (err) {
      next(err);
    }
  },
);

automationRouter.post("/articles", async (req, res, next) => {
  try {
    const input = createArticleSchema.parse(req.body);
    const article = await automationService.createAutomationArticle(input);
    res.status(201).json(article);
  } catch (err) {
    next(err);
  }
});

automationRouter.post("/articles/batch", async (req, res, next) => {
  try {
    const { articles } = batchCreateSchema.parse(req.body);
    const created =
      await automationService.createAutomationArticlesBatch(articles);
    res.status(201).json({ count: created.length, articles: created });
  } catch (err) {
    next(err);
  }
});
