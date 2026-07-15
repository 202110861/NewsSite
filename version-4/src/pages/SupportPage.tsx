import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, type SubscriptionPlan } from '../lib/api'
import { getApiErrorMessage } from '../lib/errors'
import { requestPhoneBilling } from '../lib/portone'
import { useAuth } from '../context/AuthContext'

interface StartPaymentResult {
  subscriptionId: string
  merchantUid: string
  customerUid: string
  amount: number
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
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api
      .get<SubscriptionPlan[]>('/subscriptions/plans')
      .then((data) => {
        setPlans(data)
        if (data[0]) setSelectedPlanId(data[0].id)
      })
      .catch(() => setError('플랜을 불러오지 못했습니다.'))
      .finally(() => setLoading(false))
  }, [])

  const selectedPlan = plans.find((p) => p.id === selectedPlanId)

  async function handleStartPayment() {
    setError('')
    if (!selectedPlanId) {
      setError('후원 플랜을 선택해 주세요.')
      return
    }
    if (!phoneNumber.trim()) {
      setError('휴대폰 번호를 입력해 주세요.')
      return
    }

    setSubmitting(true)
    try {
      const started = await api.post<StartPaymentResult>('/subscriptions', {
        planId: selectedPlanId,
        phoneNumber: phoneNumber.replace(/-/g, ''),
      })

      const rsp = await requestPhoneBilling({
        impCode: started.impCode,
        channelKey: started.channelKey,
        pg: started.pg,
        merchantUid: started.merchantUid,
        customerUid: started.customerUid,
        amount: started.amount,
        orderName: started.orderName,
        phoneNumber: started.phoneNumber,
        buyerName: user?.username,
      })

      if (!rsp.imp_uid || !rsp.merchant_uid) {
        throw new Error('결제 정보가 올바르지 않습니다.')
      }

      await api.post('/subscriptions/complete', {
        impUid: rsp.imp_uid,
        merchantUid: rsp.merchant_uid,
      })
      navigate('/support/complete')
    } catch (err) {
      setError(getApiErrorMessage(err, '결제 요청에 실패했습니다.'))
    } finally {
      setSubmitting(false)
    }
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
        핸드폰 요금으로 매월 정기 후원할 수 있습니다. 결제일은 가입일 기준이며,
        해지 시 즉시 중단됩니다.
      </p>

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
        <label htmlFor="phone" className="block text-sm font-semibold text-ink-700">
          휴대폰 번호
        </label>
        <input
          id="phone"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="01012345678"
          className="mt-1.5 w-full rounded-lg border border-ink-900/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-flash-600"
        />
      </div>

      {error && <p className="mt-4 text-sm text-flash-600">{error}</p>}

      <button
        type="button"
        onClick={handleStartPayment}
        disabled={submitting}
        className="mt-6 w-full rounded-lg bg-gold-600 py-3 text-sm font-bold text-white hover:bg-gold-500 disabled:opacity-60"
      >
        {submitting
          ? '결제 진행 중…'
          : selectedPlan
            ? `${selectedPlan.amount.toLocaleString('ko-KR')}원 결제하기`
            : '결제하기'}
      </button>
    </div>
  )
}
