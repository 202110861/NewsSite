import { Router } from 'express'
import { authMiddleware, type AuthRequest } from '../../middlewares/auth.middleware.js'
import * as subscriptionsService from './subscriptions.service.js'
import {
  callbackSchema,
  completePaymentSchema,
  startSubscriptionSchema,
} from './subscriptions.service.js'

export const subscriptionsRouter = Router()

subscriptionsRouter.get('/plans', async (_req, res, next) => {
  try {
    const plans = await subscriptionsService.listPlans()
    res.json(plans)
  } catch (err) {
    next(err)
  }
})

subscriptionsRouter.post('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { planId, phoneNumber } = startSubscriptionSchema.parse(req.body)
    const result = await subscriptionsService.startSubscription(
      req.user!.id,
      planId,
      phoneNumber,
    )
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
})

subscriptionsRouter.post(
  '/complete',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      const { impUid, merchantUid } = completePaymentSchema.parse(req.body)
      const subscription = await subscriptionsService.completeSubscriptionPayment(
        req.user!.id,
        impUid,
        merchantUid,
      )
      res.json(subscription)
    } catch (err) {
      next(err)
    }
  },
)

/** Mock OTP 콜백 (PortOne 미설정 환경용) */
subscriptionsRouter.post('/callback', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { paymentId, authCode } = callbackSchema.parse(req.body)
    const subscription = await subscriptionsService.completeSubscriptionCallback(
      paymentId,
      authCode,
    )
    res.json(subscription)
  } catch (err) {
    next(err)
  }
})

subscriptionsRouter.get('/me', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const subscription = await subscriptionsService.getMySubscription(req.user!.id)
    res.json(subscription)
  } catch (err) {
    next(err)
  }
})

subscriptionsRouter.patch('/me/cancel', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const subscription = await subscriptionsService.cancelMySubscription(req.user!.id)
    res.json(subscription)
  } catch (err) {
    next(err)
  }
})
