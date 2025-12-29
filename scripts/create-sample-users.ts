/**
 * 샘플 사용자 계정 생성 스크립트
 * 
 * Google 및 Kakao OAuth 계정을 포함한 20명의 샘플 사용자를 생성합니다.
 * 
 * 사용법:
 *   npx tsx scripts/create-sample-users.ts
 *   또는
 *   npm run create:sample-users
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { randomBytes } from 'crypto';

// 환경 변수 로드
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

// 샘플 사용자 데이터
const sampleUsers = [
  { name: '김민수', email: 'kim.minsu@example.com', provider: 'google' },
  { name: '이지은', email: 'lee.jieun@example.com', provider: 'kakao' },
  { name: '박준호', email: 'park.junho@example.com', provider: 'google' },
  { name: '최수진', email: 'choi.sujin@example.com', provider: 'kakao' },
  { name: '정태영', email: 'jung.taeyoung@example.com', provider: 'google' },
  { name: '한소영', email: 'han.soyoung@example.com', provider: 'kakao' },
  { name: '윤동현', email: 'yoon.donghyun@example.com', provider: 'google' },
  { name: '강미라', email: 'kang.mira@example.com', provider: 'kakao' },
  { name: '조성민', email: 'cho.sungmin@example.com', provider: 'google' },
  { name: '임하늘', email: 'lim.haneul@example.com', provider: 'kakao' },
  { name: '오지훈', email: 'oh.jihun@example.com', provider: 'google' },
  { name: '신유진', email: 'shin.yujin@example.com', provider: 'kakao' },
  { name: '서현우', email: 'seo.hyunwoo@example.com', provider: 'google' },
  { name: '권지혜', email: 'kwon.jihye@example.com', provider: 'kakao' },
  { name: '송민재', email: 'song.minjae@example.com', provider: 'google' },
  { name: '배수아', email: 'bae.sua@example.com', provider: 'kakao' },
  { name: '홍준서', email: 'hong.junseo@example.com', provider: 'google' },
  { name: '류다은', email: 'ryu.daeun@example.com', provider: 'kakao' },
  { name: '문현석', email: 'moon.hyunsuk@example.com', provider: 'google' },
  { name: '안지원', email: 'ahn.jiwon@example.com', provider: 'kakao' },
];

async function createSampleUsers() {
  console.log('=== 샘플 사용자 계정 생성 시작 ===\n');

  try {
    let createdCount = 0;
    let skippedCount = 0;

    for (const userData of sampleUsers) {
      try {
        // 이미 존재하는 사용자인지 확인
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email },
        });

        if (existingUser) {
          console.log(`⏭️  건너뜀: ${userData.email} (이미 존재)`);
          skippedCount++;
          continue;
        }

        // 사용자 생성
        const user = await prisma.user.create({
          data: {
            email: userData.email,
            name: userData.name,
            provider: userData.provider,
            providerId: randomBytes(16).toString('hex'), // 랜덤 Provider ID
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
            emailVerified: new Date(),
            role: 'user',
          },
        });

        // OAuth Account 생성 (NextAuth 형식)
        const providerAccountId = randomBytes(16).toString('hex');
        await prisma.account.create({
          data: {
            userId: user.id,
            type: 'oauth',
            provider: userData.provider,
            providerAccountId: providerAccountId,
            access_token: randomBytes(32).toString('hex'),
            refresh_token: randomBytes(32).toString('hex'),
            expires_at: Math.floor(Date.now() / 1000) + 3600, // 1시간 후 만료
            token_type: 'Bearer',
            scope: userData.provider === 'google' 
              ? 'openid profile email' 
              : 'profile_nickname profile_image account_email',
          },
        });

        console.log(`✅ 생성됨: ${userData.name} (${userData.email}) - ${userData.provider}`);
        createdCount++;
      } catch (error: any) {
        console.error(`❌ 오류 (${userData.email}):`, error.message);
      }
    }

    console.log('\n=== 생성 완료 ===');
    console.log(`✅ 생성된 사용자: ${createdCount}명`);
    console.log(`⏭️  건너뛴 사용자: ${skippedCount}명`);
    console.log(`📊 전체: ${sampleUsers.length}명\n`);

    // 생성된 사용자 목록 확인
    const totalUsers = await prisma.user.count();
    const googleUsers = await prisma.user.count({
      where: { provider: 'google' },
    });
    const kakaoUsers = await prisma.user.count({
      where: { provider: 'kakao' },
    });

    console.log('📈 현재 데이터베이스 상태:');
    console.log(`   전체 사용자: ${totalUsers}명`);
    console.log(`   Google 계정: ${googleUsers}명`);
    console.log(`   Kakao 계정: ${kakaoUsers}명\n`);
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
createSampleUsers()
  .then(() => {
    console.log('✅ 스크립트 실행 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 스크립트 실행 실패:', error);
    process.exit(1);
  });

