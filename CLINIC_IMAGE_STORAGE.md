# 클리닉 이미지 저장 위치 및 관리

## 📋 현재 구현 상태

### 1. 데이터베이스 스키마

**Prisma ClinicImage 모델:**
```prisma
model ClinicImage {
  id        String   @id @default(uuid())
  clinicId  String
  url       String   // 이미지 URL 저장
  type      String   // main, interior, exterior
  order     Int      @default(0)
  createdAt DateTime @default(now())

  clinic Clinic @relation(fields: [clinicId], references: [id], onDelete: Cascade)

  @@index([clinicId])
  @@map("clinic_images")
}
```

**특징:**
- 이미지 파일 자체는 저장하지 않음
- `url` 필드에 이미지 URL만 저장
- 외부 URL 또는 로컬 경로를 URL로 저장

---

## 🔍 현재 이미지 저장 방식

### 1. 데이터베이스 저장
- **위치**: PostgreSQL `clinic_images` 테이블
- **저장 내용**: 이미지 URL (String)
- **타입**: `main`, `interior`, `exterior`
- **순서**: `order` 필드로 정렬

### 2. 실제 파일 저장 위치

**현재 상태:**
- ❌ 파일 업로드 API 없음
- ❌ Cloudinary 연동 없음 (설치되어 있지만 미사용)
- ✅ `public/images/` 폴더에 placeholder 이미지만 있음

**사용 중인 이미지:**
- `public/images/placeholder-clinic.jpg` - 기본 placeholder 이미지

---

## 📊 이미지 URL 형식

### 현재 사용 중인 URL 형식

1. **로컬 경로:**
   ```
   /images/clinics/clinic-001.jpg
   /images/placeholder-clinic.jpg
   ```

2. **외부 URL:**
   ```
   https://res.cloudinary.com/...
   http://img1.kakaocdn.net/...
   ```

3. **데이터베이스에 저장된 예시:**
   ```typescript
   {
     id: "uuid",
     clinicId: "clinic-uuid",
     url: "/images/clinics/clinic-001.jpg",  // 또는 외부 URL
     type: "main",
     order: 0
   }
   ```

---

## 🔧 이미지 사용 위치

### 1. ClinicCard 컴포넌트
```typescript
const mainImage = clinic.images?.[0]?.url || '/images/placeholder-clinic.jpg';
```

### 2. ClinicDetail 컴포넌트
```typescript
const mainImage = clinic.images?.find(img => img.type === 'main')?.url || clinic.images?.[0]?.url;
```

### 3. Fallback 처리
- 이미지 로드 실패 시 `/images/placeholder-clinic.jpg` 사용
- `onError` 핸들러로 자동 fallback

---

## 📁 파일 시스템 구조

```
public/
├── images/
│   ├── placeholder-clinic.jpg  ✅ 사용 중
│   └── clinics/                ❌ 폴더 없음 (필요 시 생성)
│       └── clinic-001.jpg      ❌ 파일 없음
```

---

## 🚀 개선 방안

### 옵션 1: 로컬 파일 저장 (현재 방식 확장)

**장점:**
- 간단한 구현
- 추가 서비스 불필요
- 비용 없음

**단점:**
- 서버 스토리지 관리 필요
- 확장성 제한
- CDN 없음

**구현:**
1. `public/images/clinics/` 폴더 생성
2. 파일 업로드 API 생성 (`/api/clinics/[id]/images`)
3. `multer` 또는 `formidable` 사용
4. 파일명: `clinic-{id}-{timestamp}.jpg`

### 옵션 2: Cloudinary 사용 (권장)

**장점:**
- 자동 이미지 최적화
- CDN 제공
- 다양한 변환 옵션
- 확장성 좋음

**단점:**
- 외부 서비스 의존
- 비용 발생 가능

**구현:**
1. Cloudinary 계정 설정
2. 환경 변수 설정
3. 업로드 API 생성
4. 이미지 URL을 Cloudinary URL로 저장

### 옵션 3: AWS S3 사용

**장점:**
- 확장성 우수
- 안정적
- CDN 연동 가능

**단점:**
- 설정 복잡
- 비용 발생

---

## ✅ 현재 권장 사항

### 단기 (현재)
- ✅ 외부 URL 사용 (이미 구현됨)
- ✅ Placeholder 이미지 사용
- ✅ Fallback 처리

### 중기 (개선)
- 🔄 Cloudinary 연동
- 🔄 이미지 업로드 API 구현
- 🔄 이미지 최적화

### 장기 (확장)
- 📈 CDN 연동
- 📈 이미지 자동 리사이징
- 📈 WebP 형식 지원

---

## 📝 참고 사항

1. **현재 이미지 업로드 기능 없음**
   - 관리자 페이지에서 URL 직접 입력
   - 또는 외부 서비스에서 이미지 업로드 후 URL 복사

2. **Cloudinary 설치되어 있지만 미사용**
   - `package.json`에 `cloudinary` 패키지 있음
   - 실제 연동 코드 없음

3. **Next.js Image 최적화**
   - `next/image` 컴포넌트 사용 중
   - `next.config.js`에 이미지 도메인 설정됨

---

## 🔗 관련 파일

- `prisma/schema.prisma` - ClinicImage 모델 정의
- `components/clinic/ClinicCard.tsx` - 이미지 표시
- `components/clinic/ClinicDetail.tsx` - 이미지 표시
- `next.config.js` - 이미지 도메인 설정
- `public/images/` - 로컬 이미지 저장 위치

