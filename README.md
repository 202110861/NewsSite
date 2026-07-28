# 모노레포 기반 CMS & 뉴스 플랫폼

## 1. 프로젝트 개요 (Project Overview)

> **모노레포 아키텍처를 기반으로 자체 CMS(콘텐츠 관리 시스템)와 사용자 프론트엔드를 통합 구축하고, AWS 인프라 및 무중단 배포 환경까지 직접 설계한 풀스택 뉴스 플랫폼**

- **프로젝트 성격:** 모노레포 풀스택 뉴스 서비스 & 동적 콘텐츠 관리 시스템
- **핵심 해결 과제:**
  - 정적 호스팅(S3) 환경에서의 동적 기사 SEO(Open Graph) 및 클라이언트 사이드 라우팅(SPA) 한계 극복
  - 보안 방화벽(WAF)과 파일 업로드 API 통신 간의 충돌 해결 및 인프라 구조 최적화
- **주요 기능 요약:**
  - **실시간 동적 SEO 생성기:** 관리자의 기사 승인/수정/삭제 시 S3에 OG 메타데이터가 포함된 HTML 즉시 생성 및 CloudFront 캐시 무효화 자동화
  - **자체 커스텀 에디터(CMS):** 이미지/미디어 삽입, Rich Text 편집 및 백엔드 업로드 API 연동
  - **사용자 웹 서비스:** 카테고리별 뉴스 조회, 검색, 기사 상세 페이지 및 SNS 공유 기능
- **서비스 URL:** `https://newsin.kr/`

---

## 2. 기술 스택 (Tech Stack)

| 구분               | 사용 기술 / 라이브러리                                                          |
| :----------------- | :------------------------------------------------------------------------------ |
| **Architecture**   | pnpm Workspaces, Turborepo (Monorepo)                                           |
| **Frontend**       | React, TypeScript, Vite, React Router, Zustand, TanStack Query, React Hook Form |
| **Backend**        | Node.js, Express, Prisma ORM, MySQL                                             |
| **Infrastructure** | AWS (EC2, S3, CloudFront, RDS, Route53), Nginx, Certbot (SSL)                   |
| **CI/CD**          | GitHub Actions                                                                  |

---

## 3. 아키텍처 및 시스템 흐름 (Architecture)

```
[ Client Browser ]
   │
   ├─► https://newsin.kr (Frontend)
   │     └─► CloudFront (WAF 적용) ──► S3 Bucket (Static Web Hosting)
   │
   └─► https://api.newsin.kr (Backend API)
         └─► Nginx (Reverse Proxy & SSL) ──► EC2 (Express App :4000) ──► RDS (MySQL)
```

- **프론트엔드/API 도메인 분리:** 정적 자원(S3/CloudFront)과 백엔드 API(Nginx/EC2)의 도메인을 격리하여 WAF 보안 규칙을 유지하면서도 무중단 파일 업로드 및 API 통신이 가능한 구조 설계
- **동적 S3 파일 동기화 흐름:** 관리자가 기사 승인/수정/삭제 ──► 백엔드가 해당 기사 전용 OG HTML 생성 ──► S3 특정 경로(`article/{id}/index.html`) 업로드 및 CloudFront Invalidation 트리거

---

## 4. 핵심 트러블슈팅 및 레슨 런 (Troubleshooting)

### 1) GitHub Actions 기반 자동 배포 및 네트워크 접근 제어 해결

- **문제 현상:** CI/CD 파이프라인 연동 중 `ssh-keyscan` 실패로 인해 EC2 배포 작업 중단 발생.
- **원인 분석:** SSH 키 문제나 CI/CD 스크립트 오작동이 아닌, AWS EC2 보안 그룹(Security Group)에서 GitHub Actions 서버 IP의 22번 포트 접근을 차단하고 있음을 디버깅.
- **해결 방법:** EC2 보안 그룹의 인바운드 규칙에 GitHub Actions 배포용 SSH(Port 22) 접근 허용 정책을 추가하여 자동 배포 파이프라인 정상화.

### 2) API 도메인 분리 및 Nginx 리버스 프록시 구축 (WAF 충돌 해결)

- **문제 현상:** 관리자 페이지에서 뉴스 기사 내 이미지 업로드 시 WAF 차단으로 인해 `403 Forbidden` 및 HTML 에러 응답 반환.
- **원인 분석:** 프론트엔드와 API가 동일한 CloudFront+WAF 환경을 경유하고 있어, WAF의 보수적인 규칙이 에디터의 `POST /api/admin/uploads` 멀티파트 요청을 공격 시도로 오인하여 차단함을 확인.
- **해결 방법:** API 전용 도메인(`api.newsin.kr`)을 분리 개설. EC2 내부에 Nginx 리버스 프록시를 도입해 Certbot SSL을 적용하고, 4000번 포트의 외부 직접 노출을 차단하여 보안성을 확보하는 동시에 API 통신을 정상화함.

### 3) React SPA의 S3/CloudFront 정적 호스팅 라우팅 해결

- **문제 현상:** 서브 라우트(`/search`, `/article/:id` 등)에서 새로고침(F5) 시 S3가 해당 파일 객체를 찾지 못하고 `403 Access Denied` XML 에러 반환.
- **원인 분석:** S3 정적 호스팅은 실제 파일 경로를 찾는데, 클라이언트 사이드 라우팅(React Router) 기반 SPA 특성상 `/search`라는 물리적 파일이 존재하지 않아 S3 거부 응답이 발생함.
- **해결 방법:** CloudFront 사용자 지정 에러 응답(Custom Error Pages)을 설정하여, `403/404` 에러 발생 시 최상위 `index.html`을 `200 OK` 응답으로 반환하도록 커스텀 처리해 클라이언트 라우팅이 정상 작동하도록 개선.

### 4) 동적 콘텐츠 생성에 따른 S3 정적 호스팅 및 SEO 동기화 자동화

- **문제 현상:** 빌드 시점에 프리렌더링된 기사만 S3에 존재하므로, 배포 이후 새롭게 작성된 동적 기사는 새로고침 시 403 에러가 발생하고 SNS 공유 시 Open Graph(미리보기 썸네일)가 표시되지 않는 현상 발생.
- **원인 분석:** 클라이언트 라이브러리(React Helmet 등)는 크롤러 봇이 JavaScript를 실행하기 전에 메타데이터를 수집하므로 정적 호스팅 환경에서는 동적 메타태그 주입에 한계가 있음.
- **해결 방법:** 백엔드에 **동적 S3 HTML 파이프라인** 구축. 관리자가 기사를 승인/수정/삭제할 때마다 해당 기사의 OG 메타데이터가 삽입된 HTML을 동적으로 생성하여 S3의 `/article/{id}/index.html` 경로로 자동 업로드 및 CloudFront 캐시 무효화를 수행하도록 프로세스 완전 자동화.

### 4) 동적 콘텐츠 생성에 따른 S3 정적 호스팅 및 SEO 동기화 자동화

- **문제 현상:** 빌드 시점에 프리렌더링된 기사만 S3에 존재하므로, 배포 이후 새롭게 작성된 동적 기사는 새로고침 시 403 에러가 발생하고 SNS 공유 시 Open Graph(미리보기 썸네일)가 표시되지 않는 현상 발생.
- **원인 분석:** 클라이언트 라이브러리(React Helmet 등)는 크롤러 봇이 JavaScript를 실행하기 전에 메타데이터를 수집하므로 정적 호스팅 환경에서는 동적 메타태그 주입에 한계가 있음.
- **해결 방법:** 백엔드에 **동적 S3 HTML 파이프라인** 구축. 관리자가 기사를 승인/수정/삭제할 때마다 해당 기사의 OG 메타데이터가 삽입된 HTML을 동적으로 생성하여 S3의 `/article/{id}/index.html` 경로로 자동 업로드 및 CloudFront 캐시 무효화를 수행하도록 프로세스 완전 자동화.
