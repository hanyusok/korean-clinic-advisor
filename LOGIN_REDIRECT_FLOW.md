# 로그인 후 리다이렉트 플로우 분석

## 📋 현재 상태

### 문제점 발견

**현재 로그인 후 리다이렉트 동작:**
- Google/Kakao 로그인 후 **항상 홈페이지(`/`)로 이동**
- `/account` 페이지에서 리다이렉트된 경우(`callbackUrl=/account`) 로그인 후 `/account`로 돌아가지 않음

---

## 🔍 현재 코드 분석

### 1. LoginForm.tsx

```tsx
// components/auth/LoginForm.tsx
const handleGoogleLogin = async () => {
  const result = await signIn('google', {
    callbackUrl: '/',  // ❌ 항상 홈페이지로 설정
    redirect: false,
  });
  
  if (result?.ok) {
    router.push('/');  // ❌ 항상 홈페이지로 이동
    router.refresh();
  }
};
```

**문제:**
- `callbackUrl`이 하드코딩되어 `/`로 설정됨
- URL의 `callbackUrl` 쿼리 파라미터를 읽지 않음
- 로그인 성공 후 항상 홈페이지로 이동

### 2. account/page.tsx

```tsx
// app/(main)/account/page.tsx
export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login?callbackUrl=/account');  // ✅ callbackUrl 설정
  }
  
  return <AccountInfo />;
}
```

**동작:**
- 비로그인 사용자가 `/account` 접근 시 `/login?callbackUrl=/account`로 리다이렉트
- 하지만 로그인 후 이 `callbackUrl`을 처리하지 않음

---

## 🔄 현재 플로우

```
사용자가 /account 접근
    ↓
세션 없음
    ↓
redirect('/login?callbackUrl=/account')
    ↓
/login 페이지 표시 (URL: /login?callbackUrl=/account)
    ↓
Google/Kakao 로그인 버튼 클릭
    ↓
signIn('google', { callbackUrl: '/' })  // ❌ 하드코딩된 '/'
    ↓
OAuth 인증 완료
    ↓
router.push('/')  // ❌ 항상 홈페이지로 이동
    ↓
홈페이지 표시 (❌ /account가 아님)
```

---

## ✅ 개선 방안

### 방법 1: LoginForm에서 callbackUrl 읽기 (권장)

```tsx
'use client';

import { useSearchParams } from 'next/navigation';

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const router = useRouter();

  const handleGoogleLogin = async () => {
    const result = await signIn('google', {
      callbackUrl: callbackUrl,  // ✅ URL에서 읽은 callbackUrl 사용
      redirect: false,
    });
    
    if (result?.ok) {
      router.push(callbackUrl);  // ✅ callbackUrl로 이동
      router.refresh();
    }
  };
}
```

### 방법 2: NextAuth redirect 콜백 사용

```tsx
// lib/auth.ts
export const authOptions: NextAuthOptions = {
  callbacks: {
    async redirect({ url, baseUrl }) {
      // callbackUrl이 있으면 해당 URL로, 없으면 baseUrl로
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};
```

---

## 🎯 권장 수정 사항

### 수정 1: LoginForm.tsx

```tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
// ... 기타 imports

export function LoginForm() {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleGoogleLogin = async () => {
    setLoading('google');
    try {
      const result = await signIn('google', {
        callbackUrl: callbackUrl,  // ✅ 수정
        redirect: false,
      });
      
      if (result?.error) {
        toast.error('로그인에 실패했습니다. 다시 시도해주세요.');
      } else if (result?.ok) {
        toast.success('로그인되었습니다!');
        router.push(callbackUrl);  // ✅ 수정
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(null);
    }
  };

  const handleKakaoLogin = async () => {
    setLoading('kakao');
    try {
      const result = await signIn('kakao', {
        callbackUrl: callbackUrl,  // ✅ 수정
        redirect: false,
      });
      
      if (result?.error) {
        toast.error('로그인에 실패했습니다. 다시 시도해주세요.');
      } else if (result?.ok) {
        toast.success('로그인되었습니다!');
        router.push(callbackUrl);  // ✅ 수정
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(null);
    }
  };

  // ... 나머지 코드
}
```

### 수정 2: SignupForm.tsx (동일한 수정)

```tsx
// components/auth/SignupForm.tsx
// LoginForm과 동일하게 수정
```

---

## 🔄 개선된 플로우

```
사용자가 /account 접근
    ↓
세션 없음
    ↓
redirect('/login?callbackUrl=/account')
    ↓
/login 페이지 표시 (URL: /login?callbackUrl=/account)
    ↓
useSearchParams()로 callbackUrl 읽기: '/account'
    ↓
Google/Kakao 로그인 버튼 클릭
    ↓
signIn('google', { callbackUrl: '/account' })  // ✅ callbackUrl 사용
    ↓
OAuth 인증 완료
    ↓
router.push('/account')  // ✅ callbackUrl로 이동
    ↓
/account 페이지 표시 (✅ 정상)
```

---

## 📝 테스트 시나리오

### 시나리오 1: 직접 로그인
1. `/login` 접근
2. Google/Kakao 로그인
3. **예상 결과**: 홈페이지(`/`)로 이동 ✅

### 시나리오 2: /account에서 리다이렉트 후 로그인
1. `/account` 접근 (비로그인)
2. `/login?callbackUrl=/account`로 리다이렉트
3. Google/Kakao 로그인
4. **예상 결과**: `/account` 페이지로 이동 ✅

### 시나리오 3: /reviews/new에서 리다이렉트 후 로그인
1. `/reviews/new` 접근 (비로그인)
2. `/login?callbackUrl=/reviews/new`로 리다이렉트
3. Google/Kakao 로그인
4. **예상 결과**: `/reviews/new` 페이지로 이동 ✅

---

## ✅ 체크리스트

- [ ] LoginForm.tsx에서 `useSearchParams()`로 callbackUrl 읽기
- [ ] `signIn()` 호출 시 `callbackUrl` 파라미터 사용
- [ ] 로그인 성공 후 `router.push(callbackUrl)` 사용
- [ ] SignupForm.tsx에도 동일한 수정 적용
- [ ] 테스트 시나리오 검증

---

## 🔗 관련 파일

- `components/auth/LoginForm.tsx` - 로그인 폼 (수정 필요)
- `components/auth/SignupForm.tsx` - 회원가입 폼 (수정 필요)
- `app/(main)/account/page.tsx` - 계정 페이지 (이미 callbackUrl 설정됨)
- `app/(main)/reviews/new/page.tsx` - 리뷰 작성 페이지 (이미 callbackUrl 설정됨)

