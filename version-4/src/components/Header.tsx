import { Link } from "react-router-dom";
import { MastheadLinks } from "./MastheadBar";

interface HeaderProps {
  mobileNavOpen: boolean;
  onToggleMobileNav: () => void;
}

export default function Header({
  mobileNavOpen,
  onToggleMobileNav,
}: HeaderProps) {
  return (
    <div className="relative border-b border-ink-900/10 bg-paper-50 lg:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-baseline gap-2 py-2">
          <img src="/logo.png" alt="경제인뉴스" className="w-28 sm:w-35" />
        </Link>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3 absolute right-6">
          {/* <MastheadLinks
            className="flex min-w-0 shrink items-center gap-1.5 overflow-hidden text-[11px] text-ink-500 sm:gap-2"
            linkClassName="whitespace-nowrap hover:text-ink-900"
            separatorClassName="text-ink-300"
          /> */}
          <button
            type="button"
            aria-label="메뉴 열기"
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-category-nav"
            onClick={onToggleMobileNav}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-ink-900 hover:bg-ink-900/5"
          >
            <HamburgerIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
