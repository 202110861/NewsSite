import { Router } from 'express'
import { automationAuth } from '../../middlewares/automationAuth.middleware.js'
import * as automationService from './automation.service.js'
import { batchCreateSchema, createArticleSchema } from './automation.validation.js'

export const automationRouter = Router()

automationRouter.use(automationAuth)

automationRouter.post('/articles', async (req, res, next) => {
  try {
    const input = createArticleSchema.parse(req.body)
    const article = await automationService.createAutomationArticle(input)
    res.status(201).json(article)
  } catch (err) {
    next(err)
  }
})

automationRouter.post('/articles/batch', async (req, res, next) => {
  try {
    const { articles } = batchCreateSchema.parse(req.body)
    const created = await automationService.createAutomationArticlesBatch(articles)
    res.status(201).json({ count: created.length, articles: created })
  } catch (err) {
    next(err)
  }
})
