import { Router } from 'express'
import {
  handlePaymentWebhook,
  verifyWebhookSignature,
  webhookSchema,
} from '../subscriptions/subscriptions.service.js'

export const paymentsRouter = Router()

paymentsRouter.post('/webhook', async (req, res, next) => {
  try {
    const payload = webhookSchema.parse(req.body)
    if (!verifyWebhookSignature(payload.signature)) {
      res.status(401).json({ message: '유효하지 않은 웹훅 서명입니다.' })
      return
    }
    const result = await handlePaymentWebhook(payload)
    res.json(result)
  } catch (err) {
    next(err)
  }
})
