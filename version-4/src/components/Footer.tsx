import { useEffect, useLayoutEffect, useState } from "react";

const VIEW_MODE_KEY = "newsin-view-mode";
const MOBILE_VIEWPORT = "width=device-width, initial-scale=1.0";
const DESKTOP_VIEWPORT = "width=1280";

type ViewMode = "mobile" | "desktop";

function readStoredViewMode(): ViewMode {
  try {
    return localStorage.getItem(VIEW_MODE_KEY) === "desktop"
      ? "desktop"
      : "mobile";
  } catch {
    return "mobile";
  }
}

function applyViewport(mode: ViewMode) {
  const meta = document.querySelector('meta[name="viewport"]');
  if (!meta) return;
  meta.setAttribute(
    "content",
    mode === "desktop" ? DESKTOP_VIEWPORT : MOBILE_VIEWPORT,
  );
}

function isCompactDevice() {
  return window.screen.width < 1024;
}

export default function Footer() {
  return (
    <>
      <footer className="border-t border-ink-900/10 bg-ink-900 text-paper-200">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="">
                <img src="/logo(white).png" alt="logo" className="w-35 " />
              </div>
              <p className="mt-3 flex max-w-2xl flex-wrap gap-y-1 text-sm leading-relaxed text-paper-200/70 [&>span]:shrink-0">
                <span>
                  경제인뉴스 : 경기 김포시 통진읍 애기봉로 681번길 87-29 ㅣ
                </span>
                <span>대표전화 : 02-1800-3747 ㅣ</span>
                <span>사업자번호 : 204-86-50557 ㅣ</span>
                <span>등록번호 : 경기,아52459 ㅣ</span>
                <span>등록일자 : 2020.01.17 ㅣ</span>
                <span>발행일자 : 2020.01.17 ㅣ</span>
                <span>발행인 : 신홍태 ㅣ 편집인 : 신홍태 | </span>
                <span className="cursor-pointer">
                  청소년보호정책(책임자 : 신홍태)
                </span>
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

          <div className="mt-8 border-t border-white/10 pt-5 text-xs text-paper-200/50">
            <ViewModeToggle />
          </div>
        </div>
      </footer>

      <ScrollToTopFab />
    </>
  );
}

function ViewModeToggle() {
  const [mode, setMode] = useState<ViewMode>("mobile");
  const [showToggle, setShowToggle] = useState(false);

  useLayoutEffect(() => {
    const stored = readStoredViewMode();
    setMode(stored);
    applyViewport(stored);
    setShowToggle(stored === "desktop" || isCompactDevice());
  }, []);

  function toggle() {
    const next: ViewMode = mode === "desktop" ? "mobile" : "desktop";
    setMode(next);
    applyViewport(next);
    try {
      localStorage.setItem(VIEW_MODE_KEY, next);
    } catch {
      /* ignore */
    }
    setShowToggle(next === "desktop" || isCompactDevice());
  }

  if (!showToggle) return null;

  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={toggle}
        className="rounded-full border border-white/15 px-3 py-1.5 text-paper-200/70 transition hover:border-white hover:text-white"
      >
        {mode === "desktop" ? "모바일버전" : "PC버전"}
      </button>
    </div>
  );
}

function ScrollToTopFab() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function updateVisibility() {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      setVisible(maxScroll > 0 && window.scrollY >= maxScroll * 0.5);
    }

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);
    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, []);

  return (
    <button
      type="button"
      aria-label="맨 위로"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed right-4 bottom-4 z-40 rounded-full border border-ink-900/10 bg-ink-900 px-3.5 py-2.5 text-xs font-semibold text-white shadow-lg transition-all duration-300 hover:bg-flash-600 sm:right-6 sm:bottom-6 ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      맨 위로 ↑
    </button>
  );
}
