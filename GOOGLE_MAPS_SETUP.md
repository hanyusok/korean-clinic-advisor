# Google Maps API 연동 가이드

이 문서는 Google Maps API를 프로젝트에 연동하는 방법을 안내합니다.

## 📋 목차

1. [Google Maps API 키 발급](#1-google-maps-api-키-발급)
2. [환경 변수 설정](#2-환경-변수-설정)
3. [컴포넌트 구현](#3-컴포넌트-구현)
4. [사용 방법](#4-사용-방법)
5. [문제 해결](#5-문제-해결)

---

## 1. Google Maps API 키 발급

### 1단계: Google Cloud Console 접속

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속합니다.
2. Google 계정으로 로그인합니다.
3. 프로젝트를 선택하거나 새 프로젝트를 생성합니다.

### 2단계: Maps JavaScript API 활성화

1. 좌측 메뉴에서 **"API 및 서비스"** > **"라이브러리"** 선택
2. 검색창에 **"Maps JavaScript API"** 검색
3. **Maps JavaScript API** 선택
4. **"사용 설정"** 버튼 클릭

### 3단계: API 키 생성

1. 좌측 메뉴에서 **"API 및 서비스"** > **"사용자 인증 정보"** 선택
2. 상단의 **"+ 사용자 인증 정보 만들기"** 클릭
3. **"API 키"** 선택
4. 생성된 API 키를 복사합니다.

### 4단계: API 키 제한 설정 (보안 권장)

1. 생성된 API 키를 클릭하여 편집
2. **"애플리케이션 제한사항"** 섹션에서:
   - **"HTTP 리퍼러(웹사이트)"** 선택
   - **"웹사이트 제한사항"**에 다음 추가:
     ```
     http://localhost:3000/*
     https://yourdomain.com/*
     ```
3. **"API 제한사항"** 섹션에서:
   - **"키를 다음 API로 제한"** 선택
   - **"Maps JavaScript API"** 체크
4. **"저장"** 클릭

---

## 2. 환경 변수 설정

### `.env.local` 파일에 추가

프로젝트 루트의 `.env.local` 파일에 다음을 추가합니다:

```env
# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key-here"
```

**중요 사항:**
- `NEXT_PUBLIC_` 접두사가 필요합니다 (클라이언트에서 접근 가능하도록)
- API 키는 공개되므로 제한 설정을 반드시 해야 합니다
- `.env.local` 파일은 `.gitignore`에 포함되어 있어야 합니다

---

## 3. 컴포넌트 구현

### 3.1 Google Maps 컴포넌트 생성

`components/map/ClinicMap.tsx` 파일을 생성합니다:

```tsx
'use client';

import { useMemo } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

interface ClinicMapProps {
  latitude: number;
  longitude: number;
  clinicName: string;
  address?: string;
  height?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = {
  lat: 37.5665, // 서울시청 기본 좌표
  lng: 126.9780,
};

export function ClinicMap({
  latitude,
  longitude,
  clinicName,
  address,
  height = '400px',
}: ClinicMapProps) {
  const center = useMemo(
    () => ({
      lat: Number(latitude),
      lng: Number(longitude),
    }),
    [latitude, longitude]
  );

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="h-96 w-full bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">
          Google Maps API 키가 설정되지 않았습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden" style={{ height }}>
      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={{ ...mapContainerStyle, height }}
          center={center}
          zoom={15}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: true,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
        >
          <Marker
            position={center}
            title={clinicName}
            label={{
              text: clinicName,
              color: '#000',
              fontWeight: 'bold',
            }}
          />
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
```

### 3.2 지도 스타일 커스터마이징 (선택사항)

더 세련된 지도 스타일을 원한다면 `mapStyles`를 추가할 수 있습니다:

```tsx
const mapStyles = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  // 추가 스타일...
];
```

---

## 4. 사용 방법

### 4.1 ClinicDetail 컴포넌트에 통합

`components/clinic/ClinicDetail.tsx` 파일을 수정합니다:

```tsx
import { ClinicMap } from '@/components/map/ClinicMap';

// location 탭에서:
{activeTab === 'location' && (
  <div>
    <h3 className="text-xl font-semibold mb-4">위치</h3>
    {clinic.latitude && clinic.longitude ? (
      <ClinicMap
        latitude={Number(clinic.latitude)}
        longitude={Number(clinic.longitude)}
        clinicName={clinic.name}
        address={clinic.address}
        height="500px"
      />
    ) : (
      <p className="text-gray-600">위치 정보가 없습니다.</p>
    )}
  </div>
)}
```

---

## 5. 문제 해결

### 5.1 "Google Maps JavaScript API error: RefererNotAllowedMapError"

**원인:** API 키 제한 설정에서 현재 도메인이 허용되지 않음

**해결:**
1. Google Cloud Console > 사용자 인증 정보
2. API 키 편집
3. HTTP 리퍼러에 현재 도메인 추가

### 5.2 "Google Maps JavaScript API error: ApiNotActivatedMapError"

**원인:** Maps JavaScript API가 활성화되지 않음

**해결:**
1. Google Cloud Console > API 및 서비스 > 라이브러리
2. "Maps JavaScript API" 검색
3. "사용 설정" 클릭

### 5.3 지도가 표시되지 않음

**원인:**
- API 키가 설정되지 않음
- 환경 변수가 제대로 로드되지 않음

**해결:**
1. `.env.local` 파일에 `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` 확인
2. 개발 서버 재시작 (`npm run dev`)
3. 브라우저 콘솔에서 에러 메시지 확인

### 5.4 빌드 오류

**원인:** 클라이언트 컴포넌트에서 환경 변수 접근 문제

**해결:**
- `NEXT_PUBLIC_` 접두사 확인
- 컴포넌트가 `'use client'`로 시작하는지 확인

---

## 6. 비용 안내

Google Maps API는 사용량에 따라 과금됩니다:

- **무료 할당량**: 월 $200 크레딧
- **Maps JavaScript API**: 월 28,000회 로드까지 무료
- **추가 사용**: $7.00 per 1,000 로드

**비용 절감 팁:**
- 지도 캐싱 활용
- 필요한 경우에만 지도 로드 (lazy loading)
- 정적 지도 이미지 API 사용 고려 (저렴함)

---

## 7. 추가 기능

### 7.1 여러 마커 표시

```tsx
{clinics.map((clinic) => (
  <Marker
    key={clinic.id}
    position={{ lat: Number(clinic.latitude), lng: Number(clinic.longitude) }}
    title={clinic.name}
  />
))}
```

### 7.2 정보 창(InfoWindow) 추가

```tsx
import { InfoWindow } from '@react-google-maps/api';

<Marker position={center}>
  <InfoWindow>
    <div>
      <h3>{clinicName}</h3>
      <p>{address}</p>
    </div>
  </InfoWindow>
</Marker>
```

### 7.3 경로 표시

```tsx
import { DirectionsRenderer } from '@react-google-maps/api';
```

---

## 📚 참고 자료

- [Google Maps JavaScript API 문서](https://developers.google.com/maps/documentation/javascript)
- [@react-google-maps/api 문서](https://react-google-maps-api-docs.netlify.app/)
- [Google Maps API 가격](https://mapsplatform.google.com/pricing/)

---

## ✅ 체크리스트

- [ ] Google Cloud Console에서 프로젝트 생성
- [ ] Maps JavaScript API 활성화
- [ ] API 키 생성 및 제한 설정
- [ ] `.env.local`에 API 키 추가
- [ ] `ClinicMap` 컴포넌트 생성
- [ ] `ClinicDetail`에 지도 통합
- [ ] 개발 서버에서 테스트
- [ ] 프로덕션 환경에서 API 키 제한 확인

