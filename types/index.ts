import { User, Clinic, Review, Treatment, ClinicTreatment, Promotion } from '@prisma/client';

// 사용자 타입
export type UserWithRelations = User & {
  reviews: Review[];
  favorites: Favorite[];
};

// 클리닉 타입
export type ClinicWithRelations = Clinic & {
  images: ClinicImage[];
  clinicTreatments: ClinicTreatmentWithTreatment[];
  reviews: ReviewWithUser[];
  promotions: Promotion[];
  _count?: {
    reviews: number;
  };
};

// 클리닉 이미지
export type ClinicImage = {
  id: string;
  clinicId: string;
  url: string;
  type: 'main' | 'interior' | 'exterior';
  order: number;
};

// 시술 타입
export type TreatmentWithRelations = Treatment & {
  clinicTreatments: ClinicTreatment[];
};

// 클리닉 시술 가격
export type ClinicTreatmentWithTreatment = ClinicTreatment & {
  treatment: Treatment;
};

// 리뷰 타입
export type ReviewWithUser = Review & {
  user: User;
  treatment: Treatment | null;
  images: ReviewImage[];
  _count?: {
    helpfulUsers: number;
  };
};

// 리뷰 이미지
export type ReviewImage = {
  id: string;
  reviewId: string;
  url: string;
  order: number;
};

// 즐겨찾기
export type Favorite = {
  id: string;
  userId: string;
  clinicId: string;
  clinic: Clinic;
  createdAt: Date;
};

// 검색 필터
export type SearchFilters = {
  region?: string;
  treatmentId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: 'rating' | 'reviews' | 'price-low' | 'price-high' | 'newest';
  search?: string;
};

// 페이지네이션
export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

// API 응답 타입
export type ApiResponse<T> = {
  data: T;
  pagination?: Pagination;
  error?: string;
};

// 클리닉 목록 응답
export type ClinicsResponse = ApiResponse<ClinicWithRelations[]>;

// 리뷰 목록 응답
export type ReviewsResponse = ApiResponse<ReviewWithUser[]>;

// 검색 결과
export type SearchResult = {
  clinics: ClinicWithRelations[];
  treatments: Treatment[];
  pagination: Pagination;
};

