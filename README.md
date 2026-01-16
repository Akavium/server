# Akavium Server

Akavium Backend Server - Real-time Collaboration SaaS Dashboard

## 📋 목차

- [개요](#개요)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [시작하기](#시작하기)
- [환경 변수 설정](#환경-변수-설정)
- [API 문서](#api-문서)
- [주요 기능](#주요-기능)
- [Docker](#docker)
- [개발 스크립트](#개발-스크립트)

## 개요

Akavium Server는 실시간 협업 SaaS 대시보드를 위한 백엔드 서버입니다. Express.js와 TypeScript로 구축되었으며, PostgreSQL 데이터베이스를 사용합니다.

## 기술 스택

### Core

- **Node.js** v18+
- **TypeScript** 5.5.3
- **Express.js** 4.21.2
- **PostgreSQL** (pg)

### 주요 라이브러리

- **Helmet** - 보안 헤더 설정
- **CORS** - Cross-Origin Resource Sharing
- **Cookie Parser** - 쿠키 파싱
- **Tspec** - API 문서 자동 생성
- **node-schedule** - 스케줄링 작업

### 개발 도구

- **tsx** - TypeScript 실행
- **nodemon** - 개발 시 자동 재시작
- **TypeScript** - 타입 안정성

## 프로젝트 구조

```
src/
├── app/                    # 애플리케이션 진입점 및 라우팅
│   ├── index.ts           # Express 앱 설정
│   ├── router.ts           # 메인 라우터
│   ├── docs.ts             # API 문서 라우터
│   └── v1/                 # API v1
│       ├── router.ts
│       ├── users/          # 사용자 엔드포인트
│       └── posts/          # 게시물 엔드포인트
├── configs/                # 설정 파일
│   ├── env.ts              # 환경 변수
│   ├── pool.ts             # PostgreSQL 연결 풀
│   └── pagination.ts       # 페이지네이션 설정
├── interfaces/             # TypeScript 인터페이스
│   ├── account/
│   └── post/
├── middleware/             # Express 미들웨어
│   ├── errorHandler.ts     # 에러 핸들러
│   ├── pagination.ts       # 페이지네이션 미들웨어
│   └── search.ts           # 검색 미들웨어
├── repository/             # 데이터베이스 레이어
│   └── repository.ts       # Repository 패턴 구현
├── services/               # 비즈니스 로직
│   ├── account/
│   └── post/
└── utils/                  # 유틸리티 함수
    ├── ApiResponse.ts      # API 응답 포맷
    ├── catchAsyncErrors.ts # 비동기 에러 처리
    └── requestLogger.ts    # 요청 로깅
```

## 시작하기

### 사전 요구사항

- Node.js 18 이상
- PostgreSQL 데이터베이스
- npm 또는 yarn

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

서버는 기본적으로 `http://localhost:8000`에서 실행됩니다.

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
http://localhost:8000/docs
```

Tspec을 사용하여 TypeScript 코드에서 OpenAPI 스펙을 자동 생성합니다.

## 주요 기능

### 1. RESTful API

- RESTful 원칙에 따른 API 설계
- 버전 관리 (v1)
- 일관된 응답 포맷

### 2. 데이터베이스 레이어

- Repository 패턴 구현
- 타입 안전한 쿼리 빌더
- 자동 쿼리 최적화

### 3. 페이지네이션

- 페이지 기반 페이지네이션
- 총 개수, 페이지 수, 이전/다음 페이지 정보 제공

### 4. 고급 검색

- 다중 필드 검색
- 다양한 검색 모드 (LIKE, ILIKE, Full-Text Search)
- 대소문자 구분 옵션
- 다중 단어 검색 지원

### 5. 보안

- Helmet을 통한 보안 헤더 설정
- CORS 설정
- 쿠키 기반 인증 지원

### 6. 에러 처리

- 전역 에러 핸들러
- 404 핸들러
- 구조화된 에러 응답

### 7. 로깅

- 요청 로깅 미들웨어
- 데이터베이스 에러 로깅

## Docker

### Docker 이미지 빌드

```bash
docker build -t akavium-server .
```

### Docker 컨테이너 실행

```bash
docker run -p 8000:8000 --env-file .env akavium-server
```

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

## 라이선스

ISC

## 작성자

suhyun
