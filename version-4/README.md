# 데일리가판대 — React 뉴스 포털

레거시 HTML/jQuery 종합 뉴스 사이트를 **React + TypeScript + Tailwind CSS (v4)** 기반으로
새롭게 디자인한 프로젝트입니다. 콘텐츠 구조(헤드라인, HOT ISSUE, 카테고리별 섹션, 푸터 등)는
원본을 유지하면서, 비주얼은 "신문 가판대"를 모티프로 새로 디자인했습니다.

## 시작하기

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속.

다른 명령어:

```bash
npm run build    # 프로덕션 빌드 (dist/ 생성)
npm run preview  # 빌드 결과 미리보기
npm run lint     # oxlint 검사
```

## 프로젝트 구조

```
src/
  components/        UI 컴포넌트
    MastheadBar.tsx       최상단 유틸바 (날짜/RSS/로그인)
    Header.tsx            로고 + 검색
    CategoryNav.tsx        카테고리 가로 스크롤 메뉴
    HotIssueTicker.tsx      속보 자막 (무한 가로 스크롤)
    HeroHeadlines.tsx      메인 헤드라인 (대형 1 + 보조 2)
    NewsCarousel.tsx       카테고리별 가로 스크롤 카드 캐러셀
    SectionTag.tsx          섹션 마감 태그 (재사용 컴포넌트)
    SectionNewsGrid.tsx     섹션별 주요뉴스 그리드 (푸터 위)
    Footer.tsx              푸터
  data/
    sections.ts            섹션(카테고리) 정의
    articles.ts             기사 더미 데이터 (원본 콘텐츠 보존)
  types/
    news.ts                 Article, Section 등 타입 정의
  utils/
    format.ts                날짜 포맷 유틸
  index.css                 Tailwind v4 테마 토큰 (@theme)
```

## 디자인 컨셉

- **컬러**: 다크 네이비(`ink`) 헤더 + 웜 화이트(`paper`) 배경 + 속보 레드(`flash`) 포인트
  + 골드(`gold`) 악센트. 신문 잉크와 종이 질감을 모티프로 함.
- **타이포그래피**: Pretendard (한글 가변 폰트, CDN)
- **시그니처 요소**: 좌측 빨간 배지 + 무한 가로 스크롤되는 HOT ISSUE 속보 자막,
  기사마다 붙는 섹션 컬러 마감 태그.
- 모든 캐러셀은 가로 스크롤 + 터치 제스처 지원, 데스크탑에서는 화살표 버튼 노출.

## 데이터 교체하기

`src/data/articles.ts`의 배열들을 실제 API 응답이나 CMS 데이터로 교체하면 됩니다.
이미지는 현재 [picsum.photos](https://picsum.photos) 플레이스홀더를 사용 중이므로,
실제 이미지 URL로 바꿔주세요.

## 기술 스택

- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4 (`@tailwindcss/vite` 플러그인, `@theme` 기반 토큰)
