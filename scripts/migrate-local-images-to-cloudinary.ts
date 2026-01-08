/**
 * 로컬 이미지 경로를 Cloudinary로 마이그레이션하는 스크립트
 * 
 * 데이터베이스에 로컬 경로로 저장된 이미지 URL을 Cloudinary로 업로드하고 업데이트합니다.
 * 
 * 사용법:
 *   npx tsx scripts/migrate-local-images-to-cloudinary.ts
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { uploadImage, isCloudinaryConfigured } from '../lib/cloudinary';

// 환경 변수 로드
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function migrateLocalImagesToCloudinary() {
  console.log('=== 로컬 이미지를 Cloudinary로 마이그레이션 ===\n');
  
  // Cloudinary 설정 확인
  if (!isCloudinaryConfigured()) {
    console.log('❌ Cloudinary가 설정되지 않았습니다.');
    console.log('   .env.local 파일에 다음 변수를 설정하세요:');
    console.log('   - CLOUDINARY_CLOUD_NAME');
    console.log('   - CLOUDINARY_API_KEY');
    console.log('   - CLOUDINARY_API_SECRET\n');
    process.exit(1);
  }
  
  try {
    // 로컬 경로로 저장된 이미지 조회
    const localImages = await prisma.clinicImage.findMany({
      where: {
        url: {
          startsWith: '/images/',
        },
      },
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    console.log(`📊 로컬 경로 이미지 개수: ${localImages.length}개\n`);
    
    if (localImages.length === 0) {
      console.log('✅ 마이그레이션할 로컬 이미지가 없습니다.\n');
      return;
    }
    
    // Picsum Photos URL도 마이그레이션 대상에 포함 (선택사항)
    const picsumImages = await prisma.clinicImage.findMany({
      where: {
        url: {
          contains: 'picsum.photos',
        },
      },
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    console.log(`📊 Picsum Photos 이미지 개수: ${picsumImages.length}개\n`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // 로컬 이미지 마이그레이션
    if (localImages.length > 0) {
      console.log('🔄 로컬 이미지 마이그레이션 시작...\n');
      
      for (const image of localImages) {
        try {
          // 로컬 파일이 실제로 존재하지 않으므로, 랜덤 이미지를 생성하여 업로드
          console.log(`   처리 중: ${image.clinic.name} - ${image.type} (${image.url})`);
          
          // 랜덤 이미지 다운로드
          const seed = `${image.clinicId}-${image.id}`;
          const imageUrlToDownload = `https://picsum.photos/seed/${seed}/800/600`;
          
          const response = await fetch(imageUrlToDownload, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          });
          
          if (!response.ok) {
            throw new Error(`Failed to download image: ${response.statusText}`);
          }
          
          const imageBuffer = Buffer.from(await response.arrayBuffer());
          
          // Cloudinary에 업로드
          const uploadResult = await uploadImage(imageBuffer, {
            folder: `korean-clinic-advisor/clinics/${image.clinicId}`,
            resource_type: 'image',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            max_file_size: 10 * 1024 * 1024,
          });
          
          // 데이터베이스 업데이트
          await prisma.clinicImage.update({
            where: { id: image.id },
            data: {
              url: uploadResult.secure_url,
            },
          });
          
          console.log(`   ✅ 마이그레이션 완료: ${uploadResult.secure_url}\n`);
          migratedCount++;
          
          // API 호출 제한을 고려한 딜레이
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error: any) {
          console.error(`   ❌ 마이그레이션 실패: ${error.message}\n`);
          errorCount++;
        }
      }
    }
    
    // Picsum Photos 이미지 마이그레이션 (선택사항)
    if (picsumImages.length > 0) {
      console.log('\n🔄 Picsum Photos 이미지 마이그레이션 시작...\n');
      
      for (const image of picsumImages) {
        try {
          console.log(`   처리 중: ${image.clinic.name} - ${image.type}`);
          
          // Picsum Photos 이미지 다운로드
          const response = await fetch(image.url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          });
          
          if (!response.ok) {
            throw new Error(`Failed to download image: ${response.statusText}`);
          }
          
          const imageBuffer = Buffer.from(await response.arrayBuffer());
          
          // Cloudinary에 업로드
          const uploadResult = await uploadImage(imageBuffer, {
            folder: `korean-clinic-advisor/clinics/${image.clinicId}`,
            resource_type: 'image',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            max_file_size: 10 * 1024 * 1024,
          });
          
          // 데이터베이스 업데이트
          await prisma.clinicImage.update({
            where: { id: image.id },
            data: {
              url: uploadResult.secure_url,
            },
          });
          
          console.log(`   ✅ 마이그레이션 완료: ${uploadResult.secure_url}\n`);
          migratedCount++;
          
          // API 호출 제한을 고려한 딜레이
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error: any) {
          console.error(`   ❌ 마이그레이션 실패: ${error.message}\n`);
          errorCount++;
        }
      }
    }
    
    console.log('\n=== 마이그레이션 완료 ===');
    console.log(`✅ 마이그레이션된 이미지: ${migratedCount}개`);
    console.log(`⏭️  건너뛴 이미지: ${skippedCount}개`);
    console.log(`❌ 실패한 이미지: ${errorCount}개\n`);
    
    // 최종 통계
    const finalStats = await prisma.clinicImage.groupBy({
      by: [],
      _count: true,
      where: {
        url: {
          contains: 'cloudinary.com',
        },
      },
    });
    
    const totalCloudinary = finalStats[0]?._count || 0;
    console.log(`📊 최종 Cloudinary 이미지 개수: ${totalCloudinary}개\n`);
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateLocalImagesToCloudinary()
  .then(() => {
    console.log('✅ 스크립트 실행 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 스크립트 실행 실패:', error);
    process.exit(1);
  });
