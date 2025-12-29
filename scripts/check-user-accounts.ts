/**
 * 사용자 계정 연결 확인 스크립트
 * 
 * 이 스크립트는 데이터베이스에서 OAuth 계정과 연결된 사용자 정보를 확인합니다.
 * 
 * 사용법:
 *   npx tsx scripts/check-user-accounts.ts
 *   또는
 *   npm run check:users
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function checkUserAccounts() {
  console.log('=== 사용자 계정 연결 확인 ===\n');

  try {
    // 1. 전체 사용자 수 확인
    const totalUsers = await prisma.user.count();
    console.log(`📊 전체 사용자 수: ${totalUsers}\n`);

    if (totalUsers === 0) {
      console.log('⚠️  데이터베이스에 사용자가 없습니다.');
      console.log('   로그인을 먼저 시도해보세요.\n');
      return;
    }

    // 2. Provider별 사용자 수 확인
    const usersByProvider = await prisma.user.groupBy({
      by: ['provider'],
      _count: {
        id: true,
      },
    });

    console.log('📈 Provider별 사용자 수:');
    usersByProvider.forEach((group) => {
      console.log(`   - ${group.provider || 'unknown'}: ${group._count.id}명`);
    });
    console.log('');

    // 3. 전체 사용자 목록 (계정 정보 포함)
    const users = await prisma.user.findMany({
      include: {
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
            type: true,
          },
        },
        sessions: {
          select: {
            sessionToken: true,
            expires: true,
          },
          take: 1, // 최근 세션 1개만
          orderBy: {
            expires: 'desc',
          },
        },
        _count: {
          select: {
            reviews: true,
            favorites: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('👥 사용자 상세 정보:\n');
    users.forEach((user, index) => {
      console.log(`${index + 1}. 사용자 ID: ${user.id}`);
      console.log(`   이메일: ${user.email}`);
      console.log(`   이름: ${user.name || '(없음)'}`);
      console.log(`   Provider: ${user.provider || '(없음)'}`);
      console.log(`   Provider ID: ${user.providerId || '(없음)'}`);
      console.log(`   역할: ${user.role}`);
      console.log(`   생성일: ${user.createdAt.toLocaleString('ko-KR')}`);
      console.log(`   최종 수정일: ${user.updatedAt.toLocaleString('ko-KR')}`);

      // 계정 정보
      if (user.accounts.length > 0) {
        console.log(`   연결된 OAuth 계정:`);
        user.accounts.forEach((account) => {
          console.log(`     - ${account.provider} (${account.type})`);
          console.log(`       Provider Account ID: ${account.providerAccountId}`);
        });
      } else {
        console.log(`   ⚠️  연결된 OAuth 계정이 없습니다.`);
      }

      // 세션 정보
      if (user.sessions.length > 0) {
        const session = user.sessions[0];
        const isExpired = session.expires < new Date();
        console.log(`   최근 세션: ${isExpired ? '❌ 만료됨' : '✅ 활성'}`);
        console.log(`     만료일: ${session.expires.toLocaleString('ko-KR')}`);
      } else {
        console.log(`   세션: 없음`);
      }

      // 활동 정보
      console.log(`   작성한 리뷰: ${user._count.reviews}개`);
      console.log(`   즐겨찾기: ${user._count.favorites}개`);
      console.log('');
    });

    // 4. 계정 연결 상태 확인
    console.log('🔗 계정 연결 상태:\n');
    const usersWithAccounts = await prisma.user.findMany({
      where: {
        accounts: {
          some: {},
        },
      },
      include: {
        accounts: true,
      },
    });

    const usersWithoutAccounts = await prisma.user.findMany({
      where: {
        accounts: {
          none: {},
        },
      },
    });

    console.log(`✅ OAuth 계정이 연결된 사용자: ${usersWithAccounts.length}명`);
    if (usersWithoutAccounts.length > 0) {
      console.log(`⚠️  OAuth 계정이 연결되지 않은 사용자: ${usersWithoutAccounts.length}명`);
      usersWithoutAccounts.forEach((user) => {
        console.log(`   - ${user.email} (ID: ${user.id})`);
      });
    }

    // 5. Provider별 계정 상세 정보
    console.log('\n📋 Provider별 계정 상세:\n');
    const accounts = await prisma.account.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    const googleAccounts = accounts.filter((a) => a.provider === 'google');
    const kakaoAccounts = accounts.filter((a) => a.provider === 'kakao');

    console.log(`🔵 Google 계정: ${googleAccounts.length}개`);
    googleAccounts.forEach((account) => {
      console.log(`   - ${account.user.email} (${account.user.name || '이름 없음'})`);
      console.log(`     Provider Account ID: ${account.providerAccountId}`);
    });

    console.log(`\n🟡 Kakao 계정: ${kakaoAccounts.length}개`);
    kakaoAccounts.forEach((account) => {
      console.log(`   - ${account.user.email} (${account.user.name || '이름 없음'})`);
      console.log(`     Provider Account ID: ${account.providerAccountId}`);
    });

    console.log('\n✅ 확인 완료!\n');
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
checkUserAccounts()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('스크립트 실행 실패:', error);
    process.exit(1);
  });

