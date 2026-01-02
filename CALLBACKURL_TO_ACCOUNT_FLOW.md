# callbackUrl → 사용자 정보 UI 플로우 확인

## 📋 확인 결과

### ✅ callbackUrl이 `/account`로 흐르는 것이 올바릅니다

**이유:**
1. `/account` 페이지는 사용자 정보 UI입니다
2. 비로그인 사용자가 `/account` 접근 시 로그인 후 원래 페이지로 돌아가야 합니다
3. 사용자 경험(UX) 측면에서 올바른 플로우입니다

---

## 🔄 현재 플로우 (정상 작동)

```
사용자가 /account 접근 (비로그인)
    ↓
app/(main)/account/page.tsx
    ↓
getServerSession() → 세션 없음
    ↓
redirect('/login?callbackUrl=/account')
    ↓
/login 페이지 표시 (URL: /login?callbackUrl=/account)
    ↓
LoginForm.tsx
    ↓
useSearchParams() → callbackUrl = '/account'
    ↓
Google/Kakao 로그인 버튼 클릭
    ↓
signIn('google', { callbackUrl: '/account' })
    ↓
OAuth 인증 완료
    ↓
router.push('/account')
    ↓
/account 페이지 표시 (사용자 정보 UI) ✅
```

---

## 📍 사용자 정보 UI (`/account`)

### 페이지 구조
```tsx
// app/(main)/account/page.tsx
export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login?callbackUrl=/account');  // ✅ callbackUrl 설정
  }
  
  return (
    <div>
      <h1>내 계정 정보</h1>
      <AccountInfo />  // 사용자 정보 UI 컴포넌트
    </div>
  );
}
```

### 표시되는 정보
- 기본 정보 (프로필, 이름, 이메일, 역할, 가입일)
- 연결된 계정 (OAuth 정보)
- 활동 통계 (리뷰 수, 즐겨찾기 수)
- 활성 세션 정보
- 로그아웃 버튼

---

## 🔐 인증 플로우

### 1. 비로그인 사용자가 `/account` 접근

```typescript
// app/(main)/account/page.tsx
if (!session?.user) {
  redirect('/login?callbackUrl=/account');
}
```

**동작:**
- 서버에서 세션 확인
- 세션 없으면 `/login?callbackUrl=/account`로 리다이렉트
- `callbackUrl` 파라미터에 `/account` 설정

### 2. 로그인 페이지에서 callbackUrl 읽기

```typescript
// components/auth/LoginForm.tsx
const searchParams = useSearchParams();
const callbackUrl = searchParams.get('callbackUrl') || '/';
```

**동작:**
- URL의 `callbackUrl` 쿼리 파라미터 읽기
- 없으면 기본값 `/` (홈페이지)

### 3. 로그인 성공 후 callbackUrl로 이동

```typescript
// components/auth/LoginForm.tsx
const result = await signIn('google', {
  callbackUrl: callbackUrl,  // '/account'
  redirect: false,
});

if (result?.ok) {
  router.push(callbackUrl);  // '/account'로 이동
  router.refresh();
}
```

**동작:**
- OAuth 인증 완료
- `callbackUrl`로 리다이렉트
- `/account` 페이지 표시

---

## ✅ 올바른 플로우인 이유

### 1. 사용자 경험 (UX)
- 사용자가 `/account`에 접근하려고 했으므로, 로그인 후 `/account`로 돌아가는 것이 자연스럽습니다
- 사용자가 원하는 페이지로 바로 이동할 수 있습니다

### 2. 일관성
- 다른 보호된 페이지(`/reviews/new` 등)도 동일한 패턴을 사용합니다
- 애플리케이션 전체에서 일관된 동작을 보장합니다

### 3. 보안
- 비로그인 사용자는 보호된 페이지에 접근할 수 없습니다
- 로그인 후 원래 요청한 페이지로 안전하게 리다이렉트됩니다

---

## 📊 다른 callbackUrl 시나리오

### 시나리오 1: 직접 로그인 (`/login` 접근)
```
/login 접근
    ↓
callbackUrl 없음 → 기본값 '/'
    ↓
로그인 성공
    ↓
홈페이지('/')로 이동 ✅
```

### 시나리오 2: `/account`에서 리다이렉트
```
/account 접근 (비로그인)
    ↓
/login?callbackUrl=/account
    ↓
로그인 성공
    ↓
/account로 이동 ✅
```

### 시나리오 3: `/reviews/new`에서 리다이렉트
```
/reviews/new 접근 (비로그인)
    ↓
/login?callbackUrl=/reviews/new
    ↓
로그인 성공
    ↓
/reviews/new로 이동 ✅
```

---

## 🎯 결론

### ✅ callbackUrl이 `/account`로 흐르는 것이 올바릅니다

**이유:**
1. **사용자 경험**: 사용자가 원하는 페이지로 돌아갑니다
2. **일관성**: 다른 보호된 페이지와 동일한 패턴입니다
3. **보안**: 인증 후 안전하게 원래 페이지로 리다이렉트됩니다
4. **기능**: 현재 구현이 정상적으로 작동합니다

### 현재 구현 상태

- ✅ `/account` 페이지에서 `callbackUrl=/account` 설정
- ✅ `LoginForm`에서 `callbackUrl` 읽기
- ✅ 로그인 성공 후 `callbackUrl`로 이동
- ✅ 사용자 정보 UI 정상 표시

---

## 🔗 관련 파일

- `app/(main)/account/page.tsx` - 계정 페이지 (callbackUrl 설정)
- `components/auth/LoginForm.tsx` - 로그인 폼 (callbackUrl 처리)
- `components/account/AccountInfo.tsx` - 사용자 정보 UI 컴포넌트
- `components/layout/Header.tsx` - Header에서 `/account` 링크

---

## 📝 테스트 체크리스트

- [x] `/account` 접근 시 비로그인 사용자 리다이렉트
- [x] `callbackUrl=/account` 파라미터 설정
- [x] 로그인 페이지에서 `callbackUrl` 읽기
- [x] 로그인 성공 후 `/account`로 이동
- [x] 사용자 정보 UI 정상 표시
- [x] Header에서 `/account` 링크 작동

---

## ✅ 최종 확인

**callbackUrl이 `/account` (사용자 정보 UI)로 흐르는 것이 올바르고, 현재 구현이 정상적으로 작동합니다.**

