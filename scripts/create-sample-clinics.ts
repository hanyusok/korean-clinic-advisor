/**
 * 샘플 클리닉 데이터 생성 스크립트
 * 
 * 100개의 랜덤 클리닉 데이터를 생성합니다.
 * Treatment와 ClinicTreatment 데이터도 함께 생성합니다.
 * 
 * 사용법:
 *   npx tsx scripts/create-sample-clinics.ts
 *   또는
 *   npm run create:sample-clinics
 */

import { PrismaClient, Prisma } from '@prisma/client';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

// 지역 정보 (스키마에는 한국어 이름 저장)
const REGIONS = [
  { name: '강남', nameEn: 'Gangnam', lat: 37.5172, lng: 127.0473 },
  { name: '청담', nameEn: 'Cheongdam', lat: 37.5194, lng: 127.0473 },
  { name: '압구정', nameEn: 'Apgujeong', lat: 37.5275, lng: 127.0286 },
  { name: '신사동', nameEn: 'Sinsa', lat: 37.5161, lng: 127.0197 },
  { name: '삼성동', nameEn: 'Samsung', lat: 37.5146, lng: 127.0496 },
];

// 클리닉 이름 접두사/접미사
const CLINIC_PREFIXES = [
  '프리미엄', '엘리트', '비욘드', '아름다움', '퍼펙트', '글로벌', '프리미어', 
  '럭셔리', '프리미엄', '스킨', '뷰티', '에스테틱', '메디컬', '클리닉', '센터'
];

const CLINIC_NAMES = [
  '피부과', '성형외과', '의원', '클리닉', '뷰티센터', '에스테틱', 
  '스킨케어', '안티에이징', '리프팅', '화이트닝', '아쿠아', '골드',
  '다이아몬드', '플래티넘', '로얄', '시그니처', '프리미엄', '엘리트'
];

// 시술 종류 데이터
const TREATMENTS = [
  // 레이저
  { name: '탄력 리프팅', nameEn: 'Lifting Laser', nameZh: '紧致提升', nameJa: 'リフティング', category: 'laser', priceRange: [200000, 500000] },
  { name: '기미 제거', nameEn: 'Melasma Removal', nameZh: '祛斑', nameJa: 'シミ除去', category: 'laser', priceRange: [150000, 400000] },
  { name: '모공 관리', nameEn: 'Pore Treatment', nameZh: '毛孔管理', nameJa: '毛穴ケア', category: 'laser', priceRange: [100000, 300000] },
  { name: '주름 제거', nameEn: 'Wrinkle Removal', nameZh: '除皱', nameJa: 'シワ除去', category: 'laser', priceRange: [180000, 450000] },
  { name: '안티에이징', nameEn: 'Anti-Aging', nameZh: '抗衰老', nameJa: 'アンチエイジング', category: 'laser', priceRange: [250000, 600000] },
  
  // 보톡스/필러
  { name: '보톡스', nameEn: 'Botox', nameZh: '肉毒杆菌', nameJa: 'ボトックス', category: 'injectable', priceRange: [80000, 200000] },
  { name: '리프팅 보톡스', nameEn: 'Lifting Botox', nameZh: '提升肉毒', nameJa: 'リフティングボトックス', category: 'injectable', priceRange: [120000, 300000] },
  { name: '필러', nameEn: 'Filler', nameZh: '填充', nameJa: 'フィラー', category: 'injectable', priceRange: [200000, 800000] },
  { name: '리프팅 필러', nameEn: 'Lifting Filler', nameZh: '提升填充', nameJa: 'リフティングフィラー', category: 'injectable', priceRange: [300000, 1000000] },
  { name: '눈밑 필러', nameEn: 'Under Eye Filler', nameZh: '眼下填充', nameJa: '目の下フィラー', category: 'injectable', priceRange: [250000, 600000] },
  
  // 스킨케어
  { name: '화학적 각질 제거', nameEn: 'Chemical Peeling', nameZh: '化学换肤', nameJa: 'ケミカルピーリング', category: 'skincare', priceRange: [50000, 150000] },
  { name: '하이드라 페이셜', nameEn: 'Hydra Facial', nameZh: '水光针', nameJa: 'ハイドラフェイシャル', category: 'skincare', priceRange: [100000, 250000] },
  { name: '비타민 주사', nameEn: 'Vitamin Injection', nameZh: '维生素注射', nameJa: 'ビタミン注射', category: 'skincare', priceRange: [80000, 200000] },
  { name: '스킨 부스터', nameEn: 'Skin Booster', nameZh: '皮肤提升', nameJa: 'スキンブースター', category: 'skincare', priceRange: [150000, 350000] },
  { name: '프락셀', nameEn: 'Fraxel', nameZh: '飞梭', nameJa: 'フラクセル', category: 'skincare', priceRange: [200000, 500000] },
  
  // 기타
  { name: '슈링크', nameEn: 'Thread Lifting', nameZh: '线雕', nameJa: 'スレッドリフティング', category: 'other', priceRange: [500000, 2000000] },
  { name: '지방분해', nameEn: 'Fat Dissolving', nameZh: '溶脂', nameJa: '脂肪分解', category: 'other', priceRange: [300000, 800000] },
];

// 랜덤 함수
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomChoices<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// 클리닉 이름 생성
function generateClinicName(): { name: string; nameEn: string; nameZh: string; nameJa: string } {
  const prefix = Math.random() > 0.5 ? randomChoice(CLINIC_PREFIXES) : '';
  const name = randomChoice(CLINIC_NAMES);
  const number = randomInt(1, 99);
  
  const fullName = prefix ? `${prefix} ${name} ${number}` : `${name} ${number}`;
  
  return {
    name: fullName,
    nameEn: `${prefix || name} Clinic ${number}`,
    nameZh: `${prefix || name}诊所${number}`,
    nameJa: `${prefix || name}クリニック${number}`,
  };
}

// 주소 생성
function generateAddress(region: typeof REGIONS[0]): { address: string; addressEn: string; addressZh: string; addressJa: string } {
  const streetNumber = randomInt(1, 999);
  const buildingNumber = randomInt(1, 20);
  
  return {
    address: `서울특별시 강남구 ${region.name}로 ${streetNumber}길 ${buildingNumber} ${buildingNumber}층`,
    addressEn: `${buildingNumber}F, ${streetNumber}-${buildingNumber} ${region.nameEn}-ro, Gangnam-gu, Seoul`,
    addressZh: `首尔市江南区${region.name}路${streetNumber}街${buildingNumber}号${buildingNumber}层`,
    addressJa: `ソウル特別市江南区${region.name}路${streetNumber}番地${buildingNumber}号${buildingNumber}階`,
  };
}

// 전화번호 생성
function generatePhone(): string {
  return `02-${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`;
}

// 운영시간 생성
function generateOperatingHours(): Prisma.InputJsonValue {
  const openHour = randomInt(9, 10);
  const closeHour = randomInt(18, 21);
  const openMin = randomChoice(['00', '30']);
  const closeMin = randomChoice(['00', '30']);
  
  const hours: Record<string, string> = {};
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  days.forEach((day, index) => {
    if (index === 6) { // 일요일
      hours[day] = Math.random() > 0.3 ? 'Closed' : `${openHour}:${openMin}-${closeHour}:${closeMin}`;
    } else if (index === 5) { // 토요일
      hours[day] = Math.random() > 0.2 ? `${openHour}:${openMin}-${closeHour - 1}:${closeMin}` : 'Closed';
    } else {
      hours[day] = `${openHour}:${openMin}-${closeHour}:${closeMin}`;
    }
  });
  
  return hours;
}

// 설명 생성
function generateDescription(clinicName: string, region: string): { 
  description: string; 
  descriptionEn: string; 
  descriptionZh: string; 
  descriptionJa: string;
} {
  return {
    description: `${clinicName}은 ${region} 지역에 위치한 프리미엄 피부과 클리닉입니다. 최신 장비와 전문의의 정확한 진단으로 고객님의 아름다움을 찾아드립니다.`,
    descriptionEn: `${clinicName} is a premium dermatology clinic located in ${region}. We help you find your beauty with the latest equipment and accurate diagnosis by specialists.`,
    descriptionZh: `${clinicName}是位于${region}地区的优质皮肤科诊所。我们使用最新设备和专科医生的准确诊断，帮助您找到美丽。`,
    descriptionJa: `${clinicName}は${region}地域に位置するプレミアム皮膚科クリニックです。最新設備と専門医の正確な診断で、お客様の美しさを見つけます。`,
  };
}

// 위도/경도 생성 (지역 중심에서 약간의 랜덤 오프셋)
function generateCoordinates(region: typeof REGIONS[0]): { latitude: number; longitude: number } {
  const latOffset = randomFloat(-0.01, 0.01);
  const lngOffset = randomFloat(-0.01, 0.01);
  
  return {
    latitude: parseFloat((region.lat + latOffset).toFixed(8)),
    longitude: parseFloat((region.lng + lngOffset).toFixed(8)),
  };
}

async function createSampleClinics() {
  console.log('=== 샘플 클리닉 데이터 생성 시작 ===\n');
  
  try {
    // 1. Treatment 데이터 생성 (없는 경우만)
    console.log('📋 시술 종류 데이터 확인 중...');
    const existingTreatments = await prisma.treatment.findMany();
    
    if (existingTreatments.length === 0) {
      console.log('   시술 종류 데이터 생성 중...');
      for (const treatment of TREATMENTS) {
        await prisma.treatment.create({
          data: {
            name: treatment.name,
            nameEn: treatment.nameEn,
            nameZh: treatment.nameZh,
            nameJa: treatment.nameJa,
            category: treatment.category,
            description: `${treatment.name} 시술에 대한 상세 설명입니다.`,
            descriptionEn: `Detailed description of ${treatment.nameEn} treatment.`,
            descriptionZh: `${treatment.nameZh}治疗的详细说明。`,
            descriptionJa: `${treatment.nameJa}施術の詳細説明です。`,
          },
        });
      }
      console.log(`   ✅ ${TREATMENTS.length}개의 시술 종류 생성 완료\n`);
    } else {
      console.log(`   ✅ ${existingTreatments.length}개의 시술 종류가 이미 존재합니다\n`);
    }
    
    // 2. 클리닉 데이터 생성
    console.log('🏥 클리닉 데이터 생성 중...');
    const treatments = await prisma.treatment.findMany();
    let createdCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < 100; i++) {
      try {
        const region = randomChoice(REGIONS);
        const clinicNames = generateClinicName();
        const addresses = generateAddress(region);
        const descriptions = generateDescription(clinicNames.name, region.name);
        const coordinates = generateCoordinates(region);
        const phone = generatePhone();
        const operatingHours = generateOperatingHours();
        const hasWebsite = Math.random() > 0.3;
        const isActive = Math.random() > 0.1; // 90% 활성
        
        // 클리닉 생성
        const clinic = await prisma.clinic.create({
          data: {
            name: clinicNames.name,
            nameEn: clinicNames.nameEn,
            nameZh: clinicNames.nameZh,
            nameJa: clinicNames.nameJa,
            address: addresses.address,
            addressEn: addresses.addressEn,
            addressZh: addresses.addressZh,
            addressJa: addresses.addressJa,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            phone: phone,
            website: hasWebsite ? `https://www.${clinicNames.nameEn.toLowerCase().replace(/\s+/g, '')}.com` : null,
            operatingHours: operatingHours,
            description: descriptions.description,
            descriptionEn: descriptions.descriptionEn,
            descriptionZh: descriptions.descriptionZh,
            descriptionJa: descriptions.descriptionJa,
            region: region.name,
            isActive: isActive,
          },
        });
        
        // 클리닉별 시술 가격 생성 (각 클리닉당 3-8개 시술)
        const clinicTreatments = randomChoices(treatments, randomInt(3, 8));
        
        for (const treatment of clinicTreatments) {
          const treatmentData = TREATMENTS.find(t => t.name === treatment.name);
          if (treatmentData) {
            const price = randomInt(treatmentData.priceRange[0], treatmentData.priceRange[1]);
            const duration = randomInt(30, 120); // 30분 ~ 2시간
            
            await prisma.clinicTreatment.create({
              data: {
                clinicId: clinic.id,
                treatmentId: treatment.id,
                price: price,
                currency: 'KRW',
                duration: duration,
                description: `${clinic.name}에서 제공하는 ${treatment.name} 시술입니다.`,
                descriptionEn: `${treatment.nameEn} treatment provided by ${clinic.nameEn}.`,
                isActive: true,
              },
            });
          }
        }
        
        // 클리닉 이미지 생성 (각 클리닉당 1-3개)
        const imageCount = randomInt(1, 3);
        const imageTypes = ['main', 'interior', 'exterior'];
        
        for (let j = 0; j < imageCount; j++) {
          const imageType = j === 0 ? 'main' : randomChoice(['interior', 'exterior']);
          await prisma.clinicImage.create({
            data: {
              clinicId: clinic.id,
              url: `https://picsum.photos/800/600?random=${clinic.id}-${j}`,
              type: imageType,
              order: j,
            },
          });
        }
        
        createdCount++;
        if ((i + 1) % 10 === 0) {
          console.log(`   진행 중... ${i + 1}/100`);
        }
      } catch (error: any) {
        console.error(`   ❌ 오류 (클리닉 ${i + 1}):`, error.message);
        skippedCount++;
      }
    }
    
    console.log('\n=== 생성 완료 ===');
    console.log(`✅ 생성된 클리닉: ${createdCount}개`);
    console.log(`⏭️  건너뛴 클리닉: ${skippedCount}개`);
    console.log(`📊 전체: 100개\n`);
    
    // 통계 확인
    const totalClinics = await prisma.clinic.count();
    const activeClinics = await prisma.clinic.count({ where: { isActive: true } });
    const totalTreatments = await prisma.treatment.count();
    const totalClinicTreatments = await prisma.clinicTreatment.count();
    const totalImages = await prisma.clinicImage.count();
    
    const regionStats = await prisma.clinic.groupBy({
      by: ['region'],
      _count: true,
      orderBy: { _count: { region: 'desc' } },
    });
    
    console.log('📈 현재 데이터베이스 상태:');
    console.log(`   전체 클리닉: ${totalClinics}개`);
    console.log(`   활성 클리닉: ${activeClinics}개`);
    console.log(`   비활성 클리닉: ${totalClinics - activeClinics}개`);
    console.log(`   시술 종류: ${totalTreatments}개`);
    console.log(`   클리닉별 시술 정보: ${totalClinicTreatments}개`);
    console.log(`   클리닉 이미지: ${totalImages}개`);
    console.log('\n📍 지역별 클리닉 분포:');
    regionStats.forEach(stat => {
      console.log(`   - ${stat.region}: ${stat._count}개`);
    });
    console.log('');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
createSampleClinics()
  .then(() => {
    console.log('✅ 스크립트 실행 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 스크립트 실행 실패:', error);
    process.exit(1);
  });

