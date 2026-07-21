type ImpResponse = {
  success?: boolean
  error_code?: string
  error_msg?: string
  imp_uid?: string
  merchant_uid?: string
  pay_method?: string
  paid_amount?: number
  status?: string
}

type ImpRequestPayParams = {
  channelKey?: string
  pg?: string
  pay_method?: string
  merchant_uid: string
  name: string
  amount: number
  customer_uid: string
  buyer_tel?: string
  buyer_name?: string
  buyer_email?: string
  buyer_addr?: string
  buyer_postcode?: string
  company?: string
  period?: { from: string; to: string; text?: string }
  m_redirect_url?: string
  notice_url?: string
  kakaopayMobileAsPC?: boolean
  customer_id?: string
  card?: { useInstallment?: boolean }
  // naverProductCode?: string
  // naverProductCount?: number
  // naverPopupMode?: boolean
  bypass?: {
    settle?: {
      addDeductionYn?: string
      criPsblYn?: string
    }
  }
}

type ImpInstance = {
  init: (impCode: string) => void
  request_pay: (
    params: ImpRequestPayParams,
    callback?: (rsp: ImpResponse) => void,
  ) => void
}

declare global {
  interface Window {
    IMP?: ImpInstance
  }
}

const PORTONE_SDK_URL = 'https://cdn.iamport.kr/v1/iamport.js'

let loadPromise: Promise<ImpInstance> | null = null

export type PortOneBillingResult = ImpResponse | { redirect: true }

export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobile|KAKAOTALK/i.test(navigator.userAgent)
}

function formatYmd(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

function redirectUrl(): string {
  return `${window.location.origin}/support/portone-return`
}

function pgParams(channelKey?: string, pg?: string): Pick<ImpRequestPayParams, 'channelKey' | 'pg'> {
  return channelKey ? { channelKey } : { pg }
}

export function loadPortOneSdk(): Promise<ImpInstance> {
  if (window.IMP) return Promise.resolve(window.IMP)
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${PORTONE_SDK_URL}"]`,
    )
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.IMP) resolve(window.IMP)
        else reject(new Error('PortOne SDK 로드에 실패했습니다.'))
      })
      return
    }

    const script = document.createElement('script')
    script.src = PORTONE_SDK_URL
    script.async = true
    script.onload = () => {
      if (window.IMP) resolve(window.IMP)
      else reject(new Error('PortOne SDK 로드에 실패했습니다.'))
    }
    script.onerror = () => reject(new Error('PortOne SDK 스크립트를 불러오지 못했습니다.'))
    document.head.appendChild(script)
  })

  return loadPromise
}

async function requestPay(
  impCode: string,
  params: ImpRequestPayParams,
): Promise<ImpResponse> {
  const IMP = await loadPortOneSdk()
  IMP.init(impCode)

  return new Promise((resolve, reject) => {
    IMP.request_pay(params, (rsp) => {
      if (rsp.success || rsp.imp_uid) {
        resolve(rsp)
      } else {
        reject(new Error(rsp.error_msg || '결제가 취소되었거나 실패했습니다.'))
      }
    })
  })
}

async function requestPayWithMobileRedirect(
  impCode: string,
  params: ImpRequestPayParams,
  mobileOptions?: Partial<ImpRequestPayParams>,
): Promise<PortOneBillingResult> {
  if (isMobileDevice()) {
    const IMP = await loadPortOneSdk()
    IMP.init(impCode)
    IMP.request_pay({
      ...params,
      ...mobileOptions,
      m_redirect_url: params.m_redirect_url ?? redirectUrl(),
    })
    return { redirect: true }
  }
  return requestPay(impCode, params)
}

export async function requestKakaoBilling(params: {
  impCode: string
  channelKey?: string
  pg: string
  merchantUid: string
  customerUid: string
  amount: number
  orderName: string
  buyerName?: string
  buyerTel?: string
  noticeUrl?: string
}): Promise<PortOneBillingResult> {
  const payParams: ImpRequestPayParams = {
    ...pgParams(params.channelKey, params.pg),
    merchant_uid: params.merchantUid,
    name: params.orderName,
    amount: params.amount,
    customer_uid: params.customerUid,
    buyer_name: params.buyerName,
    buyer_tel: params.buyerTel ?? '01000000000',
    m_redirect_url: redirectUrl(),
    ...(params.noticeUrl ? { notice_url: params.noticeUrl } : {}),
  }

  return requestPayWithMobileRedirect(params.impCode, payParams, {
    kakaopayMobileAsPC: false,
  })
}

export async function requestTossBilling(params: {
  impCode: string
  channelKey?: string
  pg: string
  merchantUid: string
  customerUid: string
  customerId: string
  amount: number
  orderName: string
  buyerName?: string
  buyerTel?: string
  noticeUrl?: string
}): Promise<PortOneBillingResult> {
  const payParams: ImpRequestPayParams = {
    ...pgParams(params.channelKey, params.pg),
    pay_method: 'tosspay',
    merchant_uid: params.merchantUid,
    name: params.orderName,
    amount: params.amount,
    customer_uid: params.customerUid,
    customer_id: params.customerId,
    buyer_name: params.buyerName,
    buyer_tel: params.buyerTel ?? '01000000000',
    m_redirect_url: redirectUrl(),
    card: { useInstallment: false },
    ...(params.noticeUrl ? { notice_url: params.noticeUrl } : {}),
  }

  return requestPayWithMobileRedirect(params.impCode, payParams)
}

// --- 추후 오픈: 네이버페이 ---
// export async function requestNaverBilling(params: {
//   impCode: string
//   channelKey?: string
//   pg: string
//   merchantUid: string
//   customerUid: string
//   amount: number
//   orderName: string
//   buyerName?: string
//   buyerTel: string
//   naverProductCode: string
//   noticeUrl?: string
// }): Promise<PortOneBillingResult> {
//   const payParams: ImpRequestPayParams = {
//     ...pgParams(params.channelKey, params.pg),
//     customer_uid: params.customerUid,
//     merchant_uid: params.merchantUid,
//     name: params.orderName,
//     amount: params.amount,
//     buyer_name: params.buyerName,
//     buyer_tel: params.buyerTel,
//     buyer_addr: '서울특별시',
//     buyer_postcode: '00000',
//     naverProductCode: params.naverProductCode,
//     naverProductCount: 1,
//     naverPopupMode: !isMobileDevice(),
//     m_redirect_url: redirectUrl(),
//     ...(params.noticeUrl ? { notice_url: params.noticeUrl } : {}),
//   }
//   return requestPayWithMobileRedirect(params.impCode, payParams)
// }

export async function requestAccountBilling(params: {
  impCode: string
  channelKey?: string
  pg: string
  merchantUid: string
  customerUid: string
  amount: number
  orderName: string
  buyerName?: string
  buyerTel: string
  noticeUrl?: string
}): Promise<PortOneBillingResult> {
  const payParams: ImpRequestPayParams = {
    ...pgParams(params.channelKey, params.pg),
    pay_method: 'trans',
    merchant_uid: params.merchantUid,
    name: params.orderName,
    amount: params.amount,
    customer_uid: params.customerUid,
    buyer_name: params.buyerName,
    buyer_tel: params.buyerTel,
    buyer_addr: '서울특별시',
    m_redirect_url: redirectUrl(),
    bypass: {
      settle: {
        addDeductionYn: 'N',
        criPsblYn: 'N',
      },
    },
    ...(params.noticeUrl ? { notice_url: params.noticeUrl } : {}),
  }

  return requestPayWithMobileRedirect(params.impCode, payParams)
}

export async function requestPhoneBilling(params: {
  impCode: string
  channelKey?: string
  pg: string
  merchantUid: string
  customerUid: string
  amount: number
  orderName: string
  phoneNumber: string
  buyerName?: string
  noticeUrl?: string
}): Promise<PortOneBillingResult> {
  const from = new Date()
  const to = new Date()
  to.setMonth(to.getMonth() + 1)

  const payParams: ImpRequestPayParams = {
    ...pgParams(params.channelKey, params.pg),
    pay_method: 'phone',
    merchant_uid: params.merchantUid,
    name: params.orderName,
    amount: params.amount,
    customer_uid: params.customerUid,
    buyer_tel: params.phoneNumber,
    buyer_name: params.buyerName,
    company: '경제인뉴스',
    period: {
      from: formatYmd(from),
      to: formatYmd(to),
      text: '매월 정기 후원',
    },
    m_redirect_url: redirectUrl(),
    ...(params.noticeUrl ? { notice_url: params.noticeUrl } : {}),
  }

  return requestPayWithMobileRedirect(params.impCode, payParams)
}
