import { Router } from 'express'
import {
  handlePortOneWebhook,
  portoneWebhookSchema,
} from '../subscriptions/subscriptions.service.js'

export const paymentsRouter = Router()

paymentsRouter.post('/webhook', async (req, res, next) => {
  try {
    console.log('[webhook] raw body:', req.body)
    const parsed = portoneWebhookSchema.safeParse(req.body)
    if (!parsed.success) {
      // PortOne 호출 테스트 등 비표준 페이로드도 수신 확인용으로 200
      res.json({ ok: true, received: true })
      return
    }
    const result = await handlePortOneWebhook(parsed.data)
    res.json(result)
  } catch (err) {
    next(err)
  }
})
