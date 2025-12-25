# 한국 미용의료 클리닉 어드바이저 프로젝트 계획서

## 1. 프로젝트 개요

### 1.1 목적
한국을 방문하는 미용의료 사용 관광객이 강남 인근 피부시술 클리닉을 쉽게 검색하고, 후기를 확인하며, 가격을 비교할 수 있는 통합 플랫폼 제공

### 1.2 타겟 사용자
- 한국을 방문하는 외국인 관광객 (주로 동남아시아, 중국, 일본 등)
- 피부시술을 고려하는 미용의료 관광객
- 클리닉 정보와 가격을 비교하고 싶은 사용자

### 1.3 핵심 가치 제안
- **신뢰할 수 있는 후기**: 실제 방문객의 리뷰와 평점
- **투명한 가격 정보**: 시술별 가격 비교
- **편리한 위치 검색**: 강남 인근 클리닉 위치 정보 및 지도 연동
- **다국어 지원**: 영어, 중국어, 일본어 등

## 2. 기능 요구사항

### 2.1 클리닉 검색 및 조회
- **지역 기반 검색**: 강남, 청담, 압구정 등 지역별 필터링
- **시술 종류별 검색**: 
  - 레이저 시술 (IPL, 프랙셔널 레이저 등)
  - 보톡스/필러
  - 스킨케어/팩
  - 기타 피부시술
- **가격대 필터**: 예산 범위별 검색
- **평점 정렬**: 높은 평점순, 후기 많은 순
- **지도 뷰**: 클리닉 위치를 지도에서 확인

### 2.2 클리닉 상세 정보
- **기본 정보**:
  - 클리닉명, 주소, 전화번호
  - 운영시간
  - 의료진 정보
  - 시설 사진
- **시술 및 가격 정보**:
  - 시술 종류별 가격표
  - 패키지 상품 정보
  - 프로모션/할인 정보
- **위치 정보**:
  - 지도 표시
  - 대중교통 안내
  - 주변 명소/숙소 정보

### 2.3 리뷰 및 평점 시스템
- **리뷰 작성**:
  - 별점 (1-5점)
  - 시술 종류 선택
  - 리뷰 내용 (텍스트)
  - 사진 업로드 (선택)
  - 방문 날짜
- **리뷰 조회**:
  - 최신순, 평점순 정렬
  - 시술 종류별 필터링
  - 검증된 리뷰 표시
- **평점 집계**:
  - 전체 평점
  - 시술 종류별 평점
  - 최근 6개월 평점 트렌드

### 2.4 사용자 기능
- **회원가입/로그인**:
  - 소셜 로그인 (Google, Kakao)
  - 이메일 회원가입
- **마이페이지**:
  - 내가 작성한 리뷰
  - 즐겨찾기 클리닉
  - 예약 내역 (향후 확장)
- **알림 설정**:
  - 관심 클리닉 할인 알림
  - 새 리뷰 알림

### 2.5 관리자 기능
- **클리닉 관리**:
  - 클리닉 등록/수정/삭제
  - 가격 정보 업데이트
  - 프로모션 등록
- **리뷰 관리**:
  - 부적절한 리뷰 삭제/숨김
  - 스팸 리뷰 필터링
- **통계 대시보드**:
  - 클리닉별 조회수, 리뷰 수
  - 사용자 통계

## 3. 기술 스택

### 3.1 Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: 
  - shadcn/ui 또는 Radix UI
  - React Hook Form (폼 관리)
- **지도**: Google Maps API
- **상태 관리**: Zustand 또는 React Context
- **다국어**: next-intl 또는 i18next

### 3.2 Backend
- **API**: Next.js API Routes (서버리스)
- **인증**: NextAuth.js
- **파일 업로드**: Cloudinary 또는 AWS S3
- **이메일**: Resend 또는 SendGrid

### 3.3 Database
- **주 데이터베이스**: PostgreSQL
- **ORM**: Prisma
- **검색 엔진**: PostgreSQL Full-Text Search 또는 Algolia (향후 확장)

### 3.4 Infrastructure
- **호스팅**: Vercel (Frontend + API)
- **데이터베이스 호스팅**: Supabase, Neon, 또는 Railway
- **CDN**: Vercel Edge Network
- **모니터링**: Vercel Analytics

## 4. 데이터베이스 설계

### 4.1 주요 테이블

#### Users (사용자)
```sql
- id: UUID (Primary Key)
- email: String (Unique)
- name: String
- avatar: String (URL)
- provider: String (google, kakao, email)
- providerId: String
- createdAt: DateTime
- updatedAt: DateTime
```

#### Clinics (클리닉)
```sql
- id: UUID (Primary Key)
- name: String
- nameEn: String (영문명)
- address: String
- addressEn: String
- latitude: Decimal
- longitude: Decimal
- phone: String
- website: String
- operatingHours: JSON
- description: Text
- descriptionEn: Text
- region: String (강남, 청담, 압구정 등)
- createdAt: DateTime
- updatedAt: DateTime
```

#### ClinicImages (클리닉 이미지)
```sql
- id: UUID (Primary Key)
- clinicId: UUID (Foreign Key -> Clinics)
- url: String
- type: String (main, interior, exterior)
- order: Int
- createdAt: DateTime
```

#### Treatments (시술 종류)
```sql
- id: UUID (Primary Key)
- name: String
- nameEn: String
- nameZh: String (중국어)
- nameJa: String (일본어)
- category: String (laser, injectable, skincare, other)
- description: Text
- createdAt: DateTime
```

#### ClinicTreatments (클리닉별 시술 가격)
```sql
- id: UUID (Primary Key)
- clinicId: UUID (Foreign Key -> Clinics)
- treatmentId: UUID (Foreign Key -> Treatments)
- price: Decimal
- currency: String (KRW, USD)
- duration: Int (분)
- description: Text
- isActive: Boolean
- createdAt: DateTime
- updatedAt: DateTime
```

#### Reviews (리뷰)
```sql
- id: UUID (Primary Key)
- userId: UUID (Foreign Key -> Users)
- clinicId: UUID (Foreign Key -> Clinics)
- treatmentId: UUID (Foreign Key -> Treatments)
- rating: Int (1-5)
- content: Text
- visitDate: Date
- isVerified: Boolean
- helpfulCount: Int
- createdAt: DateTime
- updatedAt: DateTime
```

#### ReviewImages (리뷰 이미지)
```sql
- id: UUID (Primary Key)
- reviewId: UUID (Foreign Key -> Reviews)
- url: String
- order: Int
- createdAt: DateTime
```

#### Favorites (즐겨찾기)
```sql
- id: UUID (Primary Key)
- userId: UUID (Foreign Key -> Users)
- clinicId: UUID (Foreign Key -> Clinics)
- createdAt: DateTime
```

#### Promotions (프로모션)
```sql
- id: UUID (Primary Key)
- clinicId: UUID (Foreign Key -> Clinics)
- title: String
- description: Text
- discountRate: Int (%)
- startDate: Date
- endDate: Date
- isActive: Boolean
- createdAt: DateTime
```

## 5. API 설계

### 5.1 클리닉 관련 API
- `GET /api/clinics` - 클리닉 목록 조회 (필터링, 정렬, 페이지네이션)
- `GET /api/clinics/[id]` - 클리닉 상세 정보
- `GET /api/clinics/[id]/treatments` - 클리닉 시술 가격 정보
- `GET /api/clinics/[id]/reviews` - 클리닉 리뷰 목록
- `POST /api/clinics` - 클리닉 등록 (관리자)
- `PUT /api/clinics/[id]` - 클리닉 수정 (관리자)

### 5.2 리뷰 관련 API
- `GET /api/reviews` - 리뷰 목록 조회
- `GET /api/reviews/[id]` - 리뷰 상세
- `POST /api/reviews` - 리뷰 작성
- `PUT /api/reviews/[id]` - 리뷰 수정
- `DELETE /api/reviews/[id]` - 리뷰 삭제
- `POST /api/reviews/[id]/helpful` - 리뷰 도움됨 표시

### 5.3 사용자 관련 API
- `GET /api/users/me` - 현재 사용자 정보
- `GET /api/users/me/reviews` - 내 리뷰 목록
- `GET /api/users/me/favorites` - 즐겨찾기 목록
- `POST /api/users/me/favorites` - 즐겨찾기 추가
- `DELETE /api/users/me/favorites/[clinicId]` - 즐겨찾기 삭제

### 5.4 검색 관련 API
- `GET /api/search` - 통합 검색 (클리닉명, 지역, 시술 종류)
- `GET /api/search/nearby` - 근처 클리닉 검색 (위치 기반)

## 6. UI/UX 설계

### 6.1 주요 페이지

#### 홈페이지
- **히어로 섹션**: 서비스 소개 및 검색 바
- **인기 클리닉**: 평점 높은 클리닉 TOP 10
- **최신 리뷰**: 최근 작성된 리뷰
- **지역별 클리닉**: 강남, 청담, 압구정 등 지역별 카테고리

#### 클리닉 검색 페이지
- **필터 사이드바**:
  - 지역 선택
  - 시술 종류 선택
  - 가격대 선택
  - 평점 필터
- **검색 결과**:
  - 리스트 뷰 / 지도 뷰 토글
  - 클리닉 카드 (이미지, 이름, 평점, 가격 범위, 위치)
  - 페이지네이션

#### 클리닉 상세 페이지
- **상단 섹션**:
  - 이미지 갤러리
  - 클리닉 기본 정보
  - 평점 및 리뷰 수
  - 즐겨찾기 버튼
- **탭 메뉴**:
  - Overview (개요)
  - Treatments & Prices (시술 및 가격)
  - Reviews (리뷰)
  - Location (위치)
- **시술 가격 테이블**: 시술별 가격 비교
- **리뷰 섹션**: 필터링 및 정렬 기능

#### 리뷰 작성 페이지
- **폼 필드**:
  - 클리닉 선택
  - 시술 종류 선택
  - 별점 선택
  - 방문 날짜
  - 리뷰 내용
  - 사진 업로드
- **가이드라인**: 리뷰 작성 가이드 표시

#### 마이페이지
- **프로필 정보**
- **내 리뷰**: 작성한 리뷰 목록 및 수정/삭제
- **즐겨찾기**: 저장한 클리닉 목록

### 6.2 반응형 디자인
- **모바일 우선**: 모바일 사용자 비중이 높을 것으로 예상
- **브레이크포인트**:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

### 6.3 다국어 지원
- **지원 언어**: 한국어, 영어, 중국어(간체), 일본어
- **언어 전환**: 헤더에 언어 선택 드롭다운
- **번역 우선순위**: 영어 > 중국어 > 일본어

## 7. 개발 단계별 계획

### Phase 1: 기초 설정 및 인프라 (1-2주)
- [ ] Next.js 프로젝트 초기 설정
- [ ] Tailwind CSS 설정
- [ ] PostgreSQL 데이터베이스 설정
- [ ] Prisma ORM 설정
- [ ] 기본 레이아웃 및 네비게이션
- [ ] 다국어 설정

### Phase 2: 인증 및 사용자 관리 (1주)
- [ ] NextAuth.js 설정
- [ ] 소셜 로그인 구현 (Google, Kakao)
- [ ] 사용자 프로필 페이지
- [ ] 인증 미들웨어

### Phase 3: 클리닉 관리 (2주)
- [ ] 클리닉 데이터 모델 구현
- [ ] 클리닉 CRUD API
- [ ] 클리닉 목록 페이지
- [ ] 클리닉 상세 페이지
- [ ] 클리닉 검색 기능
- [ ] 지도 연동 (Google Maps)

### Phase 4: 시술 및 가격 정보 (1주)
- [ ] 시술 데이터 모델 구현
- [ ] 클리닉별 시술 가격 관리
- [ ] 가격 비교 기능
- [ ] 시술 필터링

### Phase 5: 리뷰 시스템 (2주)
- [ ] 리뷰 데이터 모델 구현
- [ ] 리뷰 작성/수정/삭제 기능
- [ ] 리뷰 목록 및 필터링
- [ ] 평점 집계 시스템
- [ ] 이미지 업로드 기능
- [ ] 리뷰 검증 로직

### Phase 6: 고급 기능 (2주)
- [ ] 즐겨찾기 기능
- [ ] 프로모션 시스템
- [ ] 통합 검색 기능
- [ ] 위치 기반 검색
- [ ] 통계 대시보드 (관리자)

### Phase 7: UI/UX 개선 및 최적화 (1-2주)
- [ ] 반응형 디자인 완성
- [ ] 성능 최적화
- [ ] SEO 최적화
- [ ] 접근성 개선
- [ ] 다국어 번역 완성

### Phase 8: 테스트 및 배포 (1주)
- [ ] 단위 테스트
- [ ] 통합 테스트
- [ ] 사용자 테스트
- [ ] 프로덕션 배포
- [ ] 모니터링 설정

## 8. 데이터 수집 전략

### 8.1 초기 데이터
- **클리닉 정보**: 
  - 공개된 정보 수집 (웹사이트, 네이버 지도 등)
  - 직접 연락을 통한 정보 확인
- **가격 정보**:
  - 클리닉 웹사이트에서 공개된 가격
  - 직접 문의를 통한 가격 확인
- **시드 리뷰**: 
  - 베타 테스터를 통한 초기 리뷰 작성

### 8.2 지속적인 데이터 관리
- **클리닉 정보 업데이트**: 정기적인 정보 갱신
- **가격 모니터링**: 가격 변동 추적
- **리뷰 관리**: 스팸 및 부적절한 리뷰 필터링

## 9. 마케팅 및 성장 전략

### 9.1 초기 런칭
- **타겟 지역**: 강남 인근 클리닉 집중
- **파트너십**: 주요 클리닉과의 협력 관계 구축
- **콘텐츠 마케팅**: 블로그, SNS를 통한 정보 제공

### 9.2 사용자 확보
- **SEO 최적화**: 검색 엔진 최적화
- **소셜 미디어**: Instagram, Facebook 마케팅
- **인플루언서 협업**: 미용 관광 관련 인플루언서

### 9.3 사용자 참여 유도
- **리뷰 작성 인센티브**: 리뷰 작성 시 혜택 제공
- **추천 프로그램**: 친구 추천 시 양쪽 모두 혜택
- **이벤트**: 정기적인 프로모션 이벤트

## 10. 법적 고려사항

### 10.1 의료 광고 규제
- **의료법 준수**: 과대 광고 금지
- **의료진 정보**: 면허 정보 확인
- **시술 안내**: 시술 전 상담 필요성 강조

### 10.2 개인정보 보호
- **GDPR 준수**: 유럽 사용자 대응
- **개인정보 처리방침**: 명확한 개인정보 처리 방침
- **쿠키 정책**: 쿠키 사용 안내

### 10.3 리뷰 신뢰성
- **검증 시스템**: 실제 방문 확인 (선택적)
- **공정성**: 부정 리뷰 필터링
- **투명성**: 리뷰 정책 명시

## 11. 향후 확장 계획

### 11.1 기능 확장
- **예약 시스템**: 클리닉 예약 연동
- **채팅 상담**: 클리닉과의 실시간 상담
- **비교 기능**: 여러 클리닉 동시 비교
- **알림 시스템**: 가격 변동, 할인 알림

### 11.2 지역 확장
- **서울 전역**: 강남 외 지역 확장
- **부산, 제주**: 관광 도시 확장
- **전국**: 전국 클리닉 커버리지

### 11.3 시술 확장
- **성형외과**: 성형 시술 추가
- **치과**: 치과 시술 추가
- **한의원**: 한방 치료 추가

## 12. 성공 지표 (KPI)

### 12.1 사용자 지표
- 월간 활성 사용자 (MAU)
- 신규 사용자 수
- 사용자 재방문률
- 평균 세션 시간

### 12.2 콘텐츠 지표
- 등록된 클리닉 수
- 리뷰 작성 수
- 리뷰 평균 평점
- 검색 쿼리 수

### 12.3 비즈니스 지표
- 클리닉 페이지 조회수
- 클리닉 웹사이트 클릭률
- 리뷰 작성률
- 사용자 만족도

## 13. 예상 일정

- **총 개발 기간**: 10-12주
- **MVP 런칭**: 8-10주
- **베타 테스트**: 2주
- **정식 런칭**: 12주차

## 14. 예산 고려사항

### 14.1 개발 비용
- 개발자 인건비
- 디자이너 비용
- 프로젝트 관리 비용

### 14.2 인프라 비용
- 호스팅 (Vercel Pro)
- 데이터베이스 (Supabase/Neon)
- 지도 API (Google Maps)
- 이미지 스토리지 (Cloudinary)
- 도메인 및 SSL

### 14.3 운영 비용
- 마케팅 비용
- 콘텐츠 제작 비용
- 고객 지원 비용

---

이 계획서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.

