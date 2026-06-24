// Tailwind CSS v3.3+ 필요 (line-clamp-2가 코어 유틸리티로 내장된 버전)
// v3.3 미만이라면 @tailwindcss/line-clamp 플러그인을 tailwind.config.js의 plugins에 추가하세요.
// 반응형 브레이크포인트: 기본(모바일, <640px) / sm(태블릿, ≥640px) / lg(데스크탑, ≥1024px)
import React, { useState, useEffect, useRef } from "react";

const PLACEHOLDER_LOGO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='60'>
      <rect width='260' height='60' fill='#ffffff'/>
      <text x='10' y='38' font-family='sans-serif' font-size='26' font-weight='bold' fill='#1464E7'>데일리 뉴스</text>
    </svg>`
  );

function imgPlaceholder(w, h, label, bg, fg) {
  const safe = String(label).slice(0, 18);
  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>
        <rect width='${w}' height='${h}' fill='${bg}'/>
        <text x='50%' y='50%' font-family='sans-serif' font-size='13' fill='${fg}' text-anchor='middle' dominant-baseline='middle'>${safe}</text>
      </svg>`
    )
  );
}

const PALETTE = [
  ["#dbe7fb", "#1c3f73"],
  ["#fbe2db", "#7a3219"],
  ["#e3f3df", "#2c5a1d"],
  ["#f6e3f3", "#6b1f57"],
  ["#fdf1cf", "#7a5a0c"],
  ["#e0f3ef", "#0e5a4b"],
];

function ph(w, h, label, idx) {
  const [bg, fg] = PALETTE[idx % PALETTE.length];
  return imgPlaceholder(w, h, label, bg, fg);
}

const SECTIONS = [
  { id: "sc1", name: "사회" },
  { id: "sc2", name: "정치/행정" },
  { id: "sc3", name: "생활/경제" },
  { id: "sc4", name: "국제" },
  { id: "sc5", name: "문화/교육" },
  { id: "sc6", name: "연예/스포츠" },
  { id: "sc7", name: "기획특집" },
  { id: "sc8", name: "오피니언" },
];

const MAIN_SLIDES = [
  {
    id: 21,
    title: "로꼬-유성은, '알함브라 궁전의 추억' OST로 현빈X박신혜 지원사격!",
    img: ph(660, 410, "메인사진 1", 0),
  },
  {
    id: 24,
    title:
      "'신의 퀴즈:리부트' 김재원, 궁금증 폭발 엔딩 장식! 류덕환과 드디어 마주했다!",
    img: ph(660, 410, "메인사진 2", 1),
  },
  {
    id: 22,
    title:
      "'공복자들' 김준현-유민상, 1+1 공포의 특대 베드신 공개! 남다른 특대 3종 세트! 시선집중!",
    img: ph(660, 410, "메인사진 3", 2),
  },
  {
    id: 25,
    title: "'남자친구' 송혜교 눈물 미소, 시청자도 뭉클하게 만든 감성엔딩",
    img: ph(660, 410, "메인사진 4", 3),
  },
  {
    id: 48,
    title: "평화복지관 노원보건소와 생명존중사업 협력(MOU)체결 협약",
    img: ph(660, 410, "메인사진 5", 4),
  },
];

const PHOTO_SLIDES = [
  {
    id: 38,
    title:
      "'해투4' 김법래, '갓뚜기' 함연지에 서운함 토로! \"나 빼고 CF 찍어\" 궁금증 UP",
    img: ph(420, 250, "포토 1", 1),
  },
  {
    id: 45,
    title:
      "'동백꽃 필 무렵' 공효진♡강하늘, 입덕 게이트 오픈! 올가을 이 커플에 빠질 수밖에 없는 이유 셋!",
    img: ph(420, 250, "포토 2", 2),
  },
  {
    id: 25,
    title: "'남자친구' 송혜교 눈물 미소, 시청자도 뭉클하게 만든 감성엔딩",
    img: ph(420, 250, "포토 3", 3),
  },
  {
    id: 21,
    title: "로꼬-유성은, '알함브라 궁전의 추억' OST로 현빈X박신혜 지원사격!",
    img: ph(420, 250, "포토 4", 0),
  },
];

const GRID_NEWS = [
  {
    section: "연예/스포츠",
    id: 23,
    title: "'동물의 사생활' 인피니트 엘, 코 앞에서 만난 혹등고래 '동공지진'",
    body:
      "'은밀하고 위대한 동물의 사생활' 멤버들의 바로 앞에 혹등고래가 나타난다. KBS 2TV '은밀하고 위대한 동물의 사생활'(이하 '동물의 사생활')은 다큐멘터리 제작에 뛰어든 스타들의 모습을 담으며 신선한 재미와 감동을...",
    img: ph(250, 160, "사진", 0),
  },
  {
    section: "사회",
    id: 52,
    title: "아산시약사회, 추석명절 소외이웃 후원물품 전달",
    body:
      "아산시약사회(회장 조성도)는 추석명절을 맞아 지난달 28일 아산시보건소를 방문해 소외이웃과 북한이탈주민 후원물품을 전달했다. 후원물품은 200만원 상당의 김 200상자로 방문건강관리사업 대상자인 저소득층, 북한이탈주...",
    img: ph(250, 160, "사진", 1),
  },
  {
    section: "정치/행정",
    id: 47,
    title: "예산군, 추석 명절 앞두고 주민과 함께하는 청렴캠페인 실시",
    body:
      "청렴도 1등급에 빛나는 예산군이 추석을 맞아 4일부터 6일까지 3일간 청렴한 공직문화 조성 및 지역문화 확산을 위해 청렴 캠페인을 실시 중이다. 전 직원의 자율적인 참여로 이뤄지는 이번 캠페인으로 군은 명절 선물 안 주고...",
    img: ph(250, 160, "사진", 2),
  },
  {
    section: "생활/경제",
    id: 48,
    title: "평화복지관 노원보건소와 생명존중사업 협력(MOU)체결 협약",
    body:
      "평화종합사회복지관(관장 장재섭)은 지난 8월 28일 노원구보건소(소장 이은주)와 상호협력체계 구축을 위한 업무협약(MOU)를 체결했다. 이번 업무협약은 생명사랑 문화조성을 위해 민·관이 업무 협약서를 교환하...",
    img: ph(250, 160, "사진", 3),
  },
  {
    section: "문화/교육",
    id: 53,
    title: "구리시, 캐롤턴시 홈스테이 참가 청소년 모집",
    body:
      "구리시(시장 안승남)는 오는 10월 자매결연 도시인 미국 텍사스주 캐롤턴시로 홈스테이를 떠날 청소년을 9월 3일부터 11일까지 모집한다. 구리시는 캐롤턴시와 지난 2010년 청소년 교류 협정 체결 후 매년 지속적으로 홈스테이 교...",
    img: ph(250, 160, "사진", 4),
  },
  {
    section: "연예/스포츠",
    id: 45,
    title:
      "'동백꽃 필 무렵' 공효진♡강하늘, 입덕 게이트 오픈! 올가을 이 커플에 빠질 수밖에 없는 이유 셋!",
    body:
      "하반기 최고 기대작, KBS 2TV 새 수목드라마 '동백꽃 필 무렵'(극본 임상춘, 연출 차영훈, 제작 팬엔터테인먼트)이 티저 영상과 이미지를 공개할 때마다 화제를 불러일으키고 있다. 로코퀸 공효진과 여심스틸러 강하늘의 만남만...",
    img: ph(250, 160, "사진", 5),
  },
];

const TICKER_ITEMS = [
  { id: 47, text: "예산군, 추석 명절 앞두고 주민과 함께하는 청렴캠페인 실시" },
  {
    id: 49,
    text: "순천소방서 서면119안전센터, 소소심 및 소방안전교육 실시(새꿈어린이집)",
  },
];

const RANKING_NEWS = [
  { id: 46, title: "가수 백지영, 신생 기획사 '트라이어스'와 계약…매니저와 13년 인연", img: ph(70, 70, "1", 1) },
  { id: 52, title: "아산시약사회, 추석명절 소외이웃 후원물품 전달", img: ph(70, 70, "2", 2) },
  {
    id: 49,
    title: "순천소방서 서면119안전센터, 소소심 및 소방안전교육 실시(새꿈어린이집)",
    img: ph(70, 70, "3", 3),
  },
  { id: 47, title: "예산군, 추석 명절 앞두고 주민과 함께하는 청렴캠페인 실시", img: ph(70, 70, "4", 4) },
  { id: 11, title: '"국립세종수목원, 국민과 함께 만들어 가요"', img: ph(70, 70, "5", 5) },
  { id: 48, title: "평화복지관 노원보건소와 생명존중사업 협력(MOU)체결 협약", img: ph(70, 70, "6", 0) },
  {
    id: 45,
    title: "'동백꽃 필 무렵' 공효진♡강하늘, 입덕 게이트 오픈! 올가을 이 커플에 빠질 수밖에 없는 이유 셋!",
    img: ph(70, 70, "7", 1),
  },
  { id: 43, title: "의왕시, 제3기 도시재생대학 개강...55명 참여", img: ph(70, 70, "8", 2) },
  { id: 42, title: "김상돈 의왕시장, 사회조사 실시 관계자 방문 격려", img: ph(70, 70, "9", 3) },
  {
    id: 55,
    title: "문 대통령 \"온실가스 감축·탄소중립 실현, 국가의 명운 걸린 일\"",
    img: ph(70, 70, "10", 4),
  },
];

const BOX_REALTIME = [
  {
    id: 56,
    title: "[경기도] 경기도양성평등센터, 20일 자치법규 성인지 관련 온라인 정책포럼 개최",
    img: ph(86, 86, "사진", 1),
    main: true,
  },
  {
    id: 57,
    title: "[경기도] 희망을 꽃 피우다! '제17회 선인장페스티벌' 20일부터 열려",
    img: ph(86, 86, "사진", 2),
  },
  {
    id: 59,
    title: "[경기도] 도 특사경, 동물용 의약품 유통관리 불법행위 집중 수사",
    img: ph(86, 86, "사진", 3),
  },
  {
    id: 58,
    title: "[경기도] 도, 체육계 인권증진 위탁사업자 공모…스포츠 인권교육·홍보 등 수행",
    img: ph(86, 86, "사진", 4),
  },
  {
    id: 55,
    title: "문 대통령 \"온실가스 감축·탄소중립 실현, 국가의 명운 걸린 일\"",
    img: ph(86, 86, "사진", 5),
  },
];

function SectionPills() {
  return (
    <div className="flex gap-1.5 max-w-[1280px] mx-auto my-2.5 px-3 overflow-x-auto sm:overflow-visible sm:flex-wrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="shrink-0 text-[13px] text-gray-600 no-underline border border-gray-200 rounded-full px-3 py-1 bg-gray-50 hover:bg-gray-100 hover:text-blue-600"
        >
          {s.name}
        </a>
      ))}
    </div>
  );
}

function Header() {
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

function MainNewsSlider() {
  const [active, setActive] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      setActive((a) => (a + 1) % MAIN_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer.current);
  }, []);

  const current = MAIN_SLIDES[active];

  return (
    <div className="border border-gray-100">
      <a href="#article" className="relative block">
        <img
          src={current.img}
          alt="메인사진"
          className="w-full block aspect-[16/10] sm:aspect-auto object-cover"
        />
        <span className="absolute left-0 bottom-0 right-0 bg-black/55 text-white text-sm sm:text-base font-medium px-3 sm:px-3.5 py-2 sm:py-2.5 line-clamp-2">
          {current.title}
        </span>
      </a>
      <ul className="list-none m-0 py-1.5">
        {MAIN_SLIDES.map((slide, i) => (
          <li
            key={slide.id}
            onMouseEnter={() => setActive(i)}
            onClick={() => setActive(i)}
            className={`px-3 sm:px-3.5 py-1.5 text-[13px] sm:text-sm border-b border-gray-50 cursor-pointer flex gap-1.5 ${
              i === active ? "text-blue-600 font-medium" : "text-gray-700 font-normal"
            }`}
          >
            <span className="text-blue-600 w-3 shrink-0">{i === active ? "▶" : ""}</span>
            <a
              href="#article"
              className="text-inherit no-underline truncate sm:line-clamp-1 sm:whitespace-normal"
            >
              {slide.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PhotoNewsTabs() {
  const [active, setActive] = useState(2);
  const timer = useRef(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      setActive((a) => (a + 1) % PHOTO_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer.current);
  }, []);

  const current = PHOTO_SLIDES[active];

  return (
    <div className="border border-gray-100 flex flex-col">
      <div className="bg-blue-600 text-white font-medium text-sm sm:text-base px-3 py-2">
        포토뉴스
      </div>
      <a href="#article" className="block">
        <img
          src={current.img}
          alt="메인사진"
          className="w-full block aspect-[16/9] sm:aspect-[16/9.5] object-cover"
        />
      </a>
      <p className="text-xs sm:text-[13px] px-3 py-2 m-0 leading-tight min-h-[34px] sm:min-h-[38px] line-clamp-2">
        <a href="#article" className="text-inherit no-underline">
          {current.title}
        </a>
      </p>
      <ul className="flex gap-1 list-none m-0 px-2 pb-2">
        {PHOTO_SLIDES.map((slide, i) => (
          <li
            key={slide.id}
            onMouseEnter={() => setActive(i)}
            onClick={() => setActive(i)}
            className={`w-full h-10 sm:h-[45px] overflow-hidden cursor-pointer flex-1 border-[3px] ${
              i === active ? "border-blue-500" : "border-transparent"
            }`}
          >
            <img src={slide.img} alt="썸네일" className="w-full h-full object-cover" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Ticker() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % TICKER_ITEMS.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex border border-gray-300 my-3 sm:my-4 h-10 sm:h-11">
      <div className="bg-blue-700 text-white text-xs sm:text-[13px] font-medium flex items-center justify-center w-16 sm:w-[90px] flex-shrink-0">
        단신
      </div>
      <div className="flex-1 flex items-center px-2.5 sm:px-3.5 overflow-hidden bg-gray-50 min-w-0">
        <a
          href="#article"
          className="text-[13px] sm:text-sm text-gray-700 no-underline whitespace-nowrap overflow-hidden text-ellipsis block w-full"
        >
          {TICKER_ITEMS[index].text}
        </a>
      </div>
    </div>
  );
}

function GridNewsSection() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {GRID_NEWS.map((n) => (
        <div key={n.id} className="border border-gray-100 pb-2.5">
          <div className="text-[11px] sm:text-xs font-medium text-blue-600 px-2 sm:px-2.5 py-1.5">
            <a href="#section">{n.section}</a>
          </div>
          <a href="#article">
            <img
              src={n.img}
              alt="메인사진"
              className="w-full block aspect-[250/160] object-cover"
            />
          </a>
          <p className="text-[13px] sm:text-sm font-medium mx-2 sm:mx-2.5 mt-2 mb-1 leading-snug text-gray-900 line-clamp-2">
            <a href="#article" className="text-inherit no-underline">
              {n.title}
            </a>
          </p>
          <p className="hidden sm:block text-xs text-gray-500 mx-2.5 leading-relaxed line-clamp-2">
            <a href="#article" className="text-inherit no-underline">
              {n.body}
            </a>
          </p>
        </div>
      ))}
    </div>
  );
}

function RealtimeBox() {
  const [main, ...rest] = BOX_REALTIME;
  return (
    <div className="border border-gray-100 px-3 py-2.5">
      <div className="font-medium text-sm sm:text-[15px] border-b border-gray-200 pb-2 mb-2 text-sky-700">
        <a href="#section" className="text-inherit no-underline">
          실시간 주요뉴스
        </a>
      </div>
      <div className="flex gap-2.5 pb-2.5 border-b border-gray-50 mb-2">
        <a href="#article" className="flex-shrink-0">
          <img src={main.img} alt="메인사진" className="w-16 h-16 object-cover flex-shrink-0" />
        </a>
        <a
          href="#article"
          className="text-[13px] font-medium text-gray-900 leading-snug no-underline line-clamp-3"
        >
          {main.title}
        </a>
      </div>
      {rest.map((n) => (
        <div key={n.id} className="flex gap-2.5 py-1.5 border-b border-gray-50">
          <a href="#article" className="flex-shrink-0">
            <img src={n.img} alt="메인사진" className="w-16 h-16 object-cover flex-shrink-0" />
          </a>
          <a
            href="#article"
            className="text-[13px] text-gray-700 leading-snug no-underline line-clamp-3"
          >
            {n.title}
          </a>
        </div>
      ))}
    </div>
  );
}

function RankingBox() {
  return (
    <div className="border border-gray-200 px-3 py-2.5">
      <div className="font-medium text-base border-b border-gray-200 pb-2.5 mb-1.5">
        많이 본 기사
      </div>
      {RANKING_NEWS.map((n, i) => (
        <div key={n.id} className="flex items-center gap-2 py-2 border-b border-gray-50">
          <a href="#article" className="flex-shrink-0">
            <img src={n.img} alt="메인사진" className="w-11 h-11 object-cover flex-shrink-0" />
          </a>
          <span className="text-sm text-sky-700 font-medium w-4 flex-shrink-0">
            {i + 1}
          </span>
          <a
            href="#article"
            className="text-[13px] text-gray-700 leading-snug no-underline overflow-hidden line-clamp-2"
          >
            {n.title}
          </a>
        </div>
      ))}
    </div>
  );
}

function SectionSummaryBlock() {
  return (
    <div className="mt-2.5">
      <p className="text-base sm:text-lg font-medium border-b-2 border-black pb-2 sm:pb-2.5 mb-3 sm:mb-4">
        섹션별 주요뉴스
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SECTIONS.slice(0, 4).map((s, idx) => (
          <div key={s.id} className="border border-gray-100">
            <div className="bg-gray-100 font-medium text-sm px-2.5 py-2 flex justify-between items-center">
              {s.name}
              <a
                href={`#${s.id}`}
                className="text-xs text-gray-400 no-underline flex items-center hover:text-gray-600"
              >
                더보기 <i className="ti ti-chevron-right" aria-hidden="true" />
              </a>
            </div>
            <ul className="list-none m-0 px-2 py-1.5">
              {RANKING_NEWS.slice(idx, idx + 4).map((n) => (
                <li
                  key={n.id}
                  className="flex gap-2 py-1.5 border-b border-gray-50"
                >
                  <a href="#article" className="flex-shrink-0">
                    <img
                      src={n.img}
                      alt="메인사진"
                      className="w-11 h-11 object-cover flex-shrink-0"
                    />
                  </a>
                  <a
                    href="#article"
                    className="text-xs text-gray-700 leading-snug no-underline overflow-hidden line-clamp-2"
                  >
                    {n.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-6 sm:mt-7 bg-gray-50">
      <div className="max-w-[1280px] mx-auto px-3 pt-6 pb-8 sm:pb-10">
        <a href="#top">
          <img
            src={PLACEHOLDER_LOGO}
            alt="로고"
            className="opacity-85 max-w-[160px] sm:max-w-[200px]"
          />
        </a>
        <div className="text-[11px] sm:text-xs text-gray-500 my-3.5 leading-relaxed">
          <a href="#privacy" className="text-gray-500 no-underline hover:text-gray-700">
            개인정보취급방침
          </a>{" "}
          ㅣ{" "}
          <a href="#about" className="text-gray-500 no-underline hover:text-gray-700">
            회사소개
          </a>{" "}
          ㅣ{" "}
          <a href="#ads" className="text-gray-500 no-underline hover:text-gray-700">
            광고/제휴 안내
          </a>{" "}
          ㅣ{" "}
          <a href="#tip" className="text-gray-500 no-underline hover:text-gray-700">
            기사제보
          </a>{" "}
          ㅣ{" "}
          <a href="#press" className="text-gray-500 no-underline hover:text-gray-700">
            보도자료
          </a>{" "}
          ㅣ{" "}
          <a href="#search" className="text-gray-500 no-underline hover:text-gray-700">
            기사검색
          </a>
        </div>
        <p className="text-[10px] sm:text-[11px] text-gray-400 leading-6 sm:leading-7">
          인터넷신문 데모버전 ㅣ 주소 : 경기도 성남시 분당구 서현로204, 922호 ㅣ
          전화 : 031-708-3799 ㅣ 팩스 031-601-8799
          <br />
          등록번호 : 경기 아,00000 ㅣ 등록일 : 2003.00.00 ㅣ E-mail :
          abc@example.net
          <br />
          회사명 : (주)데모미디어 ㅣ 발행/편집인 : 홍길동 ㅣ 청소년보호책임자 :
          홍길동
          <br />
          Copyright ⓒ 2024 데모미디어. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default function NewsHomepage() {
  return (
    <div
      id="top"
      className="w-full bg-white text-gray-800"
      style={{
        fontFamily:
          "'Malgun Gothic','맑은 고딕','Apple SD Gothic Neo',Dotum,sans-serif",
      }}
    >
      <Header />
      <SectionPills />

      <main className="max-w-[1280px] mx-auto px-3 pb-7">
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-3 lg:gap-4 mt-2.5">
          <MainNewsSlider />
          <PhotoNewsTabs />
        </div>

        <Ticker />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 lg:gap-5 mb-5 lg:mb-6">
          <div className="order-1">
            <GridNewsSection />
          </div>
          <div className="order-2">
            <RealtimeBox />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 lg:gap-5 mb-5 lg:mb-6">
          <div className="order-1">
            <GridNewsSection />
          </div>
          <div className="order-2">
            <RankingBox />
          </div>
        </div>

        <SectionSummaryBlock />
      </main>

      <Footer />
    </div>
  );
}
