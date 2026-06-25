export default function Footer() {
  return (
    <footer className="border-t border-ink-900/10 bg-ink-900 text-paper-200">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-display text-lg font-black text-white">
              데일리<span className="text-flash-600">가판대</span>
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-paper-200/70">
              경기도 성남시 분당구 서현동 ㅣ 대표전화 031-708-3799 ㅣ 팩스 031-601-8799
              <br />
              Copyright © 2026 데일리가판대. All rights reserved.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-paper-200/80">
            <a href="#" className="hover:text-white">
              개인보호정책
            </a>
            <a href="#" className="hover:text-white">
              회사소개
            </a>
            <a href="#" className="hover:text-white">
              광고/제휴 안내
            </a>
            <a href="#" className="hover:text-white">
              기사제보
            </a>
            <a href="#" className="hover:text-white">
              보도자료
            </a>
            <a href="#" className="hover:text-white">
              기사검색
            </a>
          </nav>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-paper-200/50">
          <span>Made with React · TypeScript · Tailwind CSS</span>
          <a href="#top" className="rounded-full border border-white/15 px-3 py-1 hover:border-white hover:text-white">
            맨 위로 ↑
          </a>
        </div>
      </div>
    </footer>
  )
}
