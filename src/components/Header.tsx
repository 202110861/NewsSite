import { useState } from "react";
import { SECTIONS } from "../data/newsData";
import { PLACEHOLDER_LOGO } from "../utils/placeholders";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="relative border-b border-black">
      <div className="hidden sm:block border-t border-gray-200 h-[35px]">
        <div className="max-w-[1280px] mx-auto h-[35px] flex items-center justify-between text-xs text-gray-500 px-3">
          <span>
            <a href="#top" className="text-gray-500 no-underline hover:text-blue-600">
              시작페이지로
            </a>{" "}
            l{" "}
            <a href="#top" className="text-gray-500 no-underline hover:text-blue-600">
              즐겨찾기
            </a>{" "}
            l{" "}
            <a href="#top" className="text-gray-500 no-underline hover:text-blue-600">
              RSS
            </a>{" "}
            l <span className="text-gray-500">편집 2021.10.19 [17:31]</span>
          </span>
          <span>
            <a href="#top" className="text-blue-600 font-medium no-underline">
              전체기사
            </a>{" "}
            l{" "}
            <a href="#top" className="text-gray-500 no-underline hover:text-blue-600">
              로그인
            </a>{" "}
            l{" "}
            <a href="#top" className="text-gray-500 no-underline hover:text-blue-600">
              ID/PW 찾기
            </a>
          </span>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto py-2.5 sm:py-3.5 px-3 flex justify-center">
        <a href="#top">
          <img
            src={PLACEHOLDER_LOGO}
            alt="로고"
            className="block h-9 sm:h-auto w-auto"
          />
        </a>
      </div>

      <div className="relative border-t-2 border-black border-b border-black">
        <button
          aria-label="전체메뉴"
          onClick={() => setMenuOpen((v) => !v)}
          className="absolute left-0 top-0 w-12 sm:w-[50px] h-12 sm:h-[50px] bg-transparent border-none border-r border-gray-100 cursor-pointer text-black flex items-center justify-center hover:bg-gray-50"
        >
          <i className="ti ti-menu-2" aria-hidden="true" style={{ fontSize: 22 }} />
        </button>

        <ul className="hidden lg:flex list-none m-0 p-0 justify-center h-[50px] overflow-hidden">
          {SECTIONS.map((s) => (
            <li key={s.id} className="flex items-center px-5">
              <a
                href={`#${s.id}`}
                className="font-medium text-base text-black no-underline tracking-tight hover:text-blue-600"
              >
                {s.name}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex lg:hidden items-center justify-center h-12 px-14">
          <span className="text-sm font-medium text-gray-700 truncate">
            데일리 뉴스
          </span>
        </div>

        <button
          aria-label="검색"
          onClick={() => setSearchOpen((v) => !v)}
          className="absolute right-0 top-0 w-12 sm:w-[50px] h-12 sm:h-[50px] bg-blue-600 border-none text-white cursor-pointer flex items-center justify-center hover:bg-blue-700"
        >
          <i className="ti ti-search" aria-hidden="true" style={{ fontSize: 18 }} />
        </button>

        {searchOpen && (
          <div className="absolute right-12 sm:right-[50px] top-2 sm:top-[9px] h-8 flex border border-gray-500 bg-white z-10 max-w-[calc(100vw-7rem)]">
            <input
              type="text"
              placeholder="검색어"
              className="w-28 sm:w-[140px] border-none px-2 text-[13px] outline-none"
            />
            <button
              className="w-[30px] shrink-0 bg-blue-600 border-none text-white cursor-pointer flex items-center justify-center hover:bg-blue-700"
              aria-label="검색 실행"
            >
              <i className="ti ti-search" aria-hidden="true" style={{ fontSize: 16 }} />
            </button>
          </div>
        )}
      </div>

      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-gray-100 z-50 p-5 sm:p-7 max-h-[70vh] overflow-y-auto">
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-2 right-2 sm:-top-[51px] sm:left-0 sm:right-auto w-10 sm:w-[50px] h-10 sm:h-[50px] bg-white border border-gray-100 cursor-pointer flex items-center justify-center hover:bg-gray-50"
            aria-label="닫기"
          >
            <i className="ti ti-x" aria-hidden="true" style={{ fontSize: 18 }} />
          </button>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-[1280px] mx-auto pt-8 sm:pt-0">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setMenuOpen(false)}
                className="font-medium text-base text-black no-underline block py-1"
              >
                {s.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
