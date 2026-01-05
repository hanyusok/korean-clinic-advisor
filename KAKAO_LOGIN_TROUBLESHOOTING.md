# Kakao 로그인 OAuthCreateAccount 오류 해결 가이드

## 🔍 문제 분석

### 오류 메시지
```
http://localhost:3000/login?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2F&error=OAuthCreateAccount
```

### 원인
- Kakao는 이메일을 제공하지 않을 수 있음 (비즈니스 인증 필요)
- PrismaAdapter가 User를 생성할 때 이메일이 필수
- `provider` 필드가 필수이지만 PrismaAdapter가 자동으로 설정하지 않음

---

## ✅ 현재 구현

### 1. Prisma 스키마
```prisma
model User {
  email         String    @unique
  provider      String    @default("unknown") // 기본값 설정
  providerId    String?
  // ...
}
```

### 2. lib/auth.ts - signIn 콜백
```typescript
async signIn({ user, account, profile }) {
  if (account && user) {
    // 이메일이 없는 경우 (Kakao 등) - 이메일 생성
    if (!user.email && account.provider && account.providerAccountId) {
      user.email = `${account.provider}_${account.providerAccountId}@${account.provider}.local`;
      console.log('[signIn] Generated email for Kakao user:', user.email);
    }

    // PrismaAdapter가 User를 생성한 후 provider 정보 업데이트
    setImmediate(async () => {
      // ...
    });

    return true;
  }
  return true;
}
```

---

## 🔧 해결 방법

### 방법 1: Kakao 개발자 콘솔 설정 확인

1. **Kakao 개발자 콘솔 접속**
   - https://developers.kakao.com/

2. **동의 항목 설정**
   - 제품 설정 > 카카오 로그인 > 동의항목
   - **카카오계정(이메일)** 항목을 **필수 동의**로 설정
   - ⚠️ **주의**: 비즈니스 인증이 필요할 수 있음

3. **Redirect URI 확인**
   - 제품 설정 > 카카오 로그인 > Redirect URI
   - `http://localhost:3000/api/auth/callback/kakao` 추가

### 방법 2: 디버그 로그 확인

개발 환경에서 콘솔 로그를 확인하세요:

```bash
# 서버 콘솔에서 확인할 로그:
[signIn] Generated email for Kakao user: kakao_123456789@kakao.local
[signIn] Updated user provider info: kakao_123456789@kakao.local
```

### 방법 3: 데이터베이스 직접 확인

```sql
-- 사용자 확인
SELECT * FROM users WHERE provider = 'kakao' ORDER BY "createdAt" DESC LIMIT 5;

-- Account 확인
SELECT * FROM accounts WHERE provider = 'kakao' ORDER BY "createdAt" DESC LIMIT 5;
```

---

## 🧪 테스트 시나리오

### 시나리오 1: 새 Kakao 사용자 로그인
1. Kakao 로그인 버튼 클릭
2. Kakao 인증 완료
3. **확인 사항:**
   - 콘솔에 `[signIn] Generated email for Kakao user` 로그 확인
   - 데이터베이스에 User 생성 확인
   - `/account` 페이지로 리다이렉트 확인

### 시나리오 2: 기존 Kakao 사용자 재로그인
1. 이미 로그인한 Kakao 계정으로 다시 로그인
2. **확인 사항:**
   - 기존 User 업데이트 확인
   - 세션 정상 생성 확인

---

## 🐛 문제 해결 체크리스트

### 1. 환경 변수 확인
```bash
# .env.local 파일 확인
KAKAO_CLIENT_ID="your-kakao-client-id"
KAKAO_CLIENT_SECRET="your-kakao-client-secret"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Prisma 스키마 확인
- [x] `provider` 필드에 `@default("unknown")` 설정
- [x] `email` 필드가 `unique`로 설정
- [x] Prisma Client 재생성 (`npx prisma generate`)

### 3. NextAuth 설정 확인
- [x] `allowDangerousEmailAccountLinking: true` 설정
- [x] `debug: true` (개발 환경)
- [x] signIn 콜백에서 이메일 생성 로직

### 4. Kakao 개발자 콘솔 확인
- [ ] Redirect URI 설정 확인
- [ ] 동의 항목 설정 확인
- [ ] REST API 키 확인

---

## 📋 디버깅 단계

### 1단계: 콘솔 로그 확인
```bash
# 서버 실행 시 콘솔에서 확인
npm run dev
```

**확인할 로그:**
- `[signIn] Generated email for Kakao user: ...`
- `[signIn] Updated user provider info: ...`
- `[signIn] User update skipped: ...`

### 2단계: 데이터베이스 확인
```bash
# PostgreSQL에 접속하여 확인
psql -U han -d korean_clinic_advisor

# 최근 생성된 사용자 확인
SELECT id, email, provider, "providerId", name, "createdAt" 
FROM users 
WHERE provider = 'kakao' 
ORDER BY "createdAt" DESC 
LIMIT 5;
```

### 3단계: NextAuth 디버그 모드
```typescript
// lib/auth.ts
debug: process.env.NODE_ENV === 'development',
```

개발 환경에서 자동으로 디버그 모드 활성화됨.

---

## 🔄 대안 해결 방법

### 방법 A: 커스텀 Adapter 사용

PrismaAdapter 대신 커스텀 Adapter를 만들어 이메일이 없을 때를 처리:

```typescript
// lib/custom-adapter.ts
import { PrismaAdapter } from '@auth/prisma-adapter';
import { Adapter } from 'next-auth/adapters';

export function customAdapter(prisma: any): Adapter {
  const baseAdapter = PrismaAdapter(prisma) as Adapter;
  
  return {
    ...baseAdapter,
    async createUser(user) {
      // 이메일이 없으면 생성
      if (!user.email && user.providerAccountId) {
        user.email = `${user.provider}_${user.providerAccountId}@${user.provider}.local`;
      }
      return baseAdapter.createUser(user);
    },
  };
}
```

### 방법 B: 이메일 필드를 선택적으로 변경

Prisma 스키마에서 이메일을 선택적으로 만들고, 나중에 업데이트:

```prisma
model User {
  email         String?   @unique  // 선택적으로 변경
  // ...
}
```

⚠️ **주의**: 이 방법은 기존 데이터와 호환성 문제가 있을 수 있음.

---

## ✅ 최종 확인

### 성공 시나리오
1. Kakao 로그인 버튼 클릭
2. Kakao 인증 완료
3. 콘솔에 이메일 생성 로그 확인
4. 데이터베이스에 User 생성 확인
5. `/account` 페이지로 리다이렉트
6. 사용자 정보 UI 표시

### 실패 시나리오
1. `OAuthCreateAccount` 오류 발생
2. 콘솔 로그 확인
3. 데이터베이스 확인
4. 위의 체크리스트 확인

---

## 🔗 관련 파일

- `lib/auth.ts` - NextAuth 설정 및 콜백
- `prisma/schema.prisma` - 데이터베이스 스키마
- `app/api/auth/[...nextauth]/route.ts` - NextAuth 핸들러
- `components/auth/LoginForm.tsx` - 로그인 폼

---

## 📝 참고 자료

- [NextAuth.js 공식 문서](https://next-auth.js.org/)
- [Kakao 개발자 문서](https://developers.kakao.com/)
- [PrismaAdapter 문서](https://authjs.dev/reference/adapter/prisma)

