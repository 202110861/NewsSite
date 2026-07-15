import { z } from 'zod'
import { randomUUID } from 'crypto'
import { prisma } from '../../db/client.js'
import { AppError } from '../../middlewares/errorHandler.middleware.js'
import { paymentGateway } from '../payments/payment.gateway.js'
import {
  fetchPayment,
  scheduleRecurringPayment,
} from '../payments/portone.client.js'

function addOneMonth(from: Date): Date {
  const next = new Date(from)
  next.setMonth(next.getMonth() + 1)
  return next
}

function toUnixSeconds(date: Date): number {
  return Math.floor(date.getTime() / 1000)
}

export async function listPlans() {
  return prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { amount: 'asc' },
  })
}

export async function startSubscription(
  userId: string,
  planId: string,
  phoneNumber: string,
) {
  const plan = await prisma.subscriptionPlan.findFirst({
    where: { id: planId, isActive: true },
  })
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
    orderName: `경제인뉴스 후원 · ${plan.label}`,
  })

  const subscription = await prisma.subscription.create({
    data: {
      userId,
      planId,
      phoneNumber,
      status: 'PAST_DUE',
      billingKey: paymentRequest.customerUid,
      payments: {
        create: {
          amount: plan.amount,
          status: 'PENDING',
          merchantUid: paymentRequest.merchantUid,
        },
      },
    },
    include: { plan: true, payments: true },
  })

  return {
    subscriptionId: subscription.id,
    merchantUid: paymentRequest.merchantUid,
    customerUid: paymentRequest.customerUid,
    amount: paymentRequest.amount,
    orderName: paymentRequest.orderName,
    phoneNumber: paymentRequest.phoneNumber,
    impCode: paymentRequest.impCode,
    channelKey: paymentRequest.channelKey,
    pg: paymentRequest.pg,
  }
}

async function activatePaidPayment(params: {
  merchantUid: string
  impUid: string
  amount: number
  customerUid?: string
}) {
  const payment = await prisma.payment.findFirst({
    where: { merchantUid: params.merchantUid },
    include: { subscription: { include: { plan: true } } },
  })
  if (!payment) throw new AppError(404, '결제 정보를 찾을 수 없습니다.')

  if (payment.amount !== params.amount) {
    throw new AppError(400, '결제 금액이 일치하지 않습니다.')
  }

  if (payment.status === 'SUCCESS') {
    return prisma.subscription.findUnique({
      where: { id: payment.subscriptionId },
      include: { plan: true },
    })
  }

  const customerUid =
    params.customerUid || payment.subscription.billingKey || undefined

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'SUCCESS',
        paidAt: new Date(),
        pgTransactionId: params.impUid,
      },
    }),
    prisma.subscription.update({
      where: { id: payment.subscriptionId },
      data: {
        status: 'ACTIVE',
        billingKey: customerUid,
        startedAt: payment.subscription.startedAt || new Date(),
      },
    }),
  ])

  if (customerUid) {
    const nextMerchantUid = `support_${randomUUID().replace(/-/g, '')}`
    const scheduleAt = addOneMonth(new Date())
    try {
      await scheduleRecurringPayment({
        customerUid,
        merchantUid: nextMerchantUid,
        amount: payment.subscription.plan.amount,
        name: `경제인뉴스 후원 · ${payment.subscription.plan.label}`,
        scheduleAtUnix: toUnixSeconds(scheduleAt),
      })
      await prisma.payment.create({
        data: {
          subscriptionId: payment.subscriptionId,
          amount: payment.subscription.plan.amount,
          status: 'PENDING',
          merchantUid: nextMerchantUid,
        },
      })
    } catch (err) {
      console.error('[subscriptions] schedule next payment failed:', err)
    }
  }

  return prisma.subscription.findUnique({
    where: { id: payment.subscriptionId },
    include: { plan: true },
  })
}

export async function completeSubscriptionPayment(
  userId: string,
  impUid: string,
  merchantUid: string,
) {
  const payment = await prisma.payment.findFirst({
    where: { merchantUid },
    include: { subscription: true },
  })
  if (!payment) throw new AppError(404, '결제 정보를 찾을 수 없습니다.')
  if (payment.subscription.userId !== userId) {
    throw new AppError(403, '결제에 접근할 수 없습니다.')
  }

  const portonePayment = await fetchPayment(impUid)
  if (portonePayment.merchant_uid !== merchantUid) {
    throw new AppError(400, '주문번호가 일치하지 않습니다.')
  }
  if (portonePayment.status !== 'paid') {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED', pgTransactionId: impUid },
    })
    throw new AppError(400, portonePayment.fail_reason || '결제에 실패했습니다.')
  }

  return activatePaidPayment({
    merchantUid,
    impUid,
    amount: portonePayment.amount,
    customerUid: portonePayment.customer_uid,
  })
}

/** @deprecated mock OTP callback — PortOne 연동 후 completeSubscriptionPayment 사용 */
export async function completeSubscriptionCallback(
  paymentId: string,
  authCode: string,
) {
  if (authCode.length < 4) {
    throw new AppError(400, '결제 인증에 실패했습니다.')
  }
  const payment = await prisma.payment.findFirst({
    where: {
      OR: [{ merchantUid: paymentId }, { pgTransactionId: paymentId }],
    },
    include: { subscription: { include: { plan: true } } },
  })
  if (!payment) throw new AppError(404, '결제 정보를 찾을 수 없습니다.')

  return activatePaidPayment({
    merchantUid: payment.merchantUid || paymentId,
    impUid: `mock-tx-${paymentId}`,
    amount: payment.amount,
    customerUid: payment.subscription.billingKey || undefined,
  })
}

export async function getMySubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: { userId, status: { in: ['ACTIVE', 'PAST_DUE'] } },
    include: {
      plan: true,
      payments: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
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

export const completePaymentSchema = z.object({
  impUid: z.string().min(1),
  merchantUid: z.string().min(1),
})

export const callbackSchema = z.object({
  paymentId: z.string().min(1),
  authCode: z.string().min(1),
})

export async function handlePortOneWebhook(payload: {
  imp_uid: string
  merchant_uid: string
  status: string
}) {
  console.log('[webhook]', payload)

  const payment = await prisma.payment.findFirst({
    where: { merchantUid: payload.merchant_uid },
    include: { subscription: { include: { plan: true } } },
  })

  // 호출 테스트 등 주문번호가 없는 경우에도 200으로 응답
  if (!payment) {
    return { ok: true, ignored: true }
  }

  if (payload.status === 'paid') {
    const portonePayment = await fetchPayment(payload.imp_uid)
    if (portonePayment.amount !== payment.amount) {
      throw new AppError(400, '결제 금액이 일치하지 않습니다.')
    }
    await activatePaidPayment({
      merchantUid: payload.merchant_uid,
      impUid: payload.imp_uid,
      amount: portonePayment.amount,
      customerUid: portonePayment.customer_uid,
    })
    return { ok: true }
  }

  if (payload.status === 'failed' || payload.status === 'cancelled') {
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          pgTransactionId: payload.imp_uid,
        },
      }),
      prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: { status: 'PAST_DUE' },
      }),
    ])
    return { ok: true }
  }

  return { ok: true }
}

export const portoneWebhookSchema = z.object({
  imp_uid: z.string().min(1),
  merchant_uid: z.string().min(1),
  status: z.string().min(1),
})
