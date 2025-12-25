// 지역 목록
export const REGIONS = [
  { value: 'gangnam', label: '강남', labelEn: 'Gangnam' },
  { value: 'cheongdam', label: '청담', labelEn: 'Cheongdam' },
  { value: 'apgujeong', label: '압구정', labelEn: 'Apgujeong' },
  { value: 'sinsa', label: '신사동', labelEn: 'Sinsa' },
  { value: 'samsung', label: '삼성동', labelEn: 'Samsung' },
] as const;

// 시술 카테고리
export const TREATMENT_CATEGORIES = [
  { value: 'laser', label: '레이저', labelEn: 'Laser' },
  { value: 'injectable', label: '보톡스/필러', labelEn: 'Injectable' },
  { value: 'skincare', label: '스킨케어', labelEn: 'Skincare' },
  { value: 'other', label: '기타', labelEn: 'Other' },
] as const;

// 정렬 옵션
export const SORT_OPTIONS = [
  { value: 'rating', label: '평점 높은 순', labelEn: 'Highest Rated' },
  { value: 'reviews', label: '리뷰 많은 순', labelEn: 'Most Reviews' },
  { value: 'price-low', label: '가격 낮은 순', labelEn: 'Price: Low to High' },
  { value: 'price-high', label: '가격 높은 순', labelEn: 'Price: High to Low' },
  { value: 'newest', label: '최신 순', labelEn: 'Newest' },
] as const;

// 가격 범위
export const PRICE_RANGES = [
  { min: 0, max: 100000, label: '10만원 이하', labelEn: 'Under ₩100,000' },
  { min: 100000, max: 200000, label: '10만원 - 20만원', labelEn: '₩100,000 - ₩200,000' },
  { min: 200000, max: 300000, label: '20만원 - 30만원', labelEn: '₩200,000 - ₩300,000' },
  { min: 300000, max: 500000, label: '30만원 - 50만원', labelEn: '₩300,000 - ₩500,000' },
  { min: 500000, max: Infinity, label: '50만원 이상', labelEn: 'Over ₩500,000' },
] as const;

// 페이지네이션
export const ITEMS_PER_PAGE = 20;
export const ITEMS_PER_PAGE_OPTIONS = [10, 20, 30, 50] as const;

// 리뷰 정렬
export const REVIEW_SORT_OPTIONS = [
  { value: 'newest', label: '최신순', labelEn: 'Newest' },
  { value: 'oldest', label: '오래된 순', labelEn: 'Oldest' },
  { value: 'rating-high', label: '평점 높은 순', labelEn: 'Highest Rated' },
  { value: 'rating-low', label: '평점 낮은 순', labelEn: 'Lowest Rated' },
  { value: 'helpful', label: '도움됨', labelEn: 'Most Helpful' },
] as const;

// 지원 언어
export const SUPPORTED_LANGUAGES = [
  { code: 'ko', label: '한국어', nativeLabel: '한국어' },
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'zh', label: '中文', nativeLabel: '中文' },
  { code: 'ja', label: '日本語', nativeLabel: '日本語' },
] as const;

// 앱 설정
export const APP_NAME = 'Korean Clinic Advisor';
export const APP_DESCRIPTION = 'Find the best skin clinics in Gangnam area';

// 이미지 설정
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_REVIEW_IMAGES = 5;

// 리뷰 설정
export const MIN_REVIEW_LENGTH = 10;
export const MAX_REVIEW_LENGTH = 2000;

