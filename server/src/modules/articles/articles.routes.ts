import { Router } from "express";
import { engagementRouter } from "../engagement/engagement.routes.js";
import * as articlesService from "./articles.service.js";

export const articlesRouter = Router();

articlesRouter.get("/", async (req, res, next) => {
  try {
    const sectionId =
      typeof req.query.sectionId === "string" ? req.query.sectionId : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const articles = await articlesService.listPublishedArticles({
      sectionId,
      limit,
    });
    res.json(articles);
  } catch (err) {
    next(err);
  }
});

articlesRouter.get("/search", async (req, res, next) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q : "";
    const articles = await articlesService.searchPublishedArticles(q);
    res.json(articles);
  } catch (err) {
    next(err);
  }
});

articlesRouter.use("/:id", engagementRouter);

articlesRouter.get("/:id", async (req, res, next) => {
  try {
    const article = await articlesService.getPublishedArticle(req.params.id);
    res.json(article);
  } catch (err) {
    next(err);
  }
});
