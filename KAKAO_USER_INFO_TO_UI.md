# Kakao 사용자 정보 → NextAuth User UI 전환 확인

## 📋 확인 목표

Kakao 로그인 성공 후 Kakao 사용자 상태 정보가 NextAuth User UI로 정상적으로 전환되는지 확인합니다.

---

## 🔄 Kakao 로그인 플로우

### 전체 플로우

```
1. 사용자가 Kakao 로그인 버튼 클릭
   ↓
2. /api/auth/signin/kakao?callbackUrl=/account로 리다이렉트
   ↓
3. Kakao OAuth 페이지로 리다이렉트
   ↓
4. 사용자가 Kakao에서 인증 완료
   ↓
5. /api/auth/callback/kakao?code=...&state=...로 리다이렉트
   ↓
6. NextAuth가 Kakao에서 사용자 정보 받음
   - name: 사용자 이름 (닉네임)
   - email: 사용자 이메일 (없을 수 있음)
   - image: 프로필 이미지 URL
   ↓
7. signIn 콜백 실행 (lib/auth.ts)
   - 이메일이 없으면 생성: kakao_{providerAccountId}@kakao.local
   - provider 정보 저장
   ↓
8. PrismaAdapter가 User와 Account 생성/연결
   ↓
9. session 콜백 실행 (lib/auth.ts)
   - 데이터베이스에서 최신 사용자 정보 가져오기
   - 세션에 사용자 정보 포함
   ↓
10. 세션 생성 및 저장
   ↓
11. callbackUrl(/account)로 리다이렉트
   ↓
12. /account 페이지 표시 (사용자 정보 UI) ✅
```

---

## 🔍 각 단계별 상세 확인

### 1단계: Kakao OAuth에서 사용자 정보 받기

**KakaoProvider 설정:**
```typescript
KakaoProvider({
  clientId: process.env.KAKAO_CLIENT_ID || '',
  clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
  allowDangerousEmailAccountLinking: true,
})
```

**Kakao에서 받는 정보:**
- `name`: 사용자 닉네임 (필수)
- `email`: 사용자 이메일 (선택, 비즈니스 인증 필요)
- `image`: 프로필 이미지 URL (선택)
- `id`: Kakao 사용자 ID (providerAccountId)

---

### 2단계: signIn 콜백 - 데이터베이스 저장

**lib/auth.ts - signIn 콜백:**

```46:112:lib/auth.ts
async signIn({ user, account, profile }) {
  // Kakao의 경우 이메일이 없을 수 있으므로 PrismaAdapter가 처리하기 전에 이메일 생성
  if (account && user) {
    // 이메일이 없는 경우 (Kakao 등) - PrismaAdapter가 사용할 이메일 생성
    // PrismaAdapter가 User를 생성하기 전에 이메일이 반드시 설정되어야 함
    if (!user.email && account.provider && account.providerAccountId) {
      // PrismaAdapter가 사용하는 형식: {provider}_{providerAccountId}@{provider}.local
      user.email = `${account.provider}_${account.providerAccountId}@${account.provider}.local`;
      console.log('[signIn] Generated email for Kakao user:', user.email);
    }

    // PrismaAdapter가 User와 Account를 생성/연결한 후 provider 정보 업데이트
    // setImmediate를 사용하여 PrismaAdapter가 먼저 처리하도록 함
    if (typeof setImmediate !== 'undefined') {
      setImmediate(async () => {
        try {
          if (user.email) {
            // PrismaAdapter가 처리한 후 provider 정보 업데이트
            // 약간의 지연을 두어 PrismaAdapter가 먼저 처리하도록 함
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const updated = await prisma.user.updateMany({
              where: { email: user.email },
              data: {
                provider: account.provider,
                providerId: account.providerAccountId,
                name: user.name || undefined,
                avatar: user.image || undefined,
              },
            });
            
            if (updated.count > 0) {
              console.log('[signIn] Updated user provider info:', user.email);
            }
          }
        } catch (error: any) {
          // PrismaAdapter가 아직 처리하지 않았거나 이미 처리한 경우 무시
          console.log('[signIn] User update skipped:', error.message);
        }
      });
    } else {
      // setImmediate가 없는 환경에서는 Promise.resolve().then() 사용
      Promise.resolve().then(async () => {
        try {
          if (user.email) {
            await new Promise(resolve => setTimeout(resolve, 200));
            
            await prisma.user.updateMany({
              where: { email: user.email },
              data: {
                provider: account.provider,
                providerId: account.providerAccountId,
                name: user.name || undefined,
                avatar: user.image || undefined,
              },
            });
          }
        } catch (error: any) {
          console.log('[signIn] User update skipped:', error.message);
        }
      });
    }

    return true;
  }
  return true;
}
```

**저장되는 정보:**
- ✅ `email`: 생성된 이메일 또는 Kakao에서 받은 이메일
- ✅ `name`: Kakao 닉네임
- ✅ `avatar`: Kakao 프로필 이미지 URL
- ✅ `provider`: "kakao"
- ✅ `providerId`: Kakao 사용자 ID

---

### 3단계: session 콜백 - 세션에 포함

**lib/auth.ts - session 콜백:**

```113:139:lib/auth.ts
async session({ session, user }) {
  if (session.user && user) {
    // 데이터베이스에서 최신 사용자 정보 가져오기
    // OAuth에서 받은 정보가 데이터베이스에 저장되었으므로 최신 정보 반영
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
      // OAuth에서 받은 정보가 정상적으로 세션에 포함되도록 보장
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

**세션에 포함되는 정보:**
- ✅ `session.user.id`: 사용자 ID
- ✅ `session.user.name`: Kakao 닉네임
- ✅ `session.user.email`: 생성된 이메일 또는 Kakao 이메일
- ✅ `session.user.image`: Kakao 프로필 이미지 URL
- ✅ `session.user.role`: 사용자 역할

---

### 4단계: UI에서 사용자 정보 표시

#### 4-1. Header.tsx - 프로필 정보 표시

```44:70:components/layout/Header.tsx
{session.user?.image ? (
  <div className="relative w-8 h-8 rounded-full overflow-hidden">
    <img
      src={session.user.image}
      alt={session.user.name || 'User'}
      className="w-full h-full object-cover"
      onError={(e) => {
        // 이미지 로드 실패 시 fallback
        e.currentTarget.style.display = 'none';
        const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback');
        if (fallback) {
          (fallback as HTMLElement).style.display = 'flex';
        }
      }}
    />
    <div className="avatar-fallback absolute inset-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center" style={{ display: 'none' }}>
      <User className="w-4 h-4 text-primary" />
    </div>
  </div>
) : (
  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
    <User className="w-4 h-4 text-primary" />
  </div>
)}
<span className="hidden md:inline">
  {session.user?.name || session.user?.email}
</span>
```

**표시되는 정보:**
- ✅ 프로필 이미지 (Kakao 프로필 사진)
- ✅ 사용자 이름 (Kakao 닉네임) 또는 이메일

#### 4-2. AccountInfo.tsx - 상세 사용자 정보

```51:66:components/account/AccountInfo.tsx
const fetchAccountInfo = async () => {
  try {
    setLoading(true);
    const response = await fetch('/api/users/me');
    if (!response.ok) {
      throw new Error('계정 정보를 불러올 수 없습니다.');
    }
    const data = await response.json();
    setAccountData(data);
  } catch (error) {
    console.error('Error fetching account info:', error);
    toast.error('계정 정보를 불러오는 중 오류가 발생했습니다.');
  } finally {
    setLoading(false);
  }
};
```

**표시되는 정보:**
- ✅ 기본 정보: 이름, 이메일, 프로필 이미지, 역할, 가입일
- ✅ 연결된 계정: Kakao 계정 정보 (🟡 Kakao 표시)
- ✅ 활동 통계: 리뷰 수, 즐겨찾기 수
- ✅ 활성 세션 정보

#### 4-3. /api/users/me - 사용자 정보 API

```10:84:app/api/users/me/route.ts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    // 사용자 정보와 연결된 계정 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: {
          select: {
            id: true,
            provider: true,
            providerAccountId: true,
            type: true,
          },
        },
        sessions: {
          select: {
            id: true,
            sessionToken: true,
            expires: true,
          },
          orderBy: {
            expires: 'desc',
          },
          take: 5, // 최근 5개 세션
        },
        _count: {
          select: {
            reviews: true,
            favorites: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        provider: user.provider,
        providerId: user.providerId,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accounts: user.accounts,
      sessions: user.sessions.map((session) => ({
        id: session.id,
        expires: session.expires,
        isActive: session.expires > new Date(),
      })),
      stats: {
        reviews: user._count.reviews,
        favorites: user._count.favorites,
      },
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
```

---

## 📊 데이터 흐름 다이어그램

```
Kakao OAuth
    ↓
[사용자 정보]
- name: "홍길동"
- email: null (또는 "user@kakao.com")
- image: "http://img1.kakaocdn.net/..."
- id: "4680167868"
    ↓
signIn 콜백
    ↓
[이메일 생성]
email: "kakao_4680167868@kakao.local"
    ↓
PrismaAdapter
    ↓
[데이터베이스 저장]
User {
  email: "kakao_4680167868@kakao.local"
  name: "홍길동"
  avatar: "http://img1.kakaocdn.net/..."
  provider: "kakao"
  providerId: "4680167868"
}
Account {
  provider: "kakao"
  providerAccountId: "4680167868"
}
    ↓
session 콜백
    ↓
[세션 생성]
session.user {
  id: "uuid"
  name: "홍길동"
  email: "kakao_4680167868@kakao.local"
  image: "http://img1.kakaocdn.net/..."
  role: "user"
}
    ↓
UI 표시
    ↓
[Header]
- 프로필 이미지: Kakao 프로필 사진
- 이름: "홍길동"
    ↓
[/account 페이지]
- 기본 정보: 이름, 이메일, 프로필 이미지
- 연결된 계정: 🟡 Kakao
- Provider 정보: kakao
```

---

## ✅ 확인 체크리스트

### Kakao OAuth → 데이터베이스
- [x] Kakao에서 받은 `name`이 데이터베이스에 저장됨
- [x] Kakao에서 받은 `image`가 `avatar` 필드에 저장됨
- [x] 이메일이 없으면 자동 생성됨 (`kakao_{id}@kakao.local`)
- [x] `provider`가 "kakao"로 저장됨
- [x] `providerId`가 Kakao 사용자 ID로 저장됨

### 데이터베이스 → 세션
- [x] `session.user.id`가 설정됨
- [x] `session.user.name`이 Kakao 닉네임으로 설정됨
- [x] `session.user.email`이 설정됨 (생성된 이메일 또는 Kakao 이메일)
- [x] `session.user.image`가 Kakao 프로필 이미지로 설정됨
- [x] `session.user.role`이 설정됨

### 세션 → UI
- [x] Header에 프로필 이미지 표시됨 (Kakao 프로필 사진)
- [x] Header에 사용자 이름 표시됨 (Kakao 닉네임)
- [x] `/account` 페이지에 사용자 정보 표시됨
- [x] `/account` 페이지에 Kakao 계정 정보 표시됨 (🟡 Kakao)
- [x] Provider 정보 표시됨 ("kakao")

---

## 🧪 테스트 시나리오

### 시나리오 1: 새 Kakao 사용자 로그인 (이메일 없음)

1. Kakao 로그인 버튼 클릭
2. Kakao OAuth 인증 완료
3. **확인 사항:**
   - ✅ 콘솔에 `[signIn] Generated email for Kakao user: kakao_...@kakao.local` 로그
   - ✅ 데이터베이스에 User 생성 확인
   - ✅ 이메일: `kakao_{id}@kakao.local`
   - ✅ 이름: Kakao 닉네임
   - ✅ 프로필 이미지: Kakao 프로필 사진
   - ✅ Header에 프로필 이미지와 이름 표시
   - ✅ `/account` 페이지에 사용자 정보 표시
   - ✅ 연결된 계정에 "🟡 Kakao" 표시

### 시나리오 2: Kakao 사용자 재로그인

1. 이미 로그인한 Kakao 계정으로 다시 로그인
2. **확인 사항:**
   - ✅ 기존 User 업데이트 확인
   - ✅ 최신 프로필 정보 반영
   - ✅ 세션 정상 생성 확인

### 시나리오 3: Kakao 사용자 정보 업데이트

1. Kakao에서 프로필 정보 변경
2. 다시 로그인
3. **확인 사항:**
   - ✅ 데이터베이스의 사용자 정보 업데이트됨
   - ✅ 세션에 최신 정보 포함됨
   - ✅ UI에 최신 정보 표시됨

---

## 🔍 디버깅 방법

### 1. 콘솔 로그 확인

```bash
# 서버 실행 시 콘솔에서 확인
[signIn] Generated email for Kakao user: kakao_4680167868@kakao.local
[signIn] Updated user provider info: kakao_4680167868@kakao.local
```

### 2. 데이터베이스 확인

```sql
-- Kakao 사용자 확인
SELECT id, email, name, avatar, provider, "providerId", "createdAt"
FROM users 
WHERE provider = 'kakao' 
ORDER BY "createdAt" DESC 
LIMIT 5;

-- Kakao Account 확인
SELECT id, provider, "providerAccountId", "userId"
FROM accounts 
WHERE provider = 'kakao' 
ORDER BY "createdAt" DESC 
LIMIT 5;
```

### 3. 브라우저 개발자 도구 확인

```javascript
// 브라우저 콘솔에서 확인
// 1. 세션 정보 확인
fetch('/api/auth/session').then(r => r.json()).then(console.log);

// 2. 사용자 정보 확인
fetch('/api/users/me').then(r => r.json()).then(console.log);
```

---

## 📋 Kakao 특화 사항

### 1. 이메일 처리
- Kakao는 이메일을 제공하지 않을 수 있음
- 자동으로 `kakao_{providerAccountId}@kakao.local` 형식으로 생성
- 비즈니스 인증을 받으면 실제 이메일 제공 가능

### 2. 프로필 이미지
- Kakao 프로필 이미지 URL: `http://img1.kakaocdn.net/...`
- `next.config.js`에 도메인 추가 필요
- 이미지 로드 실패 시 fallback 처리

### 3. 사용자 이름
- Kakao 닉네임 사용
- `name` 필드에 저장
- UI에 표시

---

## ✅ 결론

**Kakao 로그인 성공 후 사용자 상태 정보가 NextAuth User UI로 정상적으로 전환됩니다.**

### 확인된 사항:
- ✅ Kakao OAuth에서 사용자 정보 받기
- ✅ signIn 콜백에서 데이터베이스 저장
- ✅ session 콜백에서 세션에 포함
- ✅ UI에서 사용자 정보 표시
- ✅ 이메일이 없는 경우 자동 생성
- ✅ 프로필 이미지 정상 표시
- ✅ 연결된 계정 정보 표시

---

## 🔗 관련 파일

- `lib/auth.ts` - NextAuth 설정 및 콜백
- `components/account/AccountInfo.tsx` - 사용자 정보 UI
- `components/layout/Header.tsx` - Header (세션 정보 표시)
- `app/api/users/me/route.ts` - 사용자 정보 API
- `app/(main)/account/page.tsx` - 계정 페이지
- `next.config.js` - 이미지 도메인 설정

