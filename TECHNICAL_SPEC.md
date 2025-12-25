# 기술 명세서 (Technical Specification)

## 1. 프로젝트 구조

```
korean-clinic-advisor/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 인증 관련 라우트
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/              # 메인 라우트
│   │   ├── page.tsx         # 홈페이지
│   │   ├── clinics/         # 클리닉 관련
│   │   │   ├── page.tsx     # 클리닉 목록
│   │   │   └── [id]/        # 클리닉 상세
│   │   ├── reviews/         # 리뷰 관련
│   │   └── search/          # 검색
│   ├── api/                 # API Routes
│   │   ├── clinics/
│   │   ├── reviews/
│   │   ├── users/
│   │   └── search/
│   ├── layout.tsx           # 루트 레이아웃
│   └── globals.css          # 전역 스타일
├── components/              # React 컴포넌트
│   ├── ui/                  # 기본 UI 컴포넌트
│   ├── clinic/              # 클리닉 관련 컴포넌트
│   ├── review/              # 리뷰 관련 컴포넌트
│   ├── search/              # 검색 관련 컴포넌트
│   └── layout/              # 레이아웃 컴포넌트
├── lib/                     # 유틸리티 및 설정
│   ├── prisma.ts            # Prisma 클라이언트
│   ├── auth.ts              # NextAuth 설정
│   ├── utils.ts             # 유틸리티 함수
│   └── constants.ts         # 상수 정의
├── types/                   # TypeScript 타입 정의
│   └── index.ts
├── public/                  # 정적 파일
│   ├── images/
│   └── icons/
├── prisma/                  # Prisma 스키마
│   └── schema.prisma
├── locales/                 # 다국어 파일
│   ├── en/
│   ├── ko/
│   ├── zh/
│   └── ja/
├── .env.local               # 환경 변수
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## 2. 환경 변수 설정

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
KAKAO_CLIENT_ID=""
KAKAO_CLIENT_SECRET=""

# Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=""

# File Upload
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Email (Optional)
RESEND_API_KEY=""
```

## 3. 주요 라이브러리

### 3.1 Core Dependencies
```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.0.0"
}
```

### 3.2 UI & Styling
```json
{
  "tailwindcss": "^3.3.0",
  "autoprefixer": "^10.4.0",
  "postcss": "^8.4.0",
  "@radix-ui/react-dialog": "^1.0.0",
  "@radix-ui/react-dropdown-menu": "^2.0.0",
  "@radix-ui/react-select": "^2.0.0",
  "@radix-ui/react-tabs": "^1.0.0",
  "lucide-react": "^0.300.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.0.0"
}
```

### 3.3 Database & ORM
```json
{
  "@prisma/client": "^5.0.0",
  "prisma": "^5.0.0"
}
```

### 3.4 Authentication
```json
{
  "next-auth": "^4.24.0",
  "@auth/prisma-adapter": "^1.0.0"
}
```

### 3.5 Forms & Validation
```json
{
  "react-hook-form": "^7.48.0",
  "zod": "^3.22.0",
  "@hookform/resolvers": "^3.3.0"
}
```

### 3.6 Internationalization
```json
{
  "next-intl": "^3.0.0"
}
```

### 3.7 Maps
```json
{
  "@react-google-maps/api": "^2.19.0"
}
```

### 3.8 Image Upload
```json
{
  "cloudinary": "^1.41.0",
  "react-dropzone": "^14.2.0"
}
```

### 3.9 Utilities
```json
{
  "date-fns": "^2.30.0",
  "zod": "^3.22.0",
  "react-hot-toast": "^2.4.0"
}
```

## 4. API 엔드포인트 상세

### 4.1 클리닉 API

#### GET /api/clinics
클리닉 목록 조회

**Query Parameters:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 20)
- `region`: 지역 필터 (강남, 청담, 압구정 등)
- `treatmentId`: 시술 종류 필터
- `minPrice`: 최소 가격
- `maxPrice`: 최대 가격
- `minRating`: 최소 평점
- `sort`: 정렬 기준 (rating, reviews, price)
- `search`: 검색어

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "클리닉명",
      "nameEn": "Clinic Name",
      "address": "주소",
      "region": "강남",
      "rating": 4.5,
      "reviewCount": 120,
      "priceRange": {
        "min": 50000,
        "max": 300000
      },
      "mainImage": "url",
      "latitude": 37.5665,
      "longitude": 126.9780
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### GET /api/clinics/[id]
클리닉 상세 정보

**Response:**
```json
{
  "id": "uuid",
  "name": "클리닉명",
  "nameEn": "Clinic Name",
  "address": "주소",
  "addressEn": "Address",
  "phone": "02-1234-5678",
  "website": "https://clinic.com",
  "operatingHours": {
    "monday": "09:00-18:00",
    "tuesday": "09:00-18:00",
    ...
  },
  "description": "설명",
  "descriptionEn": "Description",
  "region": "강남",
  "latitude": 37.5665,
  "longitude": 126.9780,
  "rating": 4.5,
  "reviewCount": 120,
  "images": [
    {
      "id": "uuid",
      "url": "url",
      "type": "main"
    }
  ],
  "treatments": [
    {
      "id": "uuid",
      "name": "IPL 레이저",
      "nameEn": "IPL Laser",
      "price": 150000,
      "currency": "KRW"
    }
  ],
  "promotions": [
    {
      "id": "uuid",
      "title": "신규 고객 할인",
      "discountRate": 20,
      "endDate": "2024-12-31"
    }
  ]
}
```

### 4.2 리뷰 API

#### POST /api/reviews
리뷰 작성

**Request Body:**
```json
{
  "clinicId": "uuid",
  "treatmentId": "uuid",
  "rating": 5,
  "content": "리뷰 내용",
  "visitDate": "2024-01-15",
  "images": ["url1", "url2"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "clinicId": "uuid",
  "userId": "uuid",
  "rating": 5,
  "content": "리뷰 내용",
  "visitDate": "2024-01-15",
  "createdAt": "2024-01-20T10:00:00Z"
}
```

#### GET /api/reviews
리뷰 목록 조회

**Query Parameters:**
- `clinicId`: 클리닉 ID (필수)
- `treatmentId`: 시술 종류 필터
- `rating`: 평점 필터
- `page`: 페이지 번호
- `limit`: 페이지당 항목 수
- `sort`: 정렬 기준 (newest, oldest, helpful, rating)

### 4.3 검색 API

#### GET /api/search
통합 검색

**Query Parameters:**
- `q`: 검색어
- `type`: 검색 타입 (clinic, treatment, all)
- `region`: 지역 필터
- `page`: 페이지 번호
- `limit`: 페이지당 항목 수

**Response:**
```json
{
  "clinics": [...],
  "treatments": [...],
  "pagination": {...}
}
```

#### GET /api/search/nearby
근처 클리닉 검색

**Query Parameters:**
- `latitude`: 위도
- `longitude`: 경도
- `radius`: 반경 (km, 기본값: 5)
- `limit`: 최대 결과 수

## 5. 컴포넌트 구조

### 5.1 UI 컴포넌트 (shadcn/ui 기반)
- `Button`
- `Input`
- `Select`
- `Dialog`
- `DropdownMenu`
- `Tabs`
- `Card`
- `Badge`
- `Rating` (커스텀)
- `ImageGallery` (커스텀)

### 5.2 클리닉 컴포넌트
- `ClinicCard`: 클리닉 카드
- `ClinicDetail`: 클리닉 상세 정보
- `ClinicImageGallery`: 이미지 갤러리
- `TreatmentPriceTable`: 시술 가격 테이블
- `ClinicMap`: 지도 표시
- `ClinicFilters`: 필터 사이드바

### 5.3 리뷰 컴포넌트
- `ReviewCard`: 리뷰 카드
- `ReviewForm`: 리뷰 작성 폼
- `ReviewList`: 리뷰 목록
- `ReviewFilters`: 리뷰 필터
- `RatingDisplay`: 평점 표시

### 5.4 검색 컴포넌트
- `SearchBar`: 검색 바
- `SearchResults`: 검색 결과
- `SearchFilters`: 검색 필터

### 5.5 컴포넌트 사용 예시

#### ClinicCard
```tsx
<ClinicCard
  id={clinic.id}
  name={clinic.name}
  image={clinic.mainImage}
  rating={clinic.rating}
  reviewCount={clinic.reviewCount}
  address={clinic.address}
  priceRange={clinic.priceRange}
  region={clinic.region}
/>
```

#### ClinicMap (Google Maps)
```tsx
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

<LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
  <GoogleMap
    mapContainerStyle={{ width: '100%', height: '400px' }}
    center={{ lat: clinic.latitude, lng: clinic.longitude }}
    zoom={15}
  >
    <Marker
      position={{ lat: clinic.latitude, lng: clinic.longitude }}
      title={clinic.name}
    />
  </GoogleMap>
</LoadScript>
```

## 6. 상태 관리

### 6.1 서버 상태
- React Server Components 활용
- Server Actions 사용

### 6.2 클라이언트 상태
- React Context API (테마, 언어 등)
- Zustand (필터 상태, UI 상태 등)

## 7. 성능 최적화

### 7.1 이미지 최적화
- Next.js Image 컴포넌트 사용
- Cloudinary를 통한 이미지 최적화
- Lazy loading

### 7.2 데이터 페칭
- Server Components 활용
- React Suspense
- Incremental Static Regeneration (ISR)
- On-demand Revalidation

### 7.3 번들 최적화
- Dynamic imports
- Code splitting
- Tree shaking

## 8. 보안 고려사항

### 8.1 인증
- NextAuth.js를 통한 안전한 인증
- JWT 토큰 사용
- CSRF 보호

### 8.2 데이터 검증
- Zod를 통한 스키마 검증
- API 요청/응답 검증
- SQL Injection 방지 (Prisma 사용)

### 8.3 파일 업로드
- 파일 타입 검증
- 파일 크기 제한
- 안전한 파일 저장

## 9. 테스트 전략

### 9.1 단위 테스트
- Jest + React Testing Library
- 유틸리티 함수 테스트
- 컴포넌트 테스트

### 9.2 통합 테스트
- API 엔드포인트 테스트
- 데이터베이스 연동 테스트

### 9.3 E2E 테스트
- Playwright 또는 Cypress
- 주요 사용자 플로우 테스트

## 10. 배포 전략

### 10.1 환경
- **Development**: 로컬 개발 환경
- **Staging**: Vercel Preview
- **Production**: Vercel Production

### 10.2 CI/CD
- GitHub Actions
- 자동 테스트 실행
- 자동 배포 (main 브랜치)

### 10.3 모니터링
- Vercel Analytics
- Error Tracking (Sentry)
- Performance Monitoring

## 11. SEO 최적화

### 11.1 메타데이터
- Next.js Metadata API 활용
- 동적 메타데이터 생성
- Open Graph 태그
- Twitter Card

### 11.2 구조화된 데이터
- JSON-LD 스키마
- LocalBusiness 스키마
- Review 스키마

### 11.3 사이트맵
- 동적 사이트맵 생성
- robots.txt 설정

