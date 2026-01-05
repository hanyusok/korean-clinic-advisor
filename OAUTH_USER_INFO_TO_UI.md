# OAuth 사용자 정보 → NextAuth User UI 전환 확인

## 📋 확인 목표

Kakao/Google 로그인 성공 후 얻은 user information status가 NextAuth user UI로 정상적으로 전환되는지 확인합니다.

---

## 🔄 현재 플로우 분석

### 1. OAuth 로그인 플로우

```
1. 사용자가 Google/Kakao 로그인 버튼 클릭
   ↓
2. OAuth Provider로 리다이렉트
   ↓
3. 사용자 인증 완료
   ↓
4. /api/auth/callback/google 또는 /api/auth/callback/kakao
   ↓
5. NextAuth가 OAuth에서 사용자 정보 받음
   - name: 사용자 이름
   - email: 사용자 이메일
   - image: 프로필 이미지 URL
   ↓
6. PrismaAdapter가 User와 Account 생성/업데이트
   ↓
7. signIn 콜백 실행 (lib/auth.ts)
   ↓
8. session 콜백 실행 (lib/auth.ts)
   ↓
9. 세션 생성 및 저장
   ↓
10. UI로 리다이렉트
```

---

## 🔍 현재 구현 확인

### 1. lib/auth.ts - signIn 콜백

```typescript
async signIn({ user, account, profile }) {
  if (account && user) {
    try {
      await prisma.user.update({
        where: { email: user.email! },
        data: {
          provider: account.provider, // 'google' 또는 'kakao'
          providerId: account.providerAccountId,
          name: user.name || undefined,      // ✅ OAuth에서 받은 이름 저장
          avatar: user.image || undefined,  // ✅ OAuth에서 받은 이미지 저장
        },
      });
    } catch (error) {
      console.log('User update skipped (already exists or handled by adapter)');
    }
    return true;
  }
  return true;
}
```

**확인 사항:**
- ✅ OAuth에서 받은 `user.name`을 데이터베이스에 저장
- ✅ OAuth에서 받은 `user.image`를 `avatar` 필드에 저장
- ✅ Provider 정보 저장

### 2. lib/auth.ts - session 콜백

```typescript
async session({ session, user }) {
  if (session.user && user) {
    (session.user as any).id = user.id;
    // role은 Prisma User 모델에서 가져오기
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    if (dbUser) {
      (session.user as any).role = dbUser.role;
    }
  }
  return session;
}
```

**확인 사항:**
- ✅ `session.user.id` 설정
- ✅ `session.user.role` 설정
- ⚠️ `session.user.name`, `session.user.email`, `session.user.image`는 PrismaAdapter가 자동으로 설정
- ⚠️ 하지만 명시적으로 확인 필요

### 3. PrismaAdapter의 동작

PrismaAdapter는 자동으로:
- OAuth에서 받은 `user.name` → `session.user.name`
- OAuth에서 받은 `user.email` → `session.user.email`
- OAuth에서 받은 `user.image` → `session.user.image`

하지만 데이터베이스의 `User` 모델에서 가져오므로, 데이터베이스에 저장된 값이 사용됩니다.

---

## 🔧 개선 사항

### 문제점 발견

**현재 session 콜백:**
- `session.user.name`, `session.user.email`, `session.user.image`를 명시적으로 설정하지 않음
- PrismaAdapter가 자동으로 설정하지만, 데이터베이스의 최신 정보를 반영하지 않을 수 있음

**해결 방법:**
- session 콜백에서 데이터베이스의 최신 사용자 정보를 가져와서 세션에 포함

---

## ✅ 수정된 구현

### lib/auth.ts - session 콜백 개선

```typescript
async session({ session, user }) {
  if (session.user && user) {
    // 데이터베이스에서 최신 사용자 정보 가져오기
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
      },
    });

    if (dbUser) {
      // 세션에 사용자 정보 명시적으로 설정
      (session.user as any).id = dbUser.id;
      session.user.name = dbUser.name || null;
      session.user.email = dbUser.email;
      session.user.image = dbUser.avatar || null;
      (session.user as any).role = dbUser.role;
    }
  }
  return session;
}
```

**개선 사항:**
- ✅ 데이터베이스에서 최신 사용자 정보 가져오기
- ✅ `session.user.name` 명시적으로 설정
- ✅ `session.user.email` 명시적으로 설정
- ✅ `session.user.image` (avatar) 명시적으로 설정
- ✅ `session.user.role` 명시적으로 설정

---

## 📊 UI에서 사용자 정보 표시

### 1. Header.tsx

```typescript
{session.user?.image ? (
  <img
    src={session.user.image}
    alt={session.user.name || 'User'}
    className="w-8 h-8 rounded-full"
  />
) : (
  <User icon />
)}
<span>{session.user?.name || session.user?.email}</span>
```

**사용하는 정보:**
- `session.user.image` - 프로필 이미지
- `session.user.name` - 사용자 이름
- `session.user.email` - 이메일 (fallback)

### 2. AccountInfo.tsx

```typescript
const { data: session, status } = useSession();

// /api/users/me에서 상세 정보 가져오기
const response = await fetch('/api/users/me');
const data = await response.json();

// UI에 표시
{user.avatar && <img src={user.avatar} />}
{user.name || '이름 없음'}
{user.email}
```

**사용하는 정보:**
- 세션 정보 (`useSession()`)
- API에서 가져온 상세 정보 (`/api/users/me`)

---

## 🧪 테스트 시나리오

### 시나리오 1: Google 로그인

1. Google 로그인 버튼 클릭
2. Google OAuth 인증 완료
3. **확인 사항:**
   - ✅ 데이터베이스에 사용자 정보 저장됨
   - ✅ 세션에 사용자 정보 포함됨
   - ✅ Header에 프로필 이미지와 이름 표시됨
   - ✅ `/account` 페이지에 사용자 정보 표시됨

### 시나리오 2: Kakao 로그인

1. Kakao 로그인 버튼 클릭
2. Kakao OAuth 인증 완료
3. **확인 사항:**
   - ✅ 데이터베이스에 사용자 정보 저장됨
   - ✅ 세션에 사용자 정보 포함됨
   - ✅ Header에 프로필 이미지와 이름 표시됨
   - ✅ `/account` 페이지에 사용자 정보 표시됨

### 시나리오 3: 기존 사용자 재로그인

1. 기존 사용자가 다시 로그인
2. **확인 사항:**
   - ✅ 데이터베이스의 사용자 정보 업데이트됨
   - ✅ 세션에 최신 사용자 정보 포함됨
   - ✅ UI에 최신 정보 표시됨

---

## 📝 확인 체크리스트

### OAuth → 데이터베이스
- [x] OAuth에서 받은 `name`이 데이터베이스에 저장됨
- [x] OAuth에서 받은 `image`가 `avatar` 필드에 저장됨
- [x] OAuth에서 받은 `email`이 데이터베이스에 저장됨
- [x] Provider 정보가 저장됨

### 데이터베이스 → 세션
- [ ] `session.user.id`가 설정됨
- [ ] `session.user.name`이 설정됨
- [ ] `session.user.email`이 설정됨
- [ ] `session.user.image`가 설정됨
- [ ] `session.user.role`이 설정됨

### 세션 → UI
- [ ] Header에 프로필 이미지 표시됨
- [ ] Header에 사용자 이름 표시됨
- [ ] `/account` 페이지에 사용자 정보 표시됨
- [ ] `/account` 페이지에 OAuth 계정 정보 표시됨

---

## 🔗 관련 파일

- `lib/auth.ts` - NextAuth 설정 및 콜백
- `components/account/AccountInfo.tsx` - 사용자 정보 UI
- `components/layout/Header.tsx` - Header (세션 정보 표시)
- `app/api/users/me/route.ts` - 사용자 정보 API
- `app/(main)/account/page.tsx` - 계정 페이지

---

## ✅ 결론

현재 구현에서 확인된 사항:
- ✅ OAuth에서 받은 사용자 정보가 데이터베이스에 저장됨
- ⚠️ 세션 콜백에서 사용자 정보를 명시적으로 설정하지 않음 (PrismaAdapter가 자동 처리)
- ✅ UI에서 사용자 정보를 표시함

**개선 권장:**
- session 콜백에서 데이터베이스의 최신 사용자 정보를 명시적으로 세션에 포함

