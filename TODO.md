# 후원 결제 기능 TODO

네이버페이·카카오페이 월 정기 후원 기능 구현 목록입니다.  
**위에서부터 순서대로** 진행합니다. 테스트(Mock → PortOne 테스트 → 실연동) 통과 후 다음 단계로 넘어갑니다.

> **현재 범위 (2026-07)**  
> - **노출·테스트·배포 대상:** 네이버페이, 카카오페이  
> - **UI 미노출 (코드 주석 보존):** 휴대폰(다날), 케이뱅크, 카카오뱅크  
> - 휴대폰은 다날 PG 가입비(약 20만원)로 보류, 내통장결제는 채널 계약 후 재오픈

---

## 진행 상태

| 단계 | 내용 | 상태 |
|------|------|------|
| 0 | 사전 준비 | ✅ |
| 1 | Mock 모드 (PortOne 없이 전체 플로우) | ✅ |
| 2 | DB·API 결제 수단 확장 | ✅ |
| 3 | 프론트 UI (결제 수단 선택) | ✅ |
| 4 | PortOne 테스트 연동 (네이버·카카오) | 🔄 |
| 5 | 정기결제·웹훅 검증 | ⬜ |
| 6 | 실결제 전환 | ⬜ |

상태 표기: ⬜ 대기 · 🔄 진행 중 · ✅ 완료

---

## 0. 사전 준비

- [x] Docker Desktop 실행 및 PostgreSQL 컨테이너 기동 (`docker compose up -d`)
- [x] `server/.env` 확인 (`DATABASE_URL`, JWT 시크릿 등)
- [x] 의존성 설치
  ```bash
  npm install
  npm install --prefix server
  npm install --prefix version-4
  ```
- [x] DB 스키마·시드 반영 (기존 환경 유지)
  ```bash
  cd server
  npx prisma db push
  npm run db:seed
  ```
- [x] 개발 서버 실행 확인 (`npm run dev:all`)
  - 프론트: http://localhost:5173 (또는 5174)
  - 백엔드: http://localhost:4000/api/health

---

## 1. Mock 모드 — PortOne 없이 전체 플로우

목표: 로그인 → 후원 → 결제 완료 → 마이페이지 구독 확인까지 **가짜 결제**로 검증.

### 1-1. 환경변수

- [x] `server/.env`에 `PAYMENT_MODE=mock` 추가
- [x] `server/.env.example` 생성/갱신 (결제 관련 변수 문서화)
- [x] `server/src/config/env.ts`에 `PAYMENT_MODE` (`mock` | `portone_test` | `portone_live`) 파싱 추가

### 1-2. 백엔드

- [x] `payment.gateway.ts`: `PAYMENT_MODE=mock`일 때 무조건 `MockPaymentGateway` 사용
- [x] `subscriptions.service.ts`: Mock 완료 시 `activatePaidPayment` 정상 동작 (PortOne 스케줄 생략)
- [x] `POST /api/subscriptions/callback` Mock 경로 정리
- [x] `GET /api/subscriptions/config` — 프론트에 결제 모드 노출

### 1-3. 프론트엔드

- [x] `GET /api/subscriptions/plans` 등 기존 API 연동 확인
- [x] `MockPaymentModal` 컴포넌트 신규
- [x] `SupportPage`: mock 모드면 PortOne SDK 대신 Mock 모달 사용
- [x] 미사용 `PhoneBillingModal.tsx` 제거

### 1-4. 검증

- [x] 로그인 후 `/support` → 플랜 선택 → Mock 결제 → `/support/complete` (브라우저에서 확인)
- [x] `/mypage`에서 구독 상태·플랜·금액 표시
- [x] 구독 해지 동작 확인
- [x] `GET /api/subscriptions/config` → `{ "paymentMode": "mock" }` 확인

---

## 2. DB·API — 결제 수단 확장

목표: 휴대폰 / 카카오페이를 DB·API에서 구분.

### 2-1. Prisma 스키마

- [x] `PayMethod` enum 추가 (`PHONE`, `KAKAO_PAY`)
- [x] `Subscription` 모델에 `payMethod PayMethod @default(PHONE)` 추가
- [x] `npx prisma db push` 반영

### 2-2. 백엔드 API

- [x] `startSubscriptionSchema`에 `payMethod` 추가
- [x] `PHONE` 선택 시 `phoneNumber` 필수, `KAKAO_PAY` 선택 시 optional
- [x] `startSubscription` 응답에 `payMethod`, 수단별 `channelKey`/`pg` 포함
- [x] `payment.gateway.ts`: 수단별 PortOne 공개 설정 반환
- [x] `getMySubscription` 응답에 `payMethod` 포함

### 2-3. 검증

- [x] Mock 모드에서 휴대폰·카카오 각각 후원 → DB `payMethod` 저장 확인 (브라우저)
- [x] 마이페이지에 결제 수단 표시
- [x] 후원 페이지 결제 수단 선택 UI (기본)

---

## 3. 프론트 UI — 결제 수단 선택

목표: 사용자가 휴대폰 / 카카오페이 중 선택.

### 3-1. 후원 페이지 (`SupportPage.tsx`)

- [x] 결제 수단 라디오/탭 UI (휴대폰 · 카카오페이)
- [x] 휴대폰 선택 시에만 번호 입력 필드 표시
- [x] `POST /subscriptions` 요청에 `payMethod` 포함
- [x] 안내 문구: 월 정기 후원, 해지 시 즉시 중단

### 3-2. PortOne SDK (`lib/portone.ts`)

- [x] `requestPhoneBilling` 유지·정리
- [x] `requestKakaoBilling` 신규 (`customer_uid`, `m_redirect_url`)
- [x] `SupportPage`에서 `payMethod`에 따라 SDK 함수 분기

### 3-3. 기타 페이지

- [x] `MyPage`: 결제 수단 표시 (휴대폰 후원 / 카카오페이 후원)
- [x] `SupportPortOneReturnPage`: 휴대폰·카카오 공통 리다이렉트 처리 유지

### 3-4. 검증

- [x] Mock 모드에서 UI 전환·유효성(번호 필수/생략) 확인
- [x] 모바일 리다이렉트 경로 `/support/portone-return` 라우트 유지 확인

---

## 4. PortOne 테스트 연동 (네이버페이 · 카카오페이)

목표: **실제 결제창**을 띄우되 테스트 채널로 검증. 휴대폰·내통장(케이/카카오뱅크)은 UI 비노출.

### 4-0. 테스트 순서 (지금 할 일)

1. [ ] `server/.env` → `PAYMENT_MODE=portone_test`
2. [ ] PortOne 콘솔에서 **카카오페이 정기결제**(`TCSUBSCRIP`) 테스트 채널 키 확인
3. [ ] PortOne 콘솔에서 **네이버페이** 테스트 채널 키 발급·등록
4. [ ] `PORTONE_KAKAO_CHANNEL_KEY`, `PORTONE_NAVER_CHANNEL_KEY` 설정 후 서버 재시작
5. [ ] ngrok 실행 → `API_PUBLIC_URL` 설정 → PortOne 웹훅 URL 등록
6. [ ] `/support`에서 **카카오페이** 테스트: 빌링키 발급 → 구독 ACTIVE → 마이페이지 확인
7. [ ] `/support`에서 **네이버페이** 테스트: 빌링 등록 → 첫 결제(`again` API) → ACTIVE
8. [ ] 구독 해지(카카오·네이버 각각) → PortOne 예약 취소 확인
9. [ ] 테스트 통과 후 `PAYMENT_MODE=portone_live` + 운영 채널로 6단계 진행

### 4-1. PortOne 콘솔 (수동)

- [x] [PortOne 관리자 콘솔](https://admin.portone.io) 가입
- [x] 테스트 채널 추가: **카카오페이 정기결제** (`TCSUBSCRIP`)
- [ ] 테스트 채널 추가: **네이버페이** (`naverpay`)
- [x] ~~테스트 채널: 다날 휴대폰~~ (보류 — UI 미노출)
- [x] API 키 발급 (`IMP_CODE`, `API_KEY`, `API_SECRET`)
- [x] 카카오 채널 키 복사
- [ ] 네이버페이 채널 키 복사

### 4-2. 환경변수

`server/.env` 예시 (PortOne 콘솔 설정 완료 후):

```env
PAYMENT_MODE=portone_test
PORTONE_IMP_CODE=impXXXXXX
PORTONE_API_KEY=...
PORTONE_API_SECRET=...
PORTONE_KAKAO_CHANNEL_KEY=...   # 카카오 TCSUBSCRIP 테스트 채널
PORTONE_NAVER_CHANNEL_KEY=...   # 네이버페이 테스트 채널
# PORTONE_PHONE_CHANNEL_KEY=... # (보류) 다날 휴대폰
# PORTONE_ACCOUNT_CHANNEL_KEY=... # (보류) 내통장결제
API_PUBLIC_URL=https://xxxx.ngrok-free.app
```

- [x] `PAYMENT_MODE=portone_test` 로 변경
- [x] `PORTONE_IMP_CODE`, `PORTONE_API_KEY`, `PORTONE_API_SECRET`
- [x] `PORTONE_KAKAO_CHANNEL_KEY` (카카오 `TCSUBSCRIP` 테스트)
- [ ] `PORTONE_NAVER_CHANNEL_KEY` (네이버페이 테스트)
- [ ] `API_PUBLIC_URL` (웹훅·리다이렉트용, ngrok)

### 4-3. 백엔드

- [x] `env.ts`: `PORTONE_KAKAO_CHANNEL_KEY`, `PORTONE_NAVER_CHANNEL_KEY` 추가
- [x] `portone.client.ts`: 수단별 채널 키·PG 설정 분기
- [x] 카카오 테스트 시 첫 결제 `amount: 0` (프론트 `kakaoTestUsesZeroAmount`)
- [x] 네이버: 빌링 등록 후 `chargeBillingAgain`으로 첫 결제
- [x] `ACTIVE_PAY_METHODS` = `KAKAO_PAY`, `NAVER_PAY` 만 허용

### 4-4. 검증

- [x] 카카오페이 테스트 결제 → 빌링키 발급 → 구독 ACTIVE
- [ ] 네이버페이 테스트 결제 → 빌링 등록 → 첫 결제 → 구독 ACTIVE
- [ ] 카카오·네이버 구독 해지 · PortOne 예약 취소 확인
- [ ] 결제 실패·취소 시 에러 메시지 UI 확인
- [x] ~~휴대폰 테스트~~ (보류)

---

## 5. 정기결제·웹훅

목표: 매월 자동 결제 예약·웹훅 수신이 동작하는지 확인.

### 5-0. ngrok 설정 (로컬 웹훅 수신)

PortOne은 로컬 `localhost`로 웹훅을 보낼 수 없어 **공개 URL**이 필요합니다.

```powershell
# 1) ngrok 설치 후 (https://ngrok.com)
ngrok http 4000

# 2) 출력된 https URL을 server/.env 에 추가
API_PUBLIC_URL=https://xxxx.ngrok-free.app

# 3) 백엔드 재시작
cd server
npm run dev
```

- 웹훅 엔드포인트: `{API_PUBLIC_URL}/api/payments/webhook`
- 예: `https://amigo-subsidy-dimly.ngrok-free.dev/api/payments/webhook`
- PortOne 콘솔 **시스템 설정 → Notification URL(웹훅)** 에 동일 URL 등록

### 5-1. 백엔드 (코드)

- [x] `activatePaidPayment` 후 `scheduleRecurringPayment` 호출
- [x] 다음 `Payment(PENDING)` 레코드 생성
- [x] `POST /api/payments/webhook` 라우트 (`handlePortOneWebhook`)
- [x] `scheduleRecurringPayment` · SDK `notice_url` 전달
- [x] `GET /subscriptions/config` → `webhookUrl` 노출
- [x] `API_PUBLIC_URL` 설정 (ngrok)
- [x] PortOne 콘솔 → **결제알림(Webhook) 관리** → V1 · 테스트 · Endpoint URL 등록
- [x] **호출 테스트** 응답 200 확인
- [ ] (선택) 웹훅 서명 검증

### 5-2. 해지

- [x] `cancelMySubscription`: PortOne 예약 취소 + 빌링키 삭제 (휴대폰)
- [ ] 휴대폰·카카오 각각 해지 테스트 (카카오 남음)

### 5-3. 검증 순서

1. [x] ngrok 실행 + `API_PUBLIC_URL` 설정 + 서버 재시작
2. [x] PortOne 콘솔 웹훅 URL 등록 → **호출 테스트 200** 확인
3. [ ] 휴대폰 또는 카카오로 **신규 구독** → 마이페이지 **「다음 자동결제 예약됨」** 표시 확인
4. [ ] PortOne 콘솔 → **빌링 결제** → 예약 건(1개월 후) 존재 확인
5. [ ] DB: `Payment` 테이블에 `PENDING` 다음 회차 레코드 확인
6. [ ] (선택) PortOne 예약 시각을 가까운 미래로 변경 후 웹훅 `paid` 수신 → 구독 ACTIVE 유지 + 새 PENDING 생성
7. [ ] 웹훅 `failed` 시 `PAST_DUE` 처리 (PortOne 테스트 실패 케이스)
8. [ ] 마이페이지 해지 → PortOne 예약 삭제 → **재가입** 가능 확인

---

## 6. 실결제 전환

목표: PG 계약 완료 후 env만 교체해 실서비스 오픈.

### 6-1. PG 계약·실채널

- [ ] 다날 휴대폰 소액결제 실계약
- [ ] 카카오페이 정기결제 실계약 (실 CID)
- [ ] PortOne **실연동** 채널로 교체

### 6-2. 환경 전환

- [ ] `PAYMENT_MODE=portone_live`
- [ ] 실채널 키로 `PORTONE_PHONE_CHANNEL_KEY`, `PORTONE_KAKAO_CHANNEL_KEY` 교체
- [ ] 프로덕션 `API_PUBLIC_URL`, `CLIENT_URL` 확인
- [ ] (배포 시) 서버 환경변수·CI에 PortOne 키 등록

### 6-3. 최종 검증

- [ ] 소액 실결제 1건 (휴대폰)
- [ ] 소액 실결제 1건 (카카오페이)
- [ ] 해지·재가입 E2E
- [ ] `server/docs/API.md` 후원 API 문서 갱신

---

## 참고 — 관련 파일

| 구분 | 경로 |
|------|------|
| DB | `server/prisma/schema.prisma` |
| 구독 로직 | `server/src/modules/subscriptions/subscriptions.service.ts` |
| 결제 게이트웨이 | `server/src/modules/payments/payment.gateway.ts` |
| PortOne API | `server/src/modules/payments/portone.client.ts` |
| 웹훅 | `server/src/modules/payments/payments.routes.ts` |
| 환경변수 | `server/src/config/env.ts` |
| 후원 페이지 | `version-4/src/pages/SupportPage.tsx` |
| PortOne SDK | `version-4/src/lib/portone.ts` |
| 결제 리턴 | `version-4/src/pages/SupportPortOneReturnPage.tsx` |
| 마이페이지 | `version-4/src/pages/MyPage.tsx` |

---

## 메모

- 후원은 **콘텐츠 잠금이 아닌 순수 후원** 모델 (구독 혜택 미적용).
- 시드 플랜: 5,000원(기본 후원), 9,000원(특별 후원).
- 결제 테스트 계정(시드): `admin` / `12341234` (일반 USER, 후원 테스트 UI만 활성)
