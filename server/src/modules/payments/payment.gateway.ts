import { randomUUID } from 'crypto'
import { isPaymentMockMode } from '../../config/env.js'
import type { PayMethod } from './payMethod.js'
import { isAccountPayMethod } from './payMethod.js'
import {
  deleteBillingCustomer,
  getPortOnePublicConfig,
  isPortOneConfigured,
  unscheduleByCustomerUid,
} from './portone.client.js'

export interface PaymentRequestResult {
  payMethod: PayMethod
  merchantUid: string
  customerUid: string
  amount: number
  orderName: string
  phoneNumber: string
  impCode: string
  channelKey?: string
  pg: string
}

export interface PaymentGateway {
  requestPayment(params: {
    userId: string
    planId: string
    payMethod: PayMethod
    amount: number
    phoneNumber: string
    orderName: string
  }): Promise<PaymentRequestResult>
  cancelBilling(customerUid: string): Promise<void>
}

function buildCustomerUid(userId: string, planId: string, payMethod: PayMethod) {
  return `user_${userId}_${planId}_${payMethod}`.slice(0, 80)
}

class PortOnePaymentGateway implements PaymentGateway {
  async requestPayment(params: {
    userId: string
    planId: string
    payMethod: PayMethod
    amount: number
    phoneNumber: string
    orderName: string
  }): Promise<PaymentRequestResult> {
    const publicConfig = getPortOnePublicConfig(params.payMethod)
    return {
      payMethod: params.payMethod,
      merchantUid: `support_${randomUUID().replace(/-/g, '')}`,
      customerUid: buildCustomerUid(params.userId, params.planId, params.payMethod),
      amount: params.amount,
      orderName: params.orderName,
      phoneNumber: params.phoneNumber,
      impCode: publicConfig.impCode,
      channelKey: publicConfig.channelKey,
      pg: publicConfig.pg,
    }
  }

  async cancelBilling(customerUid: string): Promise<void> {
    await unscheduleByCustomerUid(customerUid)
    await deleteBillingCustomer(customerUid)
  }
}

function mockPgForPayMethod(payMethod: PayMethod): string {
  switch (payMethod) {
    case 'KAKAO_PAY':
      return 'kakaopay.TCSUBSCRIP'
    case 'TOSS_PAY':
      return 'tosspay_v2'
    // case 'NAVER_PAY':
    //   return 'naverpay'
    case 'K_BANK':
    case 'KAKAO_BANK':
      return 'settle_acc'
    default:
      return 'danal'
  }
}

class MockPaymentGateway implements PaymentGateway {
  async requestPayment(params: {
    userId: string
    planId: string
    payMethod: PayMethod
    amount: number
    phoneNumber: string
    orderName: string
  }): Promise<PaymentRequestResult> {
    const pg = mockPgForPayMethod(params.payMethod)
    return {
      payMethod: params.payMethod,
      merchantUid: `mock_${Date.now()}`,
      customerUid: buildCustomerUid(params.userId, params.planId, params.payMethod),
      amount: params.amount,
      orderName: params.orderName,
      phoneNumber: params.phoneNumber,
      impCode: 'imp_mock',
      pg,
    }
  }

  async cancelBilling(_customerUid: string): Promise<void> {
    // mock: no-op
  }
}

function createPaymentGateway(): PaymentGateway {
  if (isPaymentMockMode()) return new MockPaymentGateway()
  if (isPortOneConfigured()) return new PortOnePaymentGateway()
  return new MockPaymentGateway()
}

export const paymentGateway: PaymentGateway = createPaymentGateway()
