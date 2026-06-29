import { z } from 'zod'
import { prisma } from '../../db/client.js'
import { AppError } from '../../middlewares/errorHandler.middleware.js'
import { paymentGateway } from '../payments/payment.gateway.js'

export async function listPlans() {
  return prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { amount: 'asc' },
  })
}

export async function startSubscription(userId: string, planId: string, phoneNumber: string) {
  const plan = await prisma.subscriptionPlan.findFirst({ where: { id: planId, isActive: true } })
  if (!plan) throw new AppError(404, '플랜을 찾을 수 없습니다.')

  const existing = await prisma.subscription.findFirst({
    where: { userId, status: { in: ['ACTIVE', 'PAST_DUE'] } },
  })
  if (existing) throw new AppError(409, '이미 활성 구독이 있습니다.')

  const paymentRequest = await paymentGateway.requestPayment({
    userId,
    planId,
    amount: plan.amount,
    phoneNumber,
  })

  const subscription = await prisma.subscription.create({
    data: {
      userId,
      planId,
      phoneNumber,
      status: 'PAST_DUE',
      payments: {
        create: {
          amount: plan.amount,
          status: 'PENDING',
          pgTransactionId: paymentRequest.paymentId,
        },
      },
    },
    include: { plan: true, payments: true },
  })

  return {
    subscriptionId: subscription.id,
    paymentId: paymentRequest.paymentId,
    amount: paymentRequest.amount,
    phoneNumber: paymentRequest.phoneNumber,
  }
}

export async function completeSubscriptionCallback(paymentId: string, authCode: string) {
  const payment = await prisma.payment.findFirst({
    where: { pgTransactionId: paymentId },
    include: { subscription: true },
  })
  if (!payment) throw new AppError(404, '결제 정보를 찾을 수 없습니다.')

  const verified = await paymentGateway.verifyCallback({ paymentId, authCode })
  if (!verified.success) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED' },
    })
    throw new AppError(400, '결제 인증에 실패했습니다.')
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'SUCCESS',
        paidAt: new Date(),
        pgTransactionId: verified.pgTransactionId,
      },
    }),
    prisma.subscription.update({
      where: { id: payment.subscriptionId },
      data: {
        status: 'ACTIVE',
        billingKey: verified.billingKey,
        startedAt: new Date(),
      },
    }),
  ])

  return prisma.subscription.findUnique({
    where: { id: payment.subscriptionId },
    include: { plan: true },
  })
}

export async function getMySubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: { userId, status: { in: ['ACTIVE', 'PAST_DUE'] } },
    include: { plan: true, payments: { orderBy: { createdAt: 'desc' }, take: 5 } },
  })
}

export async function cancelMySubscription(userId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: 'ACTIVE' },
  })
  if (!subscription) throw new AppError(404, '활성 구독이 없습니다.')

  if (subscription.billingKey) {
    await paymentGateway.cancelBilling(subscription.billingKey)
  }

  return prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
    include: { plan: true },
  })
}

export const startSubscriptionSchema = z.object({
  planId: z.string().uuid(),
  phoneNumber: z.string().regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/),
})

export const callbackSchema = z.object({
  paymentId: z.string().min(1),
  authCode: z.string().min(1),
})

export async function handlePaymentWebhook(payload: {
  subscriptionId: string
  amount: number
  status: 'SUCCESS' | 'FAILED'
  pgTransactionId: string
}) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: payload.subscriptionId },
  })
  if (!subscription) throw new AppError(404, '구독을 찾을 수 없습니다.')

  await prisma.payment.create({
    data: {
      subscriptionId: payload.subscriptionId,
      amount: payload.amount,
      status: payload.status,
      pgTransactionId: payload.pgTransactionId,
      paidAt: payload.status === 'SUCCESS' ? new Date() : null,
    },
  })

  if (payload.status === 'FAILED') {
    await prisma.subscription.update({
      where: { id: payload.subscriptionId },
      data: { status: 'PAST_DUE' },
    })
  }

  return { ok: true }
}

export const webhookSchema = z.object({
  subscriptionId: z.string().uuid(),
  amount: z.number().int().positive(),
  status: z.enum(['SUCCESS', 'FAILED']),
  pgTransactionId: z.string().min(1),
  signature: z.string().min(1),
})

export function verifyWebhookSignature(signature: string): boolean {
  return signature === 'mock-webhook-signature'
}
