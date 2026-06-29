export interface PaymentRequestResult {
  paymentId: string
  orderId: string
  amount: number
  phoneNumber: string
}

export interface PaymentVerifyResult {
  success: boolean
  pgTransactionId: string
  billingKey?: string
}

export interface PaymentGateway {
  requestPayment(params: {
    userId: string
    planId: string
    amount: number
    phoneNumber: string
  }): Promise<PaymentRequestResult>
  verifyCallback(params: {
    paymentId: string
    authCode: string
  }): Promise<PaymentVerifyResult>
  cancelBilling(billingKey: string): Promise<void>
}

export class MockPaymentGateway implements PaymentGateway {
  async requestPayment(params: {
    userId: string
    planId: string
    amount: number
    phoneNumber: string
  }): Promise<PaymentRequestResult> {
    return {
      paymentId: `mock-pay-${Date.now()}`,
      orderId: `order-${params.userId.slice(0, 8)}-${Date.now()}`,
      amount: params.amount,
      phoneNumber: params.phoneNumber,
    }
  }

  async verifyCallback(params: {
    paymentId: string
    authCode: string
  }): Promise<PaymentVerifyResult> {
    const success = params.authCode.length >= 4
    return {
      success,
      pgTransactionId: `mock-tx-${params.paymentId}`,
      billingKey: success ? `mock-billing-${params.paymentId}` : undefined,
    }
  }

  async cancelBilling(_billingKey: string): Promise<void> {
    // mock: no-op
  }
}

export const paymentGateway: PaymentGateway = new MockPaymentGateway()
