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

## Automation (X-API-Key 헤더 필요)

```
POST /api/automation/articles
X-API-Key: {AUTOMATION_API_KEY}
Content-Type: application/json

{
  "title": "자동 수집 기사",
  "sectionId": "politics",
  "excerpt": "요약",
  "body": [{ "paragraphs": ["본문 1", "본문 2"] }]
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
