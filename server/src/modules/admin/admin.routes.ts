import { Router } from "express";
import { adminOnly } from "../../middlewares/adminOnly.middleware.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import * as adminService from "./admin.service.js";

export const adminArticlesRouter = Router();
adminArticlesRouter.use(authMiddleware, adminOnly);

adminArticlesRouter.get("/", async (req, res, next) => {
  try {
    const status = req.query.status as adminService.ArticleStatus | undefined;
    const articles = await adminService.listAdminArticles(status);
    res.json(articles);
  } catch (err) {
    next(err);
  }
});

adminArticlesRouter.post("/", async (req, res, next) => {
  try {
    const input = adminService.createArticleSchema.parse(req.body);
    const article = await adminService.createAdminArticle(input);
    res.status(201).json(article);
  } catch (err) {
    next(err);
  }
});

adminArticlesRouter.post("/bulk-delete", async (req, res, next) => {
  try {
    const { ids } = adminService.bulkDeleteSchema.parse(req.body);
    await adminService.bulkDeleteArticles(ids);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

adminArticlesRouter.get("/:id", async (req, res, next) => {
  try {
    const article = await adminService.getAdminArticle(req.params.id);
    res.json(article);
  } catch (err) {
    next(err);
  }
});

adminArticlesRouter.patch("/:id", async (req, res, next) => {
  try {
    const input = adminService.updateArticleSchema.parse(req.body);
    const article = await adminService.updateAdminArticle(req.params.id, input);
    res.json(article);
  } catch (err) {
    next(err);
  }
});

adminArticlesRouter.patch("/:id/approve", async (req, res, next) => {
  try {
    const article = await adminService.approveArticle(req.params.id);
    res.json(article);
  } catch (err) {
    next(err);
  }
});

adminArticlesRouter.patch("/:id/reject", async (req, res, next) => {
  try {
    const { reason } = adminService.rejectSchema.parse(req.body);
    const article = await adminService.rejectArticle(req.params.id, reason);
    res.json(article);
  } catch (err) {
    next(err);
  }
});

adminArticlesRouter.delete("/:id", async (req, res, next) => {
  try {
    await adminService.deleteArticle(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export const adminStatsRouter = Router();
adminStatsRouter.use(authMiddleware, adminOnly);

adminStatsRouter.get("/dashboard", async (_req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});
