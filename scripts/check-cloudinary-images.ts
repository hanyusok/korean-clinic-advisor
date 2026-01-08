/**
 * Cloudinary 이미지 확인 스크립트
 * 
 * 데이터베이스에서 Cloudinary URL이 저장된 이미지를 확인합니다.
 * 
 * 사용법:
 *   npx tsx scripts/check-cloudinary-images.ts
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function checkCloudinaryImages() {
  console.log('=== Cloudinary 이미지 확인 ===\n');
  
  try {
    // Cloudinary URL이 포함된 이미지 조회
    const cloudinaryImages = await prisma.clinicImage.findMany({
      where: {
        url: {
          contains: 'cloudinary.com',
        },
      },
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            region: true,
          },
        },
      },
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    console.log(`📊 Cloudinary 이미지 개수: ${cloudinaryImages.length}개\n`);
    
    if (cloudinaryImages.length === 0) {
      console.log('⚠️  Cloudinary 이미지가 없습니다.');
      console.log('   샘플 클리닉을 생성하려면 다음 명령을 실행하세요:');
      console.log('   npm run create:sample-clinics\n');
      
      // 전체 이미지 개수 확인
      const totalImages = await prisma.clinicImage.count();
      const totalClinics = await prisma.clinic.count();
      
      console.log('📈 전체 통계:');
      console.log(`   전체 클리닉: ${totalClinics}개`);
      console.log(`   전체 이미지: ${totalImages}개\n`);
      
      if (totalImages > 0) {
        // 샘플 이미지 URL 확인
        const sampleImages = await prisma.clinicImage.findMany({
          take: 3,
          include: {
            clinic: {
              select: {
                name: true,
              },
            },
          },
        });
        
        console.log('📸 샘플 이미지 URL:');
        sampleImages.forEach((img, idx) => {
          const isCloudinary = img.url.includes('cloudinary.com');
          console.log(`   ${idx + 1}. ${img.clinic.name}`);
          console.log(`      URL: ${img.url}`);
          console.log(`      타입: ${img.type} | Cloudinary: ${isCloudinary ? '✅' : '❌'}\n`);
        });
      }
    } else {
      console.log('✅ Cloudinary 이미지 목록:\n');
      
      cloudinaryImages.forEach((img, idx) => {
        console.log(`${idx + 1}. 클리닉: ${img.clinic.name}`);
        console.log(`   ID: ${img.id}`);
        console.log(`   URL: ${img.url}`);
        console.log(`   타입: ${img.type}`);
        console.log(`   순서: ${img.order}`);
        console.log(`   생성일: ${new Date(img.createdAt).toLocaleString('ko-KR')}\n`);
      });
      
      // 통계
      const stats = await prisma.clinicImage.groupBy({
        by: ['type'],
        where: {
          url: {
            contains: 'cloudinary.com',
          },
        },
        _count: true,
      });
      
      console.log('📊 이미지 타입별 통계:');
      stats.forEach((stat) => {
        console.log(`   ${stat.type}: ${stat._count}개`);
      });
      console.log('');
      
      // 클리닉별 이미지 개수
      const clinicStats = await prisma.clinicImage.groupBy({
        by: ['clinicId'],
        where: {
          url: {
            contains: 'cloudinary.com',
          },
        },
        _count: true,
      });
      
      console.log(`📁 Cloudinary 이미지를 가진 클리닉: ${clinicStats.length}개\n`);
    }
    
    // URL 형식 확인
    const allImages = await prisma.clinicImage.findMany({
      take: 100,
      select: {
        url: true,
      },
    });
    
    const urlTypes = {
      cloudinary: 0,
      picsum: 0,
      local: 0,
      other: 0,
    };
    
    allImages.forEach((img) => {
      if (img.url.includes('cloudinary.com')) {
        urlTypes.cloudinary++;
      } else if (img.url.includes('picsum.photos')) {
        urlTypes.picsum++;
      } else if (img.url.startsWith('/')) {
        urlTypes.local++;
      } else {
        urlTypes.other++;
      }
    });
    
    console.log('🌐 이미지 URL 형식 통계:');
    console.log(`   Cloudinary: ${urlTypes.cloudinary}개`);
    console.log(`   Picsum Photos: ${urlTypes.picsum}개`);
    console.log(`   로컬 경로: ${urlTypes.local}개`);
    console.log(`   기타: ${urlTypes.other}개\n`);
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkCloudinaryImages()
  .then(() => {
    console.log('✅ 확인 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 확인 실패:', error);
    process.exit(1);
  });
