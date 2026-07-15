import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { getApiErrorMessage } from '../lib/errors'

/**
 * 모바일 결제 후 m_redirect_url 로 돌아오는 페이지.
 * 쿼리: imp_uid, merchant_uid, error_code, error_msg 등
 */
export default function SupportPortOneReturnPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    const impUid = params.get('imp_uid')
    const merchantUid = params.get('merchant_uid')
    const errorCode = params.get('error_code')
    const errorMsg = params.get('error_msg')

    if (errorCode || !impUid || !merchantUid) {
      setError(errorMsg || '결제가 취소되었거나 실패했습니다.')
      return
    }

    let cancelled = false
    api
      .post('/subscriptions/complete', { impUid, merchantUid })
      .then(() => {
        if (!cancelled) navigate('/support/complete', { replace: true })
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getApiErrorMessage(err, '결제 확인에 실패했습니다.'))
        }
      })

    return () => {
      cancelled = true
    }
  }, [params, navigate])

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-sm text-flash-600">{error}</p>
        <Link
          to="/support"
          className="mt-6 inline-block text-sm font-semibold text-ink-700 underline"
        >
          후원 페이지로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center text-sm text-ink-500">
      결제 확인 중…
    </div>
  )
}
