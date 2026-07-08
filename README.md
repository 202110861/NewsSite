# 경제인뉴스

## Docker로 PostgreSQL 올리기

이 프로젝트 루트에 `docker-compose.yml`이 이미 있습니다. 아래 순서대로 진행하면 됩니다.

---

## 1. 사전 준비

**Docker Desktop 설치**

- <https://www.docker.com/products/docker-desktop/>
- Windows에서는 WSL2가 필요할 수 있습니다.

Docker Desktop을 실행한 뒤, 터미널에서 확인:

```bash
docker --version
docker compose version
```

둘 다 버전이 나오면 준비 완료입니다.

---

## 2. DB 컨테이너 실행

프로젝트 루트에서 실행합니다:

```bash
cd c:\Users\USER\OneDrive\Desktop\develop\NewsSite
docker compose up -d
```

- `up` : 컨테이너 생성 및 시작
- `-d` : 백그라운드 실행

**실행되는 설정**

| 항목        | 값                                                        |
| ----------- | --------------------------------------------------------- |
| 이미지      | `postgres:16-alpine`                                      |
| 호스트 포트 | `5432`                                                    |
| DB 이름     | `news_site`                                               |
| 사용자      | `postgres`                                                |
| 비밀번호    | `postgres`                                                |
| 연결 URL    | `postgresql://postgres:postgres@localhost:5432/news_site` |

---

## 3. 정상 실행 확인

```bash
docker compose ps
```

`postgres` 서비스가 `running`이면 정상입니다.

로그 확인:

```bash
docker compose logs postgres
```

`database system is ready to accept connections` 같은 메시지가 보이면 DB가 준비된 상태입니다.

---

## 4. 백엔드 DB 연결 설정

`server/.env`가 없다면 생성합니다:

```bash
cd c:\Users\USER\OneDrive\Desktop\develop\NewsSite\server
Copy-Item .env.example .env
```

`.env`의 `DATABASE_URL`이 아래와 같으면 Docker 설정과 일치합니다:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/news_site?schema=public"
```

---

## 5. 테이블 생성 + 시드 데이터

```bash
cd c:\Users\USER\OneDrive\Desktop\develop\NewsSite\server
npm install
npx prisma db push
npm run db:seed
```

- `db push` : Prisma 스키마를 DB에 반영
- `db:seed` : 섹션, 광고 슬롯, 후원 플랜, 관리자 계정 등 초기 데이터 삽입

**시드 관리자 계정**: `admin` / `admin1234`

---

## 6. 서버 실행

```bash
# 루트에서 프론트+백 동시 실행
cd c:\Users\USER\OneDrive\Desktop\develop\NewsSite
npm run dev:all
```

또는 백엔드만:

```bash
cd c:\Users\USER\OneDrive\Desktop\develop\NewsSite\server
npm run dev
```

**헬스체크:**

```bash
curl http://localhost:4000/api/health
```

`{"ok":true}`가 나오면 백엔드가 DB와 함께 정상 동작 중입니다.

---

## 자주 쓰는 Docker 명령

| 명령                              | 설명                        |
| --------------------------------- | --------------------------- |
| `docker compose up -d`            | DB 시작                     |
| `docker compose stop`             | DB 중지 (데이터 유지)       |
| `docker compose start`            | 중지했던 DB 다시 시작       |
| `docker compose down`             | 컨테이너 제거 (볼륨은 유지) |
| `docker compose down -v`          | DB 데이터까지 전부 삭제     |
| `docker compose logs -f postgres` | 실시간 로그 보기            |

---

## 문제 해결

**`Can't reach database server at localhost:5432`**

- Docker Desktop이 실행 중인지 확인
- `docker compose ps`로 컨테이너가 `running`인지 확인
- 5432 포트를 다른 PostgreSQL이 쓰고 있지 않은지 확인

**`port is already allocated`**

로컬에 PostgreSQL이 이미 5432를 사용 중일 수 있습니다.
기존 PostgreSQL을 끄거나, `docker-compose.yml`의 포트를 `"5433:5432"`처럼 바꾼 뒤 `.env`의 URL도 `localhost:5433`으로 맞춰 주세요.

**`docker compose` 명령이 안 될 때**

구버전 Docker는 `docker-compose`(하이픈)를 씁니다:

```bash
docker-compose up -d
```
