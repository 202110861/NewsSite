import { z } from 'zod'
import { randomUUID } from 'crypto'
import type { PayMethod } from '@prisma/client'
import { env, getPaymentWebhookUrl, isPaymentMockMode } from '../../config/env.js'
import { prisma } from '../../db/client.js'
import { AppError } from '../../middlewares/errorHandler.middleware.js'
import { paymentGateway } from '../payments/payment.gateway.js'
import {
  isAccountPayMethod,
  isActivePayMethod,
  REQUESTABLE_PAY_METHODS,
} from '../payments/payMethod.js'
import {
  chargeBillingAgain,
  fetchPayment,
  resolvePortonePaymentForComplete,
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

export function getPaymentConfig() {
  return {
    paymentMode: env.PAYMENT_MODE,
    kakaoTestUsesZeroAmount: env.PAYMENT_MODE === 'portone_test',
    accountTestUsesZeroAmount: env.PAYMENT_MODE === 'portone_test',
    webhookUrl: getPaymentWebhookUrl(),
  }
}

function resolveChargeAmount(
  portoneAmount: number,
  dbAmount: number,
  payMethod: PayMethod,
): number {
  if (payMethod === 'KAKAO_PAY' && portoneAmount === 0) return dbAmount
  if (payMethod === 'TOSS_PAY' && portoneAmount === 0) return dbAmount
  if (isAccountPayMethod(payMethod) && portoneAmount === 0) return dbAmount
  return portoneAmount
}

function usesBillingKeyOnlyAmount(payMethod: PayMethod): boolean {
  // if (payMethod === 'NAVER_PAY') return env.PAYMENT_MODE === 'portone_test'
  if (payMethod === 'TOSS_PAY' && env.PAYMENT_MODE === 'portone_test') return true
  if (payMethod === 'KAKAO_PAY' && env.PAYMENT_MODE === 'portone_test') return true
  if (isAccountPayMethod(payMethod) && env.PAYMENT_MODE === 'portone_test') {
    return true
  }
  return false
}

export async function startSubscription(
  userId: string,
  planId: string,
  payMethod: PayMethod,
  phoneNumber?: string,
) {
  if (!isActivePayMethod(payMethod)) {
    throw new AppError(
      503,
      '해당 결제 수단은 현재 심사·연동 중입니다. 곧 이용하실 수 있습니다.',
    )
  }

  const plan = await prisma.subscriptionPlan.findFirst({
    where: { id: planId, isActive: true },
  })
  if (!plan) throw new AppError(404, '플랜을 찾을 수 없습니다.')

  const existing = await prisma.subscription.findFirst({
    where: { userId, status: { in: ['ACTIVE', 'PAST_DUE'] } },
  })
  if (existing) throw new AppError(409, '이미 활성 구독이 있습니다.')

  const normalizedPhone = phoneNumber?.replace(/-/g, '') ?? ''

  const paymentRequest = await paymentGateway.requestPayment({
    userId,
    planId,
    payMethod,
    amount: plan.amount,
    phoneNumber: normalizedPhone,
    orderName: `경제인뉴스 후원 · ${plan.label}`,
  })

  const subscription = await prisma.subscription.create({
    data: {
      userId,
      planId,
      payMethod,
      phoneNumber: normalizedPhone,
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
    paymentMode: env.PAYMENT_MODE,
    payMethod: paymentRequest.payMethod,
    merchantUid: paymentRequest.merchantUid,
    customerUid: paymentRequest.customerUid,
    amount: paymentRequest.amount,
    billingAmount: usesBillingKeyOnlyAmount(payMethod)
      ? 0
      : paymentRequest.amount,
    orderName: paymentRequest.orderName,
    phoneNumber: paymentRequest.phoneNumber,
    impCode: paymentRequest.impCode,
    channelKey: paymentRequest.channelKey,
    pg: paymentRequest.pg,
    customerId: userId,
    // naverProductCode: `news_support_${planId.slice(0, 8)}`, // 추후: 네이버페이
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
      if (!isPaymentMockMode()) {
        await scheduleRecurringPayment({
          customerUid,
          merchantUid: nextMerchantUid,
          amount: payment.subscription.plan.amount,
          name: `경제인뉴스 후원 · ${payment.subscription.plan.label}`,
          scheduleAtUnix: toUnixSeconds(scheduleAt),
          noticeUrl: getPaymentWebhookUrl(),
        })
      }
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
    include: { subscription: { include: { plan: true } } },
  })
  if (!payment) throw new AppError(404, '결제 정보를 찾을 수 없습니다.')
  if (payment.subscription.userId !== userId) {
    throw new AppError(403, '결제에 접근할 수 없습니다.')
  }

  const payMethod = payment.subscription.payMethod
  const portonePayment = await resolvePortonePaymentForComplete({
    impUid,
    merchantUid,
    customerUid: payment.subscription.billingKey ?? undefined,
    payMethod,
  })
  const isBillingKeyStep =
    (payMethod === 'TOSS_PAY' || payMethod === 'KAKAO_PAY') &&
    portonePayment.status !== 'paid' &&
    Boolean(portonePayment.customer_uid)

  if (
    portonePayment.merchant_uid &&
    portonePayment.merchant_uid !== merchantUid &&
    !isBillingKeyStep
  ) {
    throw new AppError(400, '주문번호가 일치하지 않습니다.')
  }

  let paidPayment = portonePayment
  let resolvedImpUid = impUid

  if (
    paidPayment.status !== 'paid' &&
    (payMethod === 'TOSS_PAY' || payMethod === 'KAKAO_PAY')
  ) {
    const customerUid =
      paidPayment.customer_uid || payment.subscription.billingKey || undefined
    if (!customerUid) {
      throw new AppError(400, '빌링키가 발급되지 않았습니다.')
    }
    const chargeMerchantUid = `support_${randomUUID().replace(/-/g, '')}`
    paidPayment = await chargeBillingAgain({
      customerUid,
      merchantUid: chargeMerchantUid,
      amount: payment.amount,
      name: `경제인뉴스 후원 · ${payment.subscription.plan.label}`,
      noticeUrl: getPaymentWebhookUrl(),
    })
    resolvedImpUid = paidPayment.imp_uid
  }

  // --- 추후 오픈: 네이버페이 ---
  // if (paidPayment.status !== 'paid' && payMethod === 'NAVER_PAY') {
  //   const customerUid =
  //     paidPayment.customer_uid || payment.subscription.billingKey || undefined
  //   if (!customerUid) {
  //     throw new AppError(400, '네이버페이 빌링키가 발급되지 않았습니다.')
  //   }
  //   const chargeMerchantUid = `support_${randomUUID().replace(/-/g, '')}`
  //   paidPayment = await chargeBillingAgain({
  //     customerUid,
  //     merchantUid: chargeMerchantUid,
  //     amount: payment.amount,
  //     name: `경제인뉴스 후원 · ${payment.subscription.plan.label}`,
  //     noticeUrl: getPaymentWebhookUrl(),
  //   })
  //   resolvedImpUid = paidPayment.imp_uid
  // }

  if (paidPayment.status !== 'paid') {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED', pgTransactionId: resolvedImpUid },
    })
    throw new AppError(400, paidPayment.fail_reason || '결제에 실패했습니다.')
  }

  return activatePaidPayment({
    merchantUid: payment.merchantUid || merchantUid,
    impUid: resolvedImpUid,
    amount: resolveChargeAmount(
      paidPayment.amount,
      payment.amount,
      payMethod,
    ),
    customerUid: paidPayment.customer_uid,
  })
}

/** Mock 결제 완료 (PAYMENT_MODE=mock 전용) */
export async function completeSubscriptionCallback(
  paymentId: string,
  authCode: string,
) {
  if (!isPaymentMockMode()) {
    throw new AppError(400, 'Mock 결제는 PAYMENT_MODE=mock 에서만 사용할 수 있습니다.')
  }
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
    where: { userId, status: { in: ['ACTIVE', 'PAST_DUE'] } },
  })
  if (!subscription) throw new AppError(404, '해지할 구독이 없습니다.')

  if (subscription.billingKey) {
    try {
      await paymentGateway.cancelBilling(subscription.billingKey)
    } catch (err) {
      console.warn('[subscriptions] PortOne billing cancel failed:', err)
    }
  }

  return prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
    include: { plan: true },
  })
}

export const payMethodSchema = z.enum(REQUESTABLE_PAY_METHODS)

// const buyerTelSchema = z
//   .string()
//   .regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, '올바른 연락처를 입력해 주세요.')

export const startSubscriptionSchema = z
  .object({
    planId: z.string().uuid(),
    payMethod: payMethodSchema.default('TOSS_PAY'),
    phoneNumber: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // 추후: 네이버페이 연락처 필수
    // if (data.payMethod === 'NAVER_PAY') { ... }
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
    const chargedAmount = resolveChargeAmount(
      portonePayment.amount,
      payment.amount,
      payment.subscription.payMethod,
    )
    if (chargedAmount !== payment.amount) {
      throw new AppError(400, '결제 금액이 일치하지 않습니다.')
    }
    await activatePaidPayment({
      merchantUid: payload.merchant_uid,
      impUid: payload.imp_uid,
      amount: resolveChargeAmount(
        portonePayment.amount,
        payment.amount,
        payment.subscription.payMethod,
      ),
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
