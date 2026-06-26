export default function Footer() {
  return (
    <footer className="border-t border-ink-900/10 bg-ink-900 text-paper-200">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="">
              <img src="/logo(white).png" alt="logo" className="w-35 " />
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-paper-200/70">
              경제인뉴스 : 연수구 인천타워대로 185 센트럴비즈한라 ㅣ 대표전화 :
              02-1800-3747 ㅣ사업자번호 : 204-86-50557
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-paper-200/80">
            {/* <a href="#" className="hover:text-white">
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
            </a> */}
          </nav>
        </div>

        <div className="mt-8 flex items-center justify-end border-t border-white/10 pt-5 text-xs text-paper-200/50">
          <a
            href="#top"
            className="rounded-full border border-white/15 px-3 py-1 hover:border-white hover:text-white"
          >
            맨 위로 ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
