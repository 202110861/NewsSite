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
  pay_method: string
  merchant_uid: string
  name: string
  amount: number
  customer_uid: string
  buyer_tel: string
  buyer_name?: string
  company?: string
  period?: { from: string; to: string; text?: string }
  m_redirect_url?: string
  notice_url?: string
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

function formatYmd(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}${m}${d}`
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
}): Promise<ImpResponse> {
  const IMP = await loadPortOneSdk()
  IMP.init(params.impCode)

  const from = new Date()
  const to = new Date()
  to.setMonth(to.getMonth() + 1)

  const redirectBase = window.location.origin

  return new Promise((resolve, reject) => {
    IMP.request_pay(
      {
        ...(params.channelKey
          ? { channelKey: params.channelKey }
          : { pg: params.pg }),
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
        m_redirect_url: `${redirectBase}/support/portone-return`,
      },
      (rsp) => {
        if (rsp.success || rsp.imp_uid) {
          resolve(rsp)
        } else {
          reject(new Error(rsp.error_msg || '결제가 취소되었거나 실패했습니다.'))
        }
      },
    )
  })
}
