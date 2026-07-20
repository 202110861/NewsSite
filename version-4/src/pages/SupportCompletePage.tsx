import { Link } from 'react-router-dom'

export default function SupportCompletePage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
      <div className="rounded-xl border border-ink-900/10 bg-paper-100 px-6 py-10">
        <p className="text-sm font-semibold text-gold-600">후원 완료</p>
        <h1 className="mt-3 text-2xl font-bold text-ink-900">구독이 시작되었습니다</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-600">
          경제인뉴스를 후원해 주셔서 감사합니다. <br /> 매월 휴대폰 요금과 함께 정기 결제됩니다.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-lg bg-flash-600 px-6 py-3 text-sm font-bold text-white hover:bg-flash-700"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
