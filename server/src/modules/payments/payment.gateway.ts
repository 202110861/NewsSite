import { randomUUID } from 'crypto'
import {
  deleteBillingCustomer,
  getPortOnePublicConfig,
  isPortOneConfigured,
  unscheduleByCustomerUid,
} from './portone.client.js'

export interface PaymentRequestResult {
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
    amount: number
    phoneNumber: string
    orderName: string
  }): Promise<PaymentRequestResult>
  cancelBilling(customerUid: string): Promise<void>
}

class PortOnePaymentGateway implements PaymentGateway {
  async requestPayment(params: {
    userId: string
    planId: string
    amount: number
    phoneNumber: string
    orderName: string
  }): Promise<PaymentRequestResult> {
    const publicConfig = getPortOnePublicConfig()
    return {
      merchantUid: `support_${randomUUID().replace(/-/g, '')}`,
      customerUid: `user_${params.userId}_${params.planId}`.slice(0, 80),
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

class MockPaymentGateway implements PaymentGateway {
  async requestPayment(params: {
    userId: string
    planId: string
    amount: number
    phoneNumber: string
    orderName: string
  }): Promise<PaymentRequestResult> {
    return {
      merchantUid: `mock_${Date.now()}`,
      customerUid: `mock_user_${params.userId}`,
      amount: params.amount,
      orderName: params.orderName,
      phoneNumber: params.phoneNumber,
      impCode: 'imp_mock',
      pg: 'danal',
    }
  }

  async cancelBilling(_customerUid: string): Promise<void> {
    // mock: no-op
  }
}

export const paymentGateway: PaymentGateway = isPortOneConfigured()
  ? new PortOnePaymentGateway()
  : new MockPaymentGateway()
