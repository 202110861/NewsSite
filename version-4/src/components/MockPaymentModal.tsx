import { useState } from 'react'
import type { PayMethod } from '../lib/api'
import { PAY_METHOD_LABELS } from '../lib/api'

interface MockPaymentModalProps {
  open: boolean
  payMethod: PayMethod
  amount: number
  onClose: () => void
  onComplete: (authCode: string) => Promise<void>
}

export default function MockPaymentModal({
  open,
  payMethod,
  amount,
  onClose,
  onComplete,
}: MockPaymentModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const isWallet =
    payMethod === 'KAKAO_PAY' ||
    payMethod === 'TOSS_PAY' ||
    // payMethod === 'NAVER_PAY' ||
    payMethod === 'K_BANK' ||
    payMethod === 'KAKAO_BANK'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await onComplete(`${payMethod.toLowerCase()}-mock-ok`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '결제 인증에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-ink-900/10 bg-paper-50 p-6 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">
          테스트 결제 (Mock)
        </p>
        <h2 className="mt-1 text-lg font-bold text-ink-900">
          {PAY_METHOD_LABELS[payMethod]} 인증
        </h2>
        <p className="mt-2 text-sm text-ink-600">
          {isWallet
            ? `${PAY_METHOD_LABELS[payMethod]}로 ${amount.toLocaleString('ko-KR')}원 정기 후원을 진행합니다.`
            : `${amount.toLocaleString('ko-KR')}원 결제를 진행합니다.`}
        </p>
        <p className="mt-1 text-xs text-ink-500">
          실제 결제가 발생하지 않습니다. 아래 버튼을 누르면 테스트 결제가 완료됩니다.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && <p className="text-sm text-flash-600">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-ink-900/15 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-paper-100"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${
                payMethod === 'KAKAO_PAY'
                  ? 'bg-[#FEE500] text-[#333333] hover:brightness-95'
                  : 'bg-flash-600 hover:bg-flash-700'
              }`}
            >
              {submitting ? '처리 중...' : `${PAY_METHOD_LABELS[payMethod]} 테스트 결제`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
