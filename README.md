# 한국 미용의료 클리닉 어드바이저 (Korean Clinic Advisor)

한국을 방문하는 미용의료 사용 관광객을 위한 클리닉 검색 및 리뷰 플랫폼

## 📋 프로젝트 개요

이 프로젝트는 TripAdvisor 개념의 서비스로, 강남 인근 피부시술 클리닉에 대한 후기 평가, 위치 정보, 미용시술 가격을 검색할 수 있는 플랫폼입니다.

## 🎯 주요 기능

- 🔍 **클리닉 검색**: 지역, 시술 종류, 가격대별 검색
- 📍 **위치 정보**: 지도 기반 클리닉 위치 확인
- 💰 **가격 비교**: 시술별 가격 정보 및 비교
- ⭐ **리뷰 시스템**: 실제 방문객의 후기 및 평점
- 🌐 **다국어 지원**: 한국어, 영어, 중국어, 일본어

## 🛠 기술 스택

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Maps**: Google Maps API
- **Deployment**: Vercel

## 📁 프로젝트 구조

```
korean-clinic-advisor/
├── app/                 # Next.js App Router
├── components/          # React 컴포넌트
├── lib/                 # 유틸리티 및 설정
├── prisma/              # Prisma 스키마
├── types/               # TypeScript 타입
└── locales/             # 다국어 파일
```

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+ 
- PostgreSQL 14+
- npm 또는 yarn

### 설치

1. 저장소 클론
```bash
git clone <repository-url>
cd korean-clinic-advisor
```

2. 의존성 설치
```bash
npm install
# 또는
yarn install
```

3. 환경 변수 설정
```bash
cp .env.example .env.local
```

`.env.local` 파일을 열어 필요한 환경 변수를 설정하세요:
- `DATABASE_URL`: PostgreSQL 연결 문자열
- `NEXTAUTH_SECRET`: NextAuth 시크릿 키
- OAuth 제공자 키 (Google, Kakao)
- Google Maps API 키

4. 데이터베이스 설정
```bash
npx prisma migrate dev
npx prisma generate
```

5. 개발 서버 실행
```bash
npm run dev
# 또는
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📚 문서

- [프로젝트 계획서](./PROJECT_PLAN.md) - 전체 프로젝트 계획 및 요구사항
- [기술 명세서](./TECHNICAL_SPEC.md) - 기술적 상세 사항 및 API 명세

## 📝 개발 단계

1. ✅ 프로젝트 계획 수립
2. ⏳ 기초 설정 및 인프라
3. ⏳ 인증 및 사용자 관리
4. ⏳ 클리닉 관리
5. ⏳ 시술 및 가격 정보
6. ⏳ 리뷰 시스템
7. ⏳ 고급 기능
8. ⏳ UI/UX 개선
9. ⏳ 테스트 및 배포

## 🤝 기여하기

이 프로젝트는 현재 계획 단계입니다. 기여 방법은 추후 공개됩니다.

## 📄 라이선스

이 프로젝트의 라이선스는 추후 결정됩니다.

## 📧 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.

