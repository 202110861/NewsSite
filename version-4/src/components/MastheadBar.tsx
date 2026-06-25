import { formatMastheadDate } from '../utils/format'

export default function MastheadBar() {
  return (
    <div className="border-b border-ink-900/10 bg-paper-100 text-[11px] text-ink-500">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5 sm:px-6">
        <span className="font-mono tracking-tight">{formatMastheadDate()} 마감</span>
        <nav className="flex items-center gap-3">
          <a href="#" className="hover:text-ink-900">
            RSS
          </a>
          <span className="text-ink-300">|</span>
          <a href="#" className="hover:text-ink-900">
            로그인
          </a>
          <span className="text-ink-300">|</span>
          <a href="#" className="hover:text-ink-900">
            전체기사
          </a>
        </nav>
      </div>
    </div>
  )
}
