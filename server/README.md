# News Site Server

Express + Prisma + PostgreSQL 백엔드

## 실행 방법

1. PostgreSQL 실행 (Docker 예시)

```bash
docker compose up -d
```

2. 환경 변수 설정

```bash
cp .env.example .env
```

3. 의존성 설치 및 DB 마이그레이션

```bash
npm install
npx prisma db push
npm run db:seed
```

4. 개발 서버 실행

```bash
npm run dev
```

서버: `http://localhost:4000`

## 카카오 로그인 설정

1. [Kakao Developers](https://developers.kakao.com/)에서 애플리케이션을 만들고 **카카오 로그인**을 활성화합니다.
2. **Redirect URI**에 백엔드 콜백 주소를 등록합니다.
   - 로컬: `http://localhost:4000/api/auth/kakao/callback`
   - 운영: `https://{API 도메인}/api/auth/kakao/callback`
3. `server/.env`에 아래 값을 추가합니다. `KAKAO_CLIENT_ID`에는 앱의 **REST API 키**를 입력합니다.

```dotenv
KAKAO_CLIENT_ID="..."
KAKAO_CLIENT_SECRET="..."
KAKAO_REDIRECT_URI="http://localhost:4000/api/auth/kakao/callback"
```

Client Secret 기능을 사용하지 않으면 `KAKAO_CLIENT_SECRET`은 생략할 수 있습니다. 기존 DB에는 `AuthProvider.KAKAO` enum을 반영해야 합니다.

```bash
npx prisma db push
npx prisma generate
```

## 기본 계정 (seed)

- 관리자: `admin` / `admin1234`

## API 문서

- `docs/API.md`
- `docs/ERD.md`
