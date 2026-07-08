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

## 기본 계정 (seed)

- 관리자: `admin` / `admin1234`

## API 문서

- `docs/API.md`
- `docs/ERD.md`
