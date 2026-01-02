# 사용자 정보 UI 구조

## 📋 개요

사용자 정보는 두 곳에서 표시됩니다:
1. **Header** - 전역 네비게이션 바의 사용자 프로필
2. **AccountInfo 컴포넌트** - `/account` 페이지의 상세 사용자 정보

---

## 🎨 UI 구조 다이어그램

```
┌─────────────────────────────────────────────────────────────┐
│                    Header (전역)                              │
├─────────────────────────────────────────────────────────────┤
│  [로고]  [검색바]  [클리닉]  [사용자 프로필] [로그아웃]      │
│                              ↓                               │
│                    ┌─────────────────┐                      │
│                    │ 프로필 이미지    │                      │
│                    │ (8x8 rounded)    │                      │
│                    │ 이름/이메일      │                      │
│                    └─────────────────┘                      │
│                    클릭 → /account                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              /account 페이지                                  │
├─────────────────────────────────────────────────────────────┤
│  <h1>내 계정 정보</h1>                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ AccountInfo 컴포넌트                                  │   │
│  │                                                       │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ 1. 기본 정보 카드                                │ │   │
│  │ │    ┌──────────┐  이름 (2xl)                    │ │   │
│  │ │    │ 프로필   │  이메일 (Mail 아이콘)            │ │   │
│  │ │    │ 이미지   │  ─────────────────              │ │   │
│  │ │    │ (20x20)  │  역할: 사용자/관리자 (Shield)    │ │   │
│  │ │    └──────────┘  가입일: YYYY.MM.DD (Calendar)  │ │   │
│  │ └─────────────────────────────────────────────────┘ │   │
│  │                                                       │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ 2. 연결된 계정 카드                              │ │   │
│  │ │    🔵 Google (oauth)                            │ │   │
│  │ │    Provider Account ID: xxx                     │ │   │
│  │ │    [연결됨] 배지                                 │ │   │
│  │ │    ─────────────────                            │ │   │
│  │ │    주 로그인 Provider: google                   │ │   │
│  │ │    Provider ID: xxx                             │ │   │
│  │ └─────────────────────────────────────────────────┘ │   │
│  │                                                       │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ 3. 활동 통계 카드                                │ │   │
│  │ │    ┌──────────┐  ┌──────────┐                  │ │   │
│  │ │    │   리뷰   │  │ 즐겨찾기 │                  │ │   │
│  │ │    │    0     │  │    0     │                  │ │   │
│  │ │    └──────────┘  └──────────┘                  │ │   │
│  │ └─────────────────────────────────────────────────┘ │   │
│  │                                                       │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ 4. 활성 세션 카드                                │ │   │
│  │ │    세션 ID: abc12345...                         │ │   │
│  │ │    만료일: YYYY.MM.DD HH:MM                     │ │   │
│  │ │    [활성/만료됨] 배지                            │ │   │
│  │ └─────────────────────────────────────────────────┘ │   │
│  │                                                       │   │
│  │                                    [로그아웃 버튼]   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ Header 사용자 정보

### 위치
- **파일**: `components/layout/Header.tsx`
- **표시 위치**: 헤더 우측 네비게이션 영역

### UI 구조

```tsx
{session ? (
  <div className="flex items-center gap-3">
    <Link href="/account" className="flex items-center gap-2">
      {/* 프로필 이미지 */}
      {session.user?.image ? (
        <img
          src={session.user.image}
          alt={session.user.name || 'User'}
          className="w-8 h-8 rounded-full"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
      )}
      
      {/* 이름/이메일 */}
      <span className="hidden md:inline">
        {session.user?.name || session.user?.email}
      </span>
    </Link>
    
    {/* 로그아웃 버튼 */}
    <Button onClick={handleSignOut} variant="outline" size="sm">
      <LogOut className="w-4 h-4" />
      <span className="hidden sm:inline">로그아웃</span>
    </Button>
  </div>
) : (
  <Link href="/login">
    <Button variant="outline" size="sm">로그인</Button>
  </Link>
)}
```

### 표시 정보
- **프로필 이미지**: `session.user.image` (8x8, rounded-full)
- **이름/이메일**: `session.user.name` 또는 `session.user.email`
- **반응형**: 모바일에서는 이름 숨김 (md 이상에서만 표시)

### 스타일링
- **프로필 이미지**: `w-8 h-8 rounded-full`
- **기본 아이콘**: `w-8 h-8 rounded-full bg-primary/10` + User 아이콘
- **링크**: `hover:text-primary transition-colors`
- **반응형**: `hidden md:inline` (이름), `hidden sm:inline` (로그아웃 텍스트)

---

## 2️⃣ AccountInfo 컴포넌트 사용자 정보

### 위치
- **파일**: `components/account/AccountInfo.tsx`
- **표시 위치**: `/account` 페이지 메인 컨텐츠

### UI 구조

#### 1. 기본 정보 카드

```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <User className="w-5 h-5" />
      기본 정보
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* 프로필 영역 */}
    <div className="flex items-center gap-4">
      {/* 프로필 이미지 */}
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name || 'User'}
          className="w-20 h-20 rounded-full"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-10 h-10 text-primary" />
        </div>
      )}
      
      {/* 이름과 이메일 */}
      <div>
        <h2 className="text-2xl font-semibold">
          {user.name || '이름 없음'}
        </h2>
        <p className="text-gray-600 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          {user.email}
        </p>
      </div>
    </div>
    
    {/* 역할과 가입일 */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600">역할:</span>
        <span className="font-medium">
          {user.role === 'admin' ? '관리자' : '사용자'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600">가입일:</span>
        <span className="font-medium">
          {new Date(user.createdAt).toLocaleDateString('ko-KR')}
        </span>
      </div>
    </div>
  </CardContent>
</Card>
```

**표시 정보:**
- 프로필 이미지 (20x20, rounded-full)
- 이름 (`user.name` 또는 "이름 없음")
- 이메일 (`user.email`, Mail 아이콘)
- 역할 (`user.role`: "관리자" 또는 "사용자", Shield 아이콘)
- 가입일 (`user.createdAt`, Calendar 아이콘, 한국어 형식)

**스타일링:**
- 프로필 이미지: `w-20 h-20 rounded-full`
- 기본 아이콘: `w-20 h-20 rounded-full bg-primary/10` + User 아이콘 (w-10 h-10)
- 이름: `text-2xl font-semibold`
- 이메일: `text-gray-600` + Mail 아이콘
- 그리드 레이아웃: `grid-cols-1 md:grid-cols-2` (반응형)

#### 2. 연결된 계정 카드

```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <LinkIcon className="w-5 h-5" />
      연결된 계정
    </CardTitle>
  </CardHeader>
  <CardContent>
    {accounts.length > 0 ? (
      <div className="space-y-3">
        {accounts.map((account) => (
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {account.provider === 'google' ? '🔵 Google' : '🟡 Kakao'}
                </span>
                <span className="text-sm text-gray-500">
                  ({account.type})
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Provider Account ID: {account.providerAccountId}
              </p>
            </div>
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              연결됨
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-600">연결된 OAuth 계정이 없습니다.</p>
    )}
    
    {/* 주 로그인 Provider 정보 */}
    {user.provider && (
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>주 로그인 Provider:</strong> {user.provider}
        </p>
        {user.providerId && (
          <p className="text-sm text-gray-600 mt-1">
            Provider ID: {user.providerId}
          </p>
        )}
      </div>
    )}
  </CardContent>
</Card>
```

**표시 정보:**
- OAuth 계정 목록 (Google/Kakao)
- Provider Account ID
- 연결 상태 배지 ("연결됨")
- 주 로그인 Provider 정보 (파란색 박스)

**스타일링:**
- 계정 항목: `p-4 border rounded-lg`
- 연결 배지: `bg-green-100 text-green-800 rounded-full`
- Provider 정보 박스: `bg-blue-50 rounded-lg`

#### 3. 활동 통계 카드

```tsx
<Card>
  <CardHeader>
    <CardTitle>활동 통계</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center p-4 border rounded-lg">
        <div className="text-2xl font-bold text-primary">
          {stats.reviews}
        </div>
        <div className="text-sm text-gray-600 mt-1">작성한 리뷰</div>
      </div>
      <div className="text-center p-4 border rounded-lg">
        <div className="text-2xl font-bold text-primary">
          {stats.favorites}
        </div>
        <div className="text-sm text-gray-600 mt-1">즐겨찾기</div>
      </div>
    </div>
  </CardContent>
</Card>
```

**표시 정보:**
- 작성한 리뷰 수 (`stats.reviews`)
- 즐겨찾기 수 (`stats.favorites`)

**스타일링:**
- 그리드 레이아웃: `grid-cols-2 gap-4`
- 숫자: `text-2xl font-bold text-primary`
- 라벨: `text-sm text-gray-600`

#### 4. 활성 세션 카드

```tsx
<Card>
  <CardHeader>
    <CardTitle>활성 세션</CardTitle>
  </CardHeader>
  <CardContent>
    {sessions.length > 0 ? (
      <div className="space-y-2">
        {sessions.map((session) => (
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm">
                세션 ID: {session.id.substring(0, 8)}...
              </p>
              <p className="text-xs text-gray-500">
                만료일: {new Date(session.expires).toLocaleString('ko-KR')}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              session.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {session.isActive ? '활성' : '만료됨'}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-600">세션 정보가 없습니다.</p>
    )}
  </CardContent>
</Card>
```

**표시 정보:**
- 세션 ID (처음 8자만 표시)
- 만료일 (한국어 형식)
- 활성/만료 상태 배지

**스타일링:**
- 세션 항목: `p-3 border rounded-lg`
- 활성 배지: `bg-green-100 text-green-800`
- 만료 배지: `bg-gray-100 text-gray-800`

#### 5. 로그아웃 버튼

```tsx
<div className="flex justify-end">
  <Button 
    onClick={handleSignOut} 
    variant="outline" 
    className="flex items-center gap-2"
  >
    <LogOut className="w-4 h-4" />
    로그아웃
  </Button>
</div>
```

**스타일링:**
- 우측 정렬: `flex justify-end`
- 아이콘 + 텍스트: `flex items-center gap-2`

---

## 🎨 공통 UI 컴포넌트

### Card 컴포넌트
```tsx
// components/ui/Card.tsx
<Card>                    // rounded-lg border bg-card shadow-sm
  <CardHeader>            // flex flex-col space-y-1.5 p-6
    <CardTitle>           // text-2xl font-semibold
      제목
    </CardTitle>
  </CardHeader>
  <CardContent>           // p-6 pt-0
    내용
  </CardContent>
</Card>
```

### Button 컴포넌트
```tsx
// components/ui/Button.tsx
<Button 
  variant="outline"       // primary | secondary | outline | ghost
  size="sm"               // sm | md | lg
>
  버튼 텍스트
</Button>
```

---

## 📱 반응형 디자인

### 모바일 (< 768px)
- Header: 프로필 이미지만 표시 (이름 숨김)
- 기본 정보: 1열 그리드 (역할, 가입일)
- 활동 통계: 2열 유지 (작은 화면에서도)

### 태블릿 (≥ 768px)
- Header: 프로필 이미지 + 이름 표시
- 기본 정보: 2열 그리드 (역할, 가입일)

### 데스크톱 (≥ 1024px)
- 모든 요소 표시
- 최대 너비: `max-w-4xl` (AccountInfo)

---

## 🔄 상태 관리

### 로딩 상태
```tsx
if (status === 'loading' || loading) {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
```

### 에러 상태
```tsx
if (!accountData) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-gray-600">계정 정보를 불러올 수 없습니다.</p>
      </CardContent>
    </Card>
  );
}
```

### 성공 상태
- 모든 카드 섹션 표시
- 사용자 정보 표시

---

## 🎯 사용자 정보 필드 매핑

| UI 표시 | 데이터 소스 | 타입 | 기본값 |
|---------|------------|------|--------|
| 프로필 이미지 | `user.avatar` | `string \| null` | User 아이콘 |
| 이름 | `user.name` | `string \| null` | "이름 없음" |
| 이메일 | `user.email` | `string` | - |
| 역할 | `user.role` | `string` | "user" → "사용자" |
| 가입일 | `user.createdAt` | `Date` | - |
| OAuth Provider | `account.provider` | `string` | - |
| Provider ID | `account.providerAccountId` | `string` | - |
| 주 Provider | `user.provider` | `string \| null` | - |
| 리뷰 수 | `stats.reviews` | `number` | 0 |
| 즐겨찾기 수 | `stats.favorites` | `number` | 0 |
| 세션 ID | `session.id` | `string` | - |
| 세션 만료일 | `session.expires` | `Date` | - |
| 세션 상태 | `session.isActive` | `boolean` | - |

---

## ✅ 체크리스트

- [x] Header 사용자 정보 표시
- [x] AccountInfo 기본 정보 카드
- [x] OAuth 계정 연결 정보 표시
- [x] 활동 통계 표시
- [x] 세션 정보 표시
- [x] 로그아웃 기능
- [x] 로딩 상태 처리
- [x] 에러 상태 처리
- [x] 반응형 디자인
- [x] 아이콘 사용 (lucide-react)
- [x] Toast 알림

---

## 🔗 관련 파일

- `components/account/AccountInfo.tsx` - 메인 사용자 정보 컴포넌트
- `components/layout/Header.tsx` - Header 사용자 프로필
- `components/ui/Card.tsx` - Card UI 컴포넌트
- `components/ui/Button.tsx` - Button UI 컴포넌트
- `app/(main)/account/page.tsx` - Account 페이지
- `app/api/users/me/route.ts` - 사용자 데이터 API

