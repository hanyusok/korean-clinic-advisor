# Google/Kakao 로그인 플로우 분석

## 🔍 문제점

**현재 문제:**
- Google/Kakao 로그인 인증 과정을 완료한 후
- redirect UI에서 user info UI가 생성되지 않고
- Google/Kakao 로그인 초기화면이 다시 나타남

---

## 📋 현재 구현 분석

### 1. LoginForm.tsx
```typescript
const result = await signIn('google', {
  callbackUrl: callbackUrl,
  redirect: false,  // ❌ 문제: OAuth는 브라우저 리다이렉트가 필요함
});
```

**문제점:**
- `redirect: false`는 OAuth 플로우에서 제대로 작동하지 않음
- OAuth는 브라우저 리다이렉트가 필수적임
- `redirect: false`를 사용하면 OAuth 콜백이 제대로 처리되지 않음

### 2. OAuth 플로우 (정상)

```
1. 사용자가 로그인 버튼 클릭
   ↓
2. signIn('google') 호출
   ↓
3. /api/auth/signin/google?callbackUrl=/account 로 리다이렉트
   ↓
4. Google OAuth 페이지로 리다이렉트
   ↓
5. 사용자가 Google에서 인증 완료
   ↓
6. /api/auth/callback/google?code=...&state=... 로 리다이렉트
   ↓
7. NextAuth가 세션 생성
   ↓
8. callbackUrl(/account)로 리다이렉트 ✅
```

### 3. 현재 구현 (문제)

```
1. 사용자가 로그인 버튼 클릭
   ↓
2. signIn('google', { redirect: false }) 호출
   ↓
3. ❌ OAuth 리다이렉트가 발생하지 않음
   ↓
4. result?.ok가 false이거나 undefined
   ↓
5. 로그인 페이지가 다시 표시됨 ❌
```

---

## ✅ 해결 방법

### 방법 1: redirect: true 사용 (권장)

OAuth는 브라우저 리다이렉트가 필요하므로 `redirect: true`를 사용하거나 `redirect` 옵션을 제거해야 합니다.

```typescript
// ❌ 잘못된 방법
const result = await signIn('google', {
  callbackUrl: callbackUrl,
  redirect: false,  // OAuth에서는 작동하지 않음
});

// ✅ 올바른 방법
await signIn('google', {
  callbackUrl: callbackUrl,
  // redirect 옵션 제거 (기본값 true 사용)
});
```

### 방법 2: NextAuth redirect 콜백 사용

`lib/auth.ts`에 `redirect` 콜백을 추가하여 `callbackUrl`을 처리합니다.

```typescript
// lib/auth.ts
export const authOptions: NextAuthOptions = {
  // ... 기존 설정
  callbacks: {
    async redirect({ url, baseUrl }) {
      // callbackUrl이 있으면 해당 URL로, 없으면 baseUrl로
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    // ... 기존 콜백
  },
};
```

---

## 🔄 수정된 플로우

### 수정 1: LoginForm.tsx

```typescript
const handleGoogleLogin = async () => {
  setLoading('google');
  try {
    // redirect 옵션 제거 (기본값 true 사용)
    await signIn('google', {
      callbackUrl: callbackUrl,
    });
    // redirect: true이므로 여기 도달하지 않음
    // NextAuth가 자동으로 리다이렉트 처리
  } catch (error) {
    console.error('Login error:', error);
    toast.error('로그인 중 오류가 발생했습니다.');
    setLoading(null);
  }
};
```

### 수정 2: SignupForm.tsx (동일)

```typescript
const handleGoogleSignup = async () => {
  setLoading('google');
  try {
    await signIn('google', {
      callbackUrl: callbackUrl,
    });
  } catch (error) {
    console.error('Signup error:', error);
    toast.error('회원가입 중 오류가 발생했습니다.');
    setLoading(null);
  }
};
```

---

## 📝 NextAuth OAuth 플로우 상세

### 1. signIn() 호출
```typescript
signIn('google', { callbackUrl: '/account' })
```

### 2. NextAuth 리다이렉트
```
/api/auth/signin/google?callbackUrl=/account
```

### 3. Google OAuth 페이지
```
https://accounts.google.com/oauth/authorize?...
```

### 4. 사용자 인증 완료
```
/api/auth/callback/google?code=...&state=...
```

### 5. NextAuth 세션 생성
- PrismaAdapter가 User와 Account 생성/업데이트
- Session 생성
- 세션 토큰 생성

### 6. callbackUrl로 리다이렉트
```
/account (사용자 정보 UI)
```

---

## 🎯 수정 사항 요약

### 문제
- `redirect: false` 사용으로 OAuth 플로우가 중단됨
- OAuth 콜백이 제대로 처리되지 않음
- 로그인 후 로그인 페이지가 다시 표시됨

### 해결
- `redirect: false` 제거 (기본값 `true` 사용)
- NextAuth가 자동으로 OAuth 플로우 처리
- `callbackUrl`이 자동으로 처리됨

---

## ✅ 테스트 시나리오

### 시나리오 1: /account에서 로그인
1. `/account` 접근 (비로그인)
2. `/login?callbackUrl=/account`로 리다이렉트
3. Google/Kakao 로그인 버튼 클릭
4. OAuth 인증 완료
5. ✅ `/account` 페이지 표시 (사용자 정보 UI)

### 시나리오 2: 직접 로그인
1. `/login` 접근
2. Google/Kakao 로그인 버튼 클릭
3. OAuth 인증 완료
4. ✅ 홈페이지(`/`)로 이동

---

## 🔗 관련 파일

- `components/auth/LoginForm.tsx` - 로그인 폼 (수정 필요)
- `components/auth/SignupForm.tsx` - 회원가입 폼 (수정 필요)
- `lib/auth.ts` - NextAuth 설정 (redirect 콜백 추가 가능)
- `app/api/auth/[...nextauth]/route.ts` - NextAuth 핸들러

