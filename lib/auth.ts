import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import KakaoProvider from 'next-auth/providers/kakao';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
      // 동일한 이메일로 다른 provider 계정을 자동으로 연결
      // 주의: 보안상 이메일 검증이 완료된 경우에만 사용 권장
      allowDangerousEmailAccountLinking: true,
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID || '',
      clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
      // 동일한 이메일로 다른 provider 계정을 자동으로 연결
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // callbackUrl이 있으면 해당 URL로, 없으면 baseUrl로
      // 상대 경로인 경우 baseUrl과 결합
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // 같은 origin인 경우 허용
      if (new URL(url).origin === baseUrl) return url;
      // 기본값: baseUrl
      return baseUrl;
    },
    async signIn({ user, account, profile }) {
      // Kakao의 경우 이메일이 없을 수 있으므로 PrismaAdapter가 처리하기 전에 이메일 생성
      if (account && user) {
        // 이메일이 없는 경우 (Kakao 등) - PrismaAdapter가 사용할 이메일 생성
        // PrismaAdapter가 User를 생성하기 전에 이메일이 반드시 설정되어야 함
        if (!user.email && account.provider && account.providerAccountId) {
          // PrismaAdapter가 사용하는 형식: {provider}_{providerAccountId}@${provider}.local
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
    },
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
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

