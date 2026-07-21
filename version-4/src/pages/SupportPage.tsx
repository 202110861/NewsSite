import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MockPaymentModal from '../components/MockPaymentModal'
import {
  api,
  isComingSoonPayMethod,
  PAY_METHOD_COMING_SOON_MESSAGE,
  PAY_METHOD_LABELS,
  PAY_METHOD_ROWS,
  type DisplayPayMethod,
  type PaymentConfig,
  type PayMethod,
  type SubscriptionPlan,
} from '../lib/api'


/** 결제 수단 브랜드 컬러 (배경 · 글자 · 테두리) */
const PAY_METHOD_BRAND: Record<
  DisplayPayMethod,
  { bg: string; text: string; border: string; badge: string; selectedRing: string }
> = {
  PHONE: {
    bg: 'bg-[#00A3E0]',
    text: 'text-white',
    border: 'border-[#0090C5]',
    badge: 'text-white/80',
    selectedRing: 'ring-2 ring-[#0077A8] ring-offset-2',
  },
  TOSS_PAY: {
    bg: 'bg-[#0064FF]',
    text: 'text-white',
    border: 'border-[#0050CC]',
    badge: 'text-white/80',
    selectedRing: 'ring-2 ring-[#0047B3] ring-offset-2',
  },
  KAKAO_PAY: {
    bg: 'bg-[#FEE500]',
    text: 'text-[#191919]',
    border: 'border-[#E5CF00]',
    badge: 'text-[#191919]/70',
    selectedRing: 'ring-2 ring-[#191919] ring-offset-2',
  },
}
import { getApiErrorMessage } from '../lib/errors'
import {
  // requestAccountBilling, // 추후: 케이뱅크·카카오뱅크
  requestKakaoBilling,
  // requestNaverBilling, // 추후: 네이버페이
  requestTossBilling,
  // requestPhoneBilling, // 추후: 휴대폰(다날)
} from '../lib/portone'
import { useAuth } from '../context/AuthContext'

/** 결제 수단 브랜드 컬러 (배경 · 글자 · 테두리) */
const PAY_METHOD_BRAND: Record<
  DisplayPayMethod,
  { bg: string; text: string; border: string; badge: string; selectedRing: string }
> = {
  PHONE: {
    bg: 'bg-[#00A3E0]',
    text: 'text-white',
    border: 'border-[#0090C5]',
    badge: 'text-white/80',
    selectedRing: 'ring-2 ring-[#0077A8] ring-offset-2',
  },
  TOSS_PAY: {
    bg: 'bg-[#0064FF]',
    text: 'text-white',
    border: 'border-[#0050CC]',
    badge: 'text-white/80',
    selectedRing: 'ring-2 ring-[#0047B3] ring-offset-2',
  },
  KAKAO_PAY: {
    bg: 'bg-[#FEE500]',
    text: 'text-[#191919]',
    border: 'border-[#E5CF00]',
    badge: 'text-[#191919]/70',
    selectedRing: 'ring-2 ring-[#191919] ring-offset-2',
  },
}

interface StartPaymentResult {
  subscriptionId: string
  paymentMode: PaymentConfig['paymentMode']
  payMethod: PayMethod
  merchantUid: string
  customerUid: string
  customerId: string
  amount: number
  billingAmount: number
  orderName: string
  phoneNumber: string
  impCode: string
  channelKey?: string
  pg: string
}

export default function SupportPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    paymentMode: 'mock',
    kakaoTestUsesZeroAmount: false,
    accountTestUsesZeroAmount: false,
    webhookUrl: undefined,
  })
  const [payMethod, setPayMethod] = useState<DisplayPayMethod>('PHONE')
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [mockModalOpen, setMockModalOpen] = useState(false)
  const [pendingPayment, setPendingPayment] = useState<StartPaymentResult | null>(null)

  useEffect(() => {
    Promise.all([
      api.get<SubscriptionPlan[]>('/subscriptions/plans'),
      api.get<PaymentConfig>('/subscriptions/config'),
    ])
      .then(([planList, config]) => {
        setPlans(planList)
        setPaymentConfig(config)
        if (planList[0]) setSelectedPlanId(planList[0].id)
      })
      .catch(() => setError('플랜을 불러오지 못했습니다.'))
      .finally(() => setLoading(false))
  }, [])

  const selectedPlan = plans.find((p) => p.id === selectedPlanId)
  const isMockMode = paymentConfig.paymentMode === 'mock'
  const paymentUnavailable = isComingSoonPayMethod(payMethod)
  const comingSoonMessage = paymentUnavailable
    ? PAY_METHOD_COMING_SOON_MESSAGE[payMethod]
    : null

  async function finalizePortOnePayment(impUid: string, merchantUid: string) {
    await api.post('/subscriptions/complete', { impUid, merchantUid })
    navigate('/support/complete')
  }

  async function handleStartPayment() {
    setError('')
    if (paymentUnavailable) {
      setError(comingSoonMessage || '해당 결제 수단은 현재 이용할 수 없습니다.')
      return
    }
    if (!selectedPlanId) {
      setError('후원 플랜을 선택해 주세요.')
      return
    }

    setSubmitting(true)
    try {
      const started = await api.post<StartPaymentResult>('/subscriptions', {
        planId: selectedPlanId,
        payMethod,
      })

      if (started.paymentMode === 'mock') {
        setPendingPayment(started)
        setMockModalOpen(true)
        return
      }

      const noticeUrl = paymentConfig.webhookUrl
      const billingAmount = started.billingAmount

      const rsp =
        started.payMethod === 'KAKAO_PAY'
          ? await requestKakaoBilling({
              impCode: started.impCode,
              channelKey: started.channelKey,
              pg: started.pg,
              merchantUid: started.merchantUid,
              customerUid: started.customerUid,
              amount: billingAmount,
              orderName: started.orderName,
              buyerName: user?.username,
              buyerTel: started.phoneNumber || undefined,
              noticeUrl,
            })
          : await requestTossBilling({
              impCode: started.impCode,
              channelKey: started.channelKey,
              pg: started.pg,
              merchantUid: started.merchantUid,
              customerUid: started.customerUid,
              customerId: started.customerId,
              amount: billingAmount,
              orderName: started.orderName,
              buyerName: user?.username,
              noticeUrl,
            })

      // --- 추후 오픈 ---
      // : await requestNaverBilling({ ... })
      // : await requestAccountBilling({ ... })
      // : await requestPhoneBilling({ ... })

      if ('redirect' in rsp && rsp.redirect) {
        return
      }

      if (!('imp_uid' in rsp) || !rsp.imp_uid || !rsp.merchant_uid) {
        throw new Error('결제 정보가 올바르지 않습니다.')
      }

      await finalizePortOnePayment(rsp.imp_uid, rsp.merchant_uid)
    } catch (err) {
      setError(getApiErrorMessage(err, '결제 요청에 실패했습니다.'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleMockComplete(authCode: string) {
    if (!pendingPayment) return
    await api.post('/subscriptions/callback', {
      paymentId: pendingPayment.merchantUid,
      authCode,
    })
    setMockModalOpen(false)
    setPendingPayment(null)
    navigate('/support/complete')
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-ink-500">
        플랜 불러오는 중...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-ink-900">후원 구독</h1>
      <p className="mt-2 text-sm text-ink-600">
        휴대폰·토스페이·카카오페이로 매월 정기 후원할 수 있습니다. 결제일은 가입일
        기준이며, 해지 시 즉시 중단됩니다.
      </p>

      {isMockMode && (
        <p className="mt-3 rounded-lg border border-gold-500/30 bg-gold-100/30 px-3 py-2 text-xs text-ink-600">
          현재 <strong>테스트 결제 모드</strong>입니다. 실제 요금이 청구되지 않습니다.
        </p>
      )}

      {paymentConfig.paymentMode === 'portone_test' && (
        <p className="mt-3 rounded-lg border border-flash-600/20 bg-flash-100/20 px-3 py-2 text-xs text-ink-600">
          PortOne <strong>테스트 연동</strong> 모드입니다. 결제창 검증용으로 사용할 수
          있습니다.
        </p>
      )}

      {paymentConfig.paymentMode !== 'mock' && !paymentConfig.webhookUrl && (
        <p className="mt-3 rounded-lg border border-gold-500/30 bg-gold-100/30 px-3 py-2 text-xs text-ink-600">
          정기결제 웹훅 URL이 설정되지 않았습니다. <code>server/.env</code>에{' '}
          <code>API_PUBLIC_URL</code>(ngrok 등)을 추가하고 서버를 재시작하세요.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {plans.map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => setSelectedPlanId(plan.id)}
            className={`rounded-xl border p-5 text-left transition ${
              selectedPlanId === plan.id
                ? 'border-flash-600 bg-flash-100/40'
                : 'border-ink-900/10 bg-white hover:border-gold-500/40'
            }`}
          >
            <p className="text-sm font-semibold text-ink-700">{plan.label}</p>
            <p className="mt-2 text-xl font-bold text-ink-900">
              {plan.amount.toLocaleString('ko-KR')}원
              <span className="text-sm font-normal text-ink-500">/월</span>
            </p>
          </button>
        ))}
      </div>

      <div className="mt-8">
        <p className="text-sm font-semibold text-ink-700">결제 수단</p>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
          {PAY_METHOD_ROWS.flat().map((method) => {
            const selected = payMethod === method
            const comingSoon = isComingSoonPayMethod(method)
            const brand = PAY_METHOD_BRAND[method as DisplayPayMethod]
            return (
              <button
                key={method}
                type="button"
                onClick={() => setPayMethod(method as DisplayPayMethod)}
                className={`aspect-square w-full h-2/3 rounded-xl border p-2 sm:p-3 transition ${brand.bg} ${brand.text} ${brand.border} ${
                  selected ? brand.selectedRing : 'hover:opacity-90'
                }`}
              >
                <span className="flex h-full flex-col items-center justify-center gap-1.5 text-center">
                  <span className="text-xs font-semibold leading-snug sm:text-sm">
                    {PAY_METHOD_LABELS[method]}
                  </span>
                  {comingSoon && (
                    <span
                      className={`text-[10px] font-medium leading-tight sm:text-[11px] ${brand.badge}`}
                    >
                      심사·연동 중
                    </span>
                  )}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {comingSoonMessage && (
        <p className="mt-6 rounded-lg border border-ink-900/10 bg-ink-50 px-4 py-3 text-sm text-ink-600">
          {comingSoonMessage}
        </p>
      )}

      {error && <p className="mt-4 text-sm text-flash-600">{error}</p>}

      <button
        type="button"
        onClick={handleStartPayment}
        disabled={submitting || paymentUnavailable || !selectedPlan}
        className="mt-6 w-full rounded-lg bg-gold-600 py-3 text-sm font-bold text-white hover:bg-gold-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {paymentUnavailable
          ? '준비 중 — 곧 이용 가능'
          : submitting
            ? '결제 진행 중…'
            : selectedPlan
              ? `${selectedPlan.amount.toLocaleString('ko-KR')}원 결제하기`
              : '결제하기'}
      </button>

      <MockPaymentModal
        open={mockModalOpen}
        payMethod={pendingPayment?.payMethod ?? payMethod}
        amount={pendingPayment?.amount ?? 0}
        onClose={() => {
          setMockModalOpen(false)
          setPendingPayment(null)
        }}
        onComplete={handleMockComplete}
      />
    </div>
  )
}
