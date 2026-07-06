import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from './config/env.js'
import { errorHandler } from './middlewares/errorHandler.middleware.js'
import { authRouter, usersRouter } from './modules/auth/auth.routes.js'
import { articlesRouter } from './modules/articles/articles.routes.js'
import { automationRouter } from './modules/automation/automation.routes.js'
import { adminArticlesRouter, adminStatsRouter } from './modules/admin/admin.routes.js'
import { subscriptionsRouter } from './modules/subscriptions/subscriptions.routes.js'
import { paymentsRouter } from './modules/payments/payments.routes.js'
import { adsRouter, adminAdsRouter } from './modules/ads/ads.routes.js'
import { sectionsRouter } from './modules/sections/sections.routes.js'

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    }),
  )
  app.use(express.json())
  app.use(cookieParser())

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.use('/api/auth', authRouter)
  app.use('/api/users', usersRouter)
  app.use('/api/articles', articlesRouter)
  app.use('/api/sections', sectionsRouter)
  app.use('/api/automation', automationRouter)
  app.use('/api/admin/articles', adminArticlesRouter)
  app.use('/api/admin/stats', adminStatsRouter)
  app.use('/api/admin/ads', adminAdsRouter)
  app.use('/api/subscriptions', subscriptionsRouter)
  app.use('/api/payments', paymentsRouter)
  app.use('/api/ads', adsRouter)

  app.use(errorHandler)
  return app
}
