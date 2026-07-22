import { Router } from "express";
import {
  authMiddleware,
  type AuthRequest,
} from "../../middlewares/auth.middleware.js";
import { optionalAuthMiddleware } from "../../middlewares/optionalAuth.middleware.js";
import * as engagementService from "./engagement.service.js";
import { createCommentSchema, updateCommentSchema } from "./engagement.validation.js";

export const engagementRouter = Router({ mergeParams: true });

function getArticleId(req: AuthRequest): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0]! : id;
}

engagementRouter.get(
  "/likes",
  optionalAuthMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      const status = await engagementService.getLikeStatus(
        getArticleId(req),
        req.user?.id,
      );
      res.json(status);
    } catch (err) {
      next(err);
    }
  },
);

engagementRouter.post(
  "/likes",
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      const status = await engagementService.toggleLike(
        getArticleId(req),
        req.user!.id,
      );
      res.json(status);
    } catch (err) {
      next(err);
    }
  },
);

engagementRouter.get("/comments", async (req: AuthRequest, res, next) => {
  try {
    const comments = await engagementService.listComments(getArticleId(req));
    res.json(comments);
  } catch (err) {
    next(err);
  }
});

engagementRouter.post(
  "/comments",
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      const { body } = createCommentSchema.parse(req.body);
      const comment = await engagementService.createComment(
        getArticleId(req),
        req.user!.id,
        body,
      );
      res.status(201).json(comment);
    } catch (err) {
      next(err);
    }
  },
);

engagementRouter.patch(
  "/comments/:commentId",
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      const commentId = Array.isArray(req.params.commentId)
        ? req.params.commentId[0]!
        : req.params.commentId;
      const { body } = updateCommentSchema.parse(req.body);
      const comment = await engagementService.updateComment(
        getArticleId(req),
        commentId,
        req.user!.id,
        body,
      );
      res.json(comment);
    } catch (err) {
      next(err);
    }
  },
);

engagementRouter.delete(
  "/comments/:commentId",
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      const commentId = Array.isArray(req.params.commentId)
        ? req.params.commentId[0]!
        : req.params.commentId;
      const result = await engagementService.deleteComment(
        getArticleId(req),
        commentId,
        req.user!.id,
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);
