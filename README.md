# Akavium Server

## 📋 목차

- [프로젝트 구조](#프로젝트-구조)
- [파일 및 코드 네이밍 작성 예시](#파일-및-코드-네이밍-작성-예시)
- [시작하기](#시작하기)
- [환경 변수 설정](#환경-변수-설정)
- [API 문서](#api-문서)
- [db 설계 방법](#db-설계-방법)

## 프로젝트 구조
기본적으로 app에는 폴더 형 router 구조를 가지고 있다.
users에는 get(배열 조회), post(create, 생성)을 넣어야 하고,
[userId]에는 get(객체 조회), patch/put, delete를 넣어야 한다.

config는 설정 관리를 넣는 폴더로, 환경 변수 관리, 동작 제어 방식 등을 해당 폴더 안에 넣는다.

interface는 DB의 type 및 return의 type을 지정한다.
interface 내부 파일의 이름은 전부다 PascalCase로 작성을 해야한다. (다만 autoKey를 작성을 할때는 camelCase로 작성한다.)

middleware는 req, res를 보낼떄 사이에 넣어, 공통적인 작업을 수행하는 로직을 넣는 공간,
예시로 로그인 상태 판별 하는 authMiddleware, error 로깅을 담당하는 핸들러 errorHandler 등을 넣는다.
사용 예시는 router.get('/', authMiddleware, catchAsyncErrors(async(req,res)=>{ return ApiResponse.ok(res, "login true")}))

repository는 데이터를 가져오는 곳으로, DB query을 넣는 방식 등 DB와 직접 통신하는 코드들이 있는 공간

services는 비즈니스 로직을 담당하는 핵심 계층이며 repository를 활용하며, CRUD를 구성해서, router와 연결해 서버를 구성할 수 있다.

utils는 재사용 함수들을 저장하는 곳으로, 대표적으로, catchAsyncErrors, ApiResponse 등을 넣어, 재사용 성을 강조했다.

폴더 구조.
```
src/
├── app/                        # 애플리케이션 진입점 및 라우팅
│   ├── index.ts                # Express 앱 설정
│   ├── router.ts               # 메인 라우터
│   ├── docs.ts                 # API 문서 라우터
│   └── v1/                     # API v1
│       ├── router.ts
│       ├── users/              # 사용자 엔드포인트
│               └──[userId]/    #사용자 ID 엔드포인트
│       └── posts/              # 게시물 엔드포인트
├── configs/                    # 설정 파일
│   ├── env.ts                  # 환경 변수
│   ├── pool.ts                 # PostgreSQL 연결 풀
│   └── pagination.ts           # 페이지네이션 설정
├── interfaces/                 # TypeScript 인터페이스
│   ├── account/
│   └── post/
├── middleware/                 # Express 미들웨어
│   ├── errorHandler.ts         # 에러 핸들러
│   ├── pagination.ts           # 페이지네이션 미들웨어
│   └── search.ts               # 검색 미들웨어
├── repository/                 # 데이터베이스 레이어
│   └── repository.ts           # Repository 패턴 구현
├── services/                   # 비즈니스 로직
│   ├── account/
│   └── post/
└── utils/                      # 유틸리티 함수
    ├── ApiResponse.ts          # API 응답 포맷
    ├── catchAsyncErrors.ts     # 비동기 에러 처리
    └── requestLogger.ts        # 요청 로깅
```

## 파일 및 코드 네이밍 작성 예시
interface 내 모든 파일은 PascalCase로 작성을 하고 그 외에 파일은 전부 camelCase로 작성해서 제작을 해야한다.
(보통 utils로 PascalCase로 작성을 해야하긴 합니다. <= 귀찮아서 안한 뜻>)

service, router 등은 모두 camelCase로 파일을 작성해서 관리합니다.

## 시작하기

### 사전 요구사항

### 설치

```bash
# 의존성 설치
npm install
```

### 개발 서버 실행

```bash
# 개발 모드 (자동 재시작)
npm run dev
```

서버는 기본적으로 `http://localhost:PORT`에서 실행됩니다.

### 프로덕션 빌드

```bash
# TypeScript 컴파일
npm run build

# 프로덕션 실행
npm start
```

## 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
# 데이터베이스 설정
DB_USER=your_db_user
DB_HOST=localhost
DB_NAME=your_database_name
DB_PASSWORD=your_db_password
DB_PORT=5432

# 서버 설정
PORT=8000
```

## API 문서

API 문서는 자동으로 생성되며, 다음 엔드포인트에서 확인할 수 있습니다:

```
http://localhost:PORT/docs
```

Tspec을 사용하여 TypeScript 코드에서 OpenAPI 스펙을 자동 생성합니다.

## 개발 스크립트

```bash
# 개발 모드 (nodemon + tsx)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm start

# 디버그 모드
npm run debug
```

## db 설계 방법
기본적으로 db라는 폴더 안에 ERD 확장 vs code를 찾아 설치를 합니다.
그 다음 (스키마 이름).vuerd.json으로 파일을 제작해서 DB구조도를 작성합니다.
DB는 테이블 이름은 snake_case 방식으로
users 안에 1대N 또는 1대1로 작용해야할때 users_sign 등으로 구현이 가능합니다.
컬럼 이름도 snake_case 방식으로 작성을 해서, user_id 등으로 구현을 해야합니다.
(server와 통신할떄 자동으로 snake_case에서 camelCase로 변환해서 사용을 합니다.)

카디널리티 (Cardinality) + 선택성(Optional/ Mandatory)으로 엔티티 간 관계(Relationship)를 뜻하는데
DB를 구성할때, 0대1, 0대N, 1대1, 1대N 처럼 FK를 걸고, 연결을 할떄,
0대1은 있을 수도 있고 없을 수도 있는데, 있으면 1개뿐! 이라는 뜻 => 예시 user profile (프로필이 없을 수도 있는데, 이건 여러개가 있는 경우는 없으니 0대1)
0대N은 있을 수도 있고, 없을 수도 있는데, 있으면 여러개 라는 뜻 => 예시 post 댓글로, 댓글은 없을 수도 있지만, 여러개일 수도 있음
1대1은 무조건 있는데, 1개만 연결 => 예시 사용자 password 관리, password는 무조건 있어야 하지만 1개 초과할 이유는 전혀 없음
1대N은 무조건 있는데, 그 값이 여러개 라는 뜻 => 예시 패키지 상품 => 여러개의 상품의 묶음
