/**
 * Cloudinary 설정 테스트 스크립트
 * 
 * 사용법:
 *   npx tsx scripts/test-cloudinary.ts
 */

import dotenv from 'dotenv';
import { isCloudinaryConfigured, uploadImage } from '../lib/cloudinary';

// 환경 변수 로드
dotenv.config({ path: '.env.local' });

async function testCloudinary() {
  console.log('=== Cloudinary 설정 테스트 ===\n');
  
  // 환경 변수 확인
  console.log('환경 변수 확인:');
  console.log(`  CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME ? '✅ 설정됨' : '❌ 없음'}`);
  console.log(`  CLOUDINARY_API_KEY: ${process.env.CLOUDINARY_API_KEY ? '✅ 설정됨' : '❌ 없음'}`);
  console.log(`  CLOUDINARY_API_SECRET: ${process.env.CLOUDINARY_API_SECRET ? '✅ 설정됨' : '❌ 없음'}\n`);
  
  // 설정 확인
  const isConfigured = isCloudinaryConfigured();
  console.log(`Cloudinary 설정 상태: ${isConfigured ? '✅ 설정됨' : '❌ 설정 안됨'}\n`);
  
  if (!isConfigured) {
    console.log('⚠️  Cloudinary가 설정되지 않았습니다.');
    process.exit(1);
  }
  
  // 테스트 이미지 업로드
  console.log('테스트 이미지 업로드 중...');
  try {
    // 작은 테스트 이미지 다운로드
    const testImageUrl = 'https://picsum.photos/200/200';
    const response = await fetch(testImageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download test image: ${response.statusText}`);
    }
    
    const imageBuffer = Buffer.from(await response.arrayBuffer());
    
    // Cloudinary에 업로드
    const result = await uploadImage(imageBuffer, {
      folder: 'korean-clinic-advisor/test',
    });
    
    console.log('✅ 이미지 업로드 성공!');
    console.log(`  Public ID: ${result.public_id}`);
    console.log(`  URL: ${result.secure_url}`);
    console.log(`  크기: ${result.width}x${result.height}`);
    console.log(`  형식: ${result.format}`);
    console.log(`  용량: ${(result.bytes / 1024).toFixed(2)} KB\n`);
    
    console.log('✅ Cloudinary 설정이 정상적으로 작동합니다!');
  } catch (error: any) {
    console.error('❌ 이미지 업로드 실패:', error.message);
    console.error('   전체 에러:', error);
    process.exit(1);
  }
}

testCloudinary()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 테스트 실패:', error);
    process.exit(1);
  });
