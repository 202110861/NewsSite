import { env, requirePortOne } from '../../config/env.js'
import { AppError } from '../../middlewares/errorHandler.middleware.js'

const PORTONE_API = 'https://api.iamport.kr'

interface TokenCache {
  accessToken: string
  expiresAt: number
}

let tokenCache: TokenCache | null = null

async function getAccessToken(): Promise<string> {
  const { apiKey, apiSecret } = requirePortOne()
  const now = Date.now()
  if (tokenCache && tokenCache.expiresAt > now + 60_000) {
    return tokenCache.accessToken
  }

  const res = await fetch(`${PORTONE_API}/users/getToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imp_key: apiKey,
      imp_secret: apiSecret,
    }),
  })
  const data = (await res.json()) as {
    code: number
    message?: string
    response?: { access_token: string; expired_at: number }
  }
  if (!res.ok || data.code !== 0 || !data.response?.access_token) {
    throw new AppError(502, data.message || 'PortOne 토큰 발급에 실패했습니다.')
  }

  tokenCache = {
    accessToken: data.response.access_token,
    expiresAt: data.response.expired_at * 1000,
  }
  return tokenCache.accessToken
}

export interface PortOnePayment {
  imp_uid: string
  merchant_uid: string
  amount: number
  status: string
  pay_method?: string
  customer_uid?: string
  fail_reason?: string
  paid_at?: number
  name?: string
}

export async function fetchPayment(impUid: string): Promise<PortOnePayment> {
  const token = await getAccessToken()
  const res = await fetch(`${PORTONE_API}/payments/${encodeURIComponent(impUid)}`, {
    headers: { Authorization: token },
  })
  const data = (await res.json()) as {
    code: number
    message?: string
    response?: PortOnePayment
  }
  if (!res.ok || data.code !== 0 || !data.response) {
    throw new AppError(502, data.message || 'PortOne 결제 조회에 실패했습니다.')
  }
  return data.response
}

export async function scheduleRecurringPayment(params: {
  customerUid: string
  merchantUid: string
  amount: number
  name: string
  scheduleAtUnix: number
}): Promise<void> {
  const token = await getAccessToken()
  const res = await fetch(`${PORTONE_API}/subscribe/payments/schedule`, {
    method: 'POST',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customer_uid: params.customerUid,
      schedules: [
        {
          merchant_uid: params.merchantUid,
          schedule_at: params.scheduleAtUnix,
          amount: params.amount,
          name: params.name,
        },
      ],
    }),
  })
  const data = (await res.json()) as { code: number; message?: string }
  if (!res.ok || data.code !== 0) {
    throw new AppError(502, data.message || 'PortOne 정기결제 예약에 실패했습니다.')
  }
}

export async function unscheduleByCustomerUid(customerUid: string): Promise<void> {
  const token = await getAccessToken()
  const res = await fetch(
    `${PORTONE_API}/subscribe/payments/schedule/customers/${encodeURIComponent(customerUid)}`,
    {
      method: 'DELETE',
      headers: { Authorization: token },
    },
  )
  // 예약이 없어도 해지는 계속 진행
  if (!res.ok && res.status !== 404) {
    const data = (await res.json().catch(() => null)) as { message?: string } | null
    console.warn('[portone] unschedule failed:', data?.message || res.status)
  }
}

export async function deleteBillingCustomer(customerUid: string): Promise<void> {
  const token = await getAccessToken()
  const res = await fetch(
    `${PORTONE_API}/subscribe/customers/${encodeURIComponent(customerUid)}`,
    {
      method: 'DELETE',
      headers: { Authorization: token },
    },
  )
  if (!res.ok && res.status !== 404) {
    const data = (await res.json().catch(() => null)) as { message?: string } | null
    console.warn('[portone] delete customer failed:', data?.message || res.status)
  }
}

export function isPortOneConfigured(): boolean {
  return Boolean(env.PORTONE_API_KEY && env.PORTONE_API_SECRET && env.PORTONE_IMP_CODE)
}

export function getPortOnePublicConfig() {
  const { impCode, channelKey, pg } = requirePortOne()
  return { impCode, channelKey, pg }
}
