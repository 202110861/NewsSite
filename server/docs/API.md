# API 요청 예시

Base URL: `http://localhost:4000`

## Auth

### 아이디 중복 확인
```
GET /api/auth/check-username?username=testuser
```

### 회원가입
```
POST /api/auth/signup
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

### 로그인
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

### 토큰 재발급
```
POST /api/auth/refresh
Cookie: refreshToken=...
```

### 내 정보
```
GET /api/users/me
Authorization: Bearer {accessToken}
```

## Automation (뉴스레터 자동화 전용 API Key)

`AUTOMATION_API_KEY` 환경 변수에 설정한 고정 키를 사용합니다.

헤더 (둘 중 하나):
- `X-API-Key: {AUTOMATION_API_KEY}` (권장)
- `Authorization: Bearer {AUTOMATION_API_KEY}`

검수 대기(`PENDING_REVIEW`) 상태로 기사를 등록합니다.

`blocks`의 `IMAGE`/`VIDEO` 블록에 외부 `mediaUrl`(http/https)을 넣으면 서버가 파일을 다운로드해 `uploads/`에 저장하고 `filePath`로 변환합니다. YouTube URL은 그대로 `mediaUrl`로 저장됩니다.

### 일반 기사 등록

```
POST /api/automation/articles
X-API-Key: {AUTOMATION_API_KEY}
Content-Type: application/json

{
  "title": "자동 수집 기사",
  "sectionId": "politics",
  "excerpt": "요약",
  "reporter": "발행인",
  "sourceUrl": "https://example.com/original",
  "blocks": [
    { "type": "TEXT", "text": "본문 첫 문단" },
    { "type": "IMAGE", "mediaUrl": "https://example.com/photo.jpg", "caption": "캡션" },
    { "type": "TEXT", "text": "본문 두 번째 문단" }
  ]
}
```

### 카드뉴스 등록

`sectionId`를 `cardNews`로 설정하고 이미지 블록을 순서대로 전달합니다.

```
POST /api/automation/articles
X-API-Key: {AUTOMATION_API_KEY}
Content-Type: application/json

{
  "title": "[지역] 분양분쟁 카드뉴스",
  "sectionId": "cardNews",
  "blocks": [
    { "type": "IMAGE", "mediaUrl": "https://example.com/card-1.png" },
    { "type": "IMAGE", "mediaUrl": "https://example.com/card-2.png" },
    { "type": "IMAGE", "filePath": "images/uploaded-card.png" }
  ]
}
```

### 일괄 등록

```
POST /api/automation/articles/batch
X-API-Key: {AUTOMATION_API_KEY}
Content-Type: application/json

{
  "articles": [
    { "title": "기사 1", "sectionId": "economy", "blocks": [{ "type": "TEXT", "text": "..." }] },
    { "title": "카드뉴스 1", "sectionId": "cardNews", "blocks": [{ "type": "IMAGE", "mediaUrl": "..." }] }
  ]
}
```

동일 API Key로 관리자 API도 호출할 수 있습니다 (`authMiddleware` 예외 처리).

```
POST /api/admin/articles
X-API-Key: {AUTOMATION_API_KEY}
Content-Type: application/json

{
  "title": "검수 목록에 추가할 기사",
  "sectionId": "society",
  "blocks": [{ "type": "TEXT", "text": "본문" }]
}
```

## Admin

```
GET /api/admin/articles?status=PENDING_REVIEW
Authorization: Bearer {adminAccessToken}

PATCH /api/admin/articles/{id}/approve
Authorization: Bearer {adminAccessToken}
```

## Subscriptions

```
GET /api/subscriptions/plans

POST /api/subscriptions
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "planId": "...",
  "phoneNumber": "01012345678"
}
```

## Ads

```
GET /api/ads/slots/home_side_left
POST /api/ads/{id}/impression
POST /api/ads/{id}/click
```
