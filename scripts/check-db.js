require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    // 테이블 목록 확인
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    console.log('=== 생성된 테이블 목록 ===');
    result.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    console.log(`\n총 ${result.length}개의 테이블이 생성되었습니다.`);
    
  } catch (error) {
    console.error('오류:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();

