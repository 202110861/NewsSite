import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Router } from "express";
import multer from "multer";
import { prisma } from "../../db/client.js";
import { adminOnly } from "../../middlewares/adminOnly.middleware.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { AppError } from "../../middlewares/errorHandler.middleware.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsRoot = path.resolve(__dirname, "../../../uploads");

const imageDir = path.join(uploadsRoot, "images");
const videoDir = path.join(uploadsRoot, "videos");
mkdirSync(imageDir, { recursive: true });
mkdirSync(videoDir, { recursive: true });

const storage = multer.diskStorage({
  destination(_req, file, cb) {
    if (file.mimetype.startsWith("video/")) {
      cb(null, videoDir);
      return;
    }
    cb(null, imageDir);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname) || "";
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
      return;
    }
    cb(new AppError(400, "이미지 또는 동영상 파일만 업로드할 수 있습니다."));
  },
});

export const uploadsRouter = Router();
uploadsRouter.use(authMiddleware, adminOnly);

uploadsRouter.post("/", upload.single("file"), async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) throw new AppError(400, "파일이 없습니다.");

    const folder = file.mimetype.startsWith("video/") ? "videos" : "images";
    const filePath = `${folder}/${file.filename}`;
    const url = `/uploads/${filePath}`;

    const asset = await prisma.mediaAsset.create({
      data: {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url,
      },
    });

    res.status(201).json({
      id: asset.id,
      filePath,
      url,
      mimeType: file.mimetype,
      originalName: file.originalname,
    });
  } catch (err) {
    next(err);
  }
});
