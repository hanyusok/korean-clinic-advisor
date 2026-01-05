# 프로젝트 구조

## 📁 디렉토리 구조

```
korean-clinic-advisor/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 페이지 (로그인, 회원가입)
│   ├── (main)/            # 메인 페이지 (홈, 클리닉, 리뷰, 계정)
│   ├── api/               # API 라우트
│   │   ├── auth/          # NextAuth 인증
│   │   ├── clinics/       # 클리닉 API
│   │   ├── reviews/       # 리뷰 API
│   │   ├── search/        # 검색 API
│   │   ├── treatments/    # 시술 API
│   │   └── users/         # 사용자 API
│   ├── globals.css        # 전역 스타일
│   └── layout.tsx         # 루트 레이아웃
│
├── components/             # React 컴포넌트
│   ├── account/           # 계정 관련 컴포넌트
│   ├── auth/              # 인증 관련 컴포넌트
│   ├── clinic/            # 클리닉 관련 컴포넌트
│   ├── home/              # 홈페이지 컴포넌트
│   ├── layout/            # 레이아웃 컴포넌트
│   ├── providers/         # Context Provider
│   ├── review/            # 리뷰 관련 컴포넌트
│   ├── search/            # 검색 관련 컴포넌트
│   └── ui/                # 공통 UI 컴포넌트
│
├── lib/                   # 유틸리티 및 설정
│   ├── auth.ts           # NextAuth 설정
│   ├── constants.ts      # 상수
│   ├── prisma.ts         # Prisma Client
│   └── utils.ts          # 유틸리티 함수
│
├── prisma/                # Prisma 설정
│   └── schema.prisma     # 데이터베이스 스키마
│
├── public/                # 정적 파일
│   ├── icons/            # 아이콘
│   └── images/           # 이미지
│
├── scripts/               # 유틸리티 스크립트
│   ├── check-user-accounts.ts
│   └── create-sample-users.ts
│
├── types/                 # TypeScript 타입 정의
│   └── index.ts
│
└── [설정 파일들]
    ├── next.config.js
    ├── tailwind.config.js
    ├── tsconfig.json
    └── package.json
```

## 📄 주요 파일 설명

### 설정 파일
- `next.config.js` - Next.js 설정 (이미지 도메인 등)
- `tailwind.config.js` - Tailwind CSS 설정
- `tsconfig.json` - TypeScript 설정
- `package.json` - 프로젝트 의존성 및 스크립트

### 문서 파일
- `README.md` - 프로젝트 개요 및 시작 가이드
- `PROJECT_PLAN.md` - 프로젝트 계획
- `TECHNICAL_SPEC.md` - 기술 사양
- `USER_STORIES.md` - 사용자 스토리
- `OAUTH_SETUP.md` - OAuth 설정 가이드

### 핵심 파일
- `lib/auth.ts` - NextAuth 설정 및 OAuth 프로바이더
- `lib/prisma.ts` - Prisma Client 초기화
- `prisma/schema.prisma` - 데이터베이스 스키마 정의

## 🔧 사용 중인 기술 스택

- **Framework**: Next.js 14+ (App Router)
- **Database**: PostgreSQL + Prisma
- **Authentication**: NextAuth.js (Google, Kakao OAuth)
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **UI Components**: Custom components (Button, Card, Rating)
- **Maps**: Google Maps API
- **Notifications**: react-hot-toast

## 📦 의존성 관리

- `package.json` - 프로젝트 의존성 정의
- `package-lock.json` - 정확한 버전 고정
- `node_modules/` - 설치된 패키지 (gitignore)

## 🗂️ 파일 정리 상태

### ✅ 정리 완료
- 불필요한 문서 파일 제거 (12개)
- 필수 문서만 유지 (5개)

### 📝 유지된 파일
- 모든 소스 코드 파일
- 설정 파일
- 필수 문서
- 사용 중인 이미지 및 아이콘

