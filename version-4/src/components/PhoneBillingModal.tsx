import { useState } from 'react'

interface PhoneBillingModalProps {
  open: boolean
  amount: number
  phoneNumber: string
  onClose: () => void
  onComplete: (authCode: string) => Promise<void>
}

export default function PhoneBillingModal({
  open,
  amount,
  phoneNumber,
  onClose,
  onComplete,
}: PhoneBillingModalProps) {
  const [authCode, setAuthCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (authCode.length < 4) {
      setError('인증번호 4자리 이상을 입력해 주세요.')
      return
    }
    setSubmitting(true)
    try {
      await onComplete(authCode)
      setAuthCode('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '결제 인증에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-ink-900/10 bg-paper-50 p-6 shadow-xl">
        <h2 className="text-lg font-bold text-ink-900">휴대폰 소액결제 인증</h2>
        <p className="mt-2 text-sm text-ink-600">
          {phoneNumber} 번호로 {amount.toLocaleString('ko-KR')}원 결제를 진행합니다.
        </p>
        <p className="mt-1 text-xs text-ink-500">
          (Mock) 인증번호는 아무 4자리 이상 숫자를 입력하세요.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="authCode" className="block text-sm font-semibold text-ink-700">
              인증번호
            </label>
            <input
              id="authCode"
              type="text"
              inputMode="numeric"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-ink-900/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-flash-600"
              placeholder="1234"
            />
          </div>

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
              className="flex-1 rounded-lg bg-flash-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-flash-700 disabled:opacity-60"
            >
              {submitting ? '처리 중...' : '결제하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
