import { env, requirePortOne } from '../../config/env.js'
import { AppError } from '../../middlewares/errorHandler.middleware.js'
import type { PayMethod } from './payMethod.js'
import { isAccountPayMethod } from './payMethod.js'

const PORTONE_API = 'https://api.iamport.kr'

async function parsePortOneJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  try {
    return JSON.parse(text) as T
  } catch {
    throw new AppError(502, `PortOne 응답을 해석하지 못했습니다. (${res.status})`)
  }
}

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
  const data = await parsePortOneJson<{
    code: number
    message?: string
    response?: { access_token: string; expired_at: number }
  }>(res)
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
  const data = await parsePortOneJson<{
    code: number
    message?: string
    response?: PortOnePayment
  }>(res)
  if (!res.ok || data.code !== 0 || !data.response) {
    throw new AppError(502, data.message || 'PortOne 결제 조회에 실패했습니다.')
  }
  return data.response
}

export async function fetchPaymentByMerchantUid(
  merchantUid: string,
  status: 'paid' | 'ready' | 'failed' | 'cancelled' = 'paid',
): Promise<PortOnePayment | null> {
  const token = await getAccessToken()
  const res = await fetch(
    `${PORTONE_API}/payments/find/${encodeURIComponent(merchantUid)}/${status}`,
    { headers: { Authorization: token } },
  )
  const data = await parsePortOneJson<{
    code: number
    message?: string
    response?: PortOnePayment
  }>(res)
  if (!res.ok || data.code !== 0 || !data.response) {
    return null
  }
  return data.response
}

export async function fetchBillingCustomer(
  customerUid: string,
): Promise<{ customer_uid: string } | null> {
  const token = await getAccessToken()
  const res = await fetch(
    `${PORTONE_API}/subscribe/customers/${encodeURIComponent(customerUid)}`,
    { headers: { Authorization: token } },
  )
  const data = await parsePortOneJson<{
    code: number
    message?: string
    response?: { customer_uid: string }
  }>(res)
  if (!res.ok || data.code !== 0 || !data.response) {
    return null
  }
  return data.response
}

/** 토스/카카오 빌링키 발급 직후 imp_uid 조회가 실패할 때 merchant_uid·customer_uid로 보완 */
export async function resolvePortonePaymentForComplete(params: {
  impUid: string
  merchantUid: string
  customerUid?: string
  payMethod: PayMethod
}): Promise<PortOnePayment> {
  try {
    return await fetchPayment(params.impUid)
  } catch (err) {
    const isLookupFailure =
      err instanceof AppError &&
      err.statusCode === 502 &&
      (err.message.includes('존재하지 않는') ||
        err.message.includes('결제 조회'))

    if (!isLookupFailure) throw err

    for (const status of ['paid', 'ready'] as const) {
      const found = await fetchPaymentByMerchantUid(params.merchantUid, status)
      if (found) return found
    }

    if (
      (params.payMethod === 'TOSS_PAY' || params.payMethod === 'KAKAO_PAY') &&
      params.customerUid
    ) {
      const customer = await fetchBillingCustomer(params.customerUid)
      if (customer) {
        return {
          imp_uid: params.impUid,
          merchant_uid: params.merchantUid,
          amount: 0,
          status: 'ready',
          customer_uid: params.customerUid,
        }
      }
    }

    throw err
  }
}

export async function scheduleRecurringPayment(params: {
  customerUid: string
  merchantUid: string
  amount: number
  name: string
  scheduleAtUnix: number
  noticeUrl?: string
}): Promise<void> {
  const token = await getAccessToken()
  const schedule: Record<string, unknown> = {
    merchant_uid: params.merchantUid,
    schedule_at: params.scheduleAtUnix,
    amount: params.amount,
    name: params.name,
  }
  if (params.noticeUrl) {
    schedule.notice_url = params.noticeUrl
  }

  const res = await fetch(`${PORTONE_API}/subscribe/payments/schedule`, {
    method: 'POST',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customer_uid: params.customerUid,
      schedules: [schedule],
    }),
  })
  const data = await parsePortOneJson<{ code: number; message?: string }>(res)
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

export async function chargeBillingAgain(params: {
  customerUid: string
  merchantUid: string
  amount: number
  name: string
  noticeUrl?: string
}): Promise<PortOnePayment> {
  const token = await getAccessToken()
  const body: Record<string, unknown> = {
    customer_uid: params.customerUid,
    merchant_uid: params.merchantUid,
    amount: params.amount,
    name: params.name,
  }
  if (params.noticeUrl) {
    body.notice_url = params.noticeUrl
  }

  const res = await fetch(`${PORTONE_API}/subscribe/payments/again`, {
    method: 'POST',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const data = await parsePortOneJson<{
    code: number
    message?: string
    response?: PortOnePayment
  }>(res)
  if (!res.ok || data.code !== 0 || !data.response) {
    throw new AppError(502, data.message || 'PortOne 빌링 결제에 실패했습니다.')
  }
  if (data.response.status !== 'paid') {
    throw new AppError(
      400,
      data.response.fail_reason || '빌링 결제에 실패했습니다.',
    )
  }
  return data.response
}

export function isPortOneConfigured(): boolean {
  return Boolean(env.PORTONE_API_KEY && env.PORTONE_API_SECRET && env.PORTONE_IMP_CODE)
}

export function getPortOnePublicConfig(payMethod: PayMethod) {
  const { impCode } = requirePortOne()
  const kakaoChannelKey = env.PORTONE_KAKAO_CHANNEL_KEY ?? undefined
  const tossChannelKey = env.PORTONE_TOSS_CHANNEL_KEY ?? undefined
  const accountChannelKey = env.PORTONE_ACCOUNT_CHANNEL_KEY ?? undefined

  if (payMethod === 'KAKAO_PAY') {
    return {
      impCode,
      channelKey: kakaoChannelKey,
      pg: env.PORTONE_KAKAO_PG,
    }
  }

  if (payMethod === 'TOSS_PAY') {
    return {
      impCode,
      channelKey: tossChannelKey,
      pg: env.PORTONE_TOSS_PG,
    }
  }

  if (payMethod === 'PHONE') {
    const phoneChannelKey =
      env.PORTONE_PHONE_CHANNEL_KEY ?? env.PORTONE_CHANNEL_KEY ?? undefined
    return {
      impCode,
      channelKey: phoneChannelKey,
      pg: env.PORTONE_PG,
    }
  }

  // --- 추후 오픈: 네이버페이 ---
  // if (payMethod === 'NAVER_PAY') {
  //   const naverChannelKey = env.PORTONE_NAVER_CHANNEL_KEY ?? undefined
  //   return {
  //     impCode,
  //     channelKey: naverChannelKey,
  //     pg: env.PORTONE_NAVER_PG,
  //   }
  // }

  if (isAccountPayMethod(payMethod)) {
    return {
      impCode,
      channelKey: accountChannelKey,
      pg: env.PORTONE_ACCOUNT_PG,
    }
  }

  const fallbackChannelKey =
    env.PORTONE_PHONE_CHANNEL_KEY ?? env.PORTONE_CHANNEL_KEY ?? undefined
  return {
    impCode,
    channelKey: fallbackChannelKey,
    pg: env.PORTONE_PG,
  }
}
