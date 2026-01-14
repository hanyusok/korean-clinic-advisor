'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Rating } from '@/components/ui/Rating';
import { ClinicMap } from '@/components/map/ClinicMap';
import { ClinicWithRelations } from '@/types';
import { MapPin, Phone, Globe, Heart } from 'lucide-react';

interface ClinicDetailProps {
  clinic: ClinicWithRelations;
}

// 리뷰 이미지 컴포넌트 (에러 처리 포함)
function ReviewImage({ imageUrl, alt }: { imageUrl: string; alt: string }) {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(imageUrl);

  const handleError = () => {
    if (!imageError) {
      setImageError(true);
      setImageSrc('/images/placeholder-clinic.jpg');
    }
  };

  // 외부 URL인지 확인
  const isExternal = imageUrl.startsWith('http://') || imageUrl.startsWith('https://');
  
  if (imageError || !imageUrl) {
    return (
      <div className="relative w-20 h-20 rounded bg-gray-200 flex items-center justify-center">
        <span className="text-xs text-gray-400">이미지 없음</span>
      </div>
    );
  }

  return (
    <div className="relative w-20 h-20 rounded overflow-hidden">
      {isExternal ? (
        <img
          src={imageSrc}
          alt={alt}
          className="w-full h-full object-cover"
          onError={handleError}
        />
      ) : (
        <Image
          src={imageSrc}
          alt={alt}
          width={80}
          height={80}
          className="object-cover"
          onError={handleError}
          unoptimized={imageSrc.startsWith('/images/')}
        />
      )}
    </div>
  );
}

export function ClinicDetail({ clinic }: ClinicDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'treatments' | 'reviews' | 'location'>('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  const originalImage = clinic.images?.find(img => img.type === 'main')?.url || clinic.images?.[0]?.url;
  const hasImage = !imageError && originalImage;
  const isExternal = originalImage ? (originalImage.startsWith('http://') || originalImage.startsWith('https://')) : false;
  const reviewCount = clinic._count?.reviews || 0;
  const averageRating = clinic.reviews?.length
    ? clinic.reviews.reduce((sum, r) => sum + r.rating, 0) / clinic.reviews.length
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{clinic.name}</h1>
            <div className="flex items-center gap-4 mb-2">
              <Rating rating={averageRating} size="md" showValue />
              <span className="text-gray-600">({reviewCount}개 리뷰)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{clinic.address}</span>
            </div>
          </div>
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>
        </div>

        {/* Image Gallery */}
        {clinic.images && clinic.images.length > 0 ? (
          <div className="mb-6">
            {/* Main Image */}
            <div className="relative h-96 w-full rounded-lg overflow-hidden mb-4 bg-gradient-to-br from-gray-100 to-gray-200">
              {hasImage ? (
                isExternal ? (
                  <img
                    src={originalImage}
                    alt={clinic.name}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <Image
                    src={originalImage}
                    alt={clinic.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                    className="object-cover"
                    onError={() => {
                      setImageError(true);
                    }}
                    unoptimized={originalImage.startsWith('/images/')}
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-300 flex items-center justify-center">
                      <MapPin className="w-12 h-12 text-gray-500" />
                    </div>
                    <p className="text-lg text-gray-600 font-medium">이미지 없음</p>
                    <p className="text-sm text-gray-500 mt-1">{clinic.name}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery (if multiple images) */}
            {clinic.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {clinic.images.slice(0, 4).map((img, idx) => {
                  const imgIsExternal = img.url.startsWith('http://') || img.url.startsWith('https://');
                  return (
                    <div key={img.id || idx} className="relative aspect-video rounded overflow-hidden bg-gray-100">
                      {imgIsExternal ? (
                        <img
                          src={img.url}
                          alt={`${clinic.name} 이미지 ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image
                          src={img.url}
                          alt={`${clinic.name} 이미지 ${idx + 1}`}
                          fill
                          sizes="(max-width: 768px) 25vw, 200px"
                          className="object-cover"
                          unoptimized={img.url.startsWith('/images/')}
                        />
                      )}
                    </div>
                  );
                })}
                {clinic.images.length > 4 && (
                  <div className="relative aspect-video rounded overflow-hidden bg-gray-200 flex items-center justify-center">
                    <span className="text-sm text-gray-500">+{clinic.images.length - 4}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="relative h-96 w-full rounded-lg overflow-hidden mb-6 bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-300 flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-gray-500" />
                </div>
                <p className="text-lg text-gray-600 font-medium">이미지 없음</p>
                <p className="text-sm text-gray-500 mt-1">{clinic.name}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="flex gap-4">
          {[
            { id: 'overview', label: '개요' },
            { id: 'treatments', label: '시술 및 가격' },
            { id: 'reviews', label: '리뷰' },
            { id: 'location', label: '위치' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 px-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">설명</h3>
              <p className="text-gray-700">{clinic.description || '설명이 없습니다.'}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">연락처</h3>
              <div className="space-y-2">
                {clinic.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{clinic.phone}</span>
                  </div>
                )}
                {clinic.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <a href={clinic.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {clinic.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'treatments' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">시술 및 가격</h3>
            {clinic.clinicTreatments && clinic.clinicTreatments.length > 0 ? (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">시술명</th>
                        <th className="text-right p-3">가격</th>
                        <th className="text-right p-3">소요시간</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clinic.clinicTreatments.map((ct) => (
                        <tr key={ct.id} className="border-b">
                          <td className="p-3">{ct.treatment.name}</td>
                          <td className="text-right p-3">{Number(ct.price).toLocaleString()}원</td>
                          <td className="text-right p-3">{ct.duration ? `${ct.duration}분` : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {clinic.clinicTreatments.map((ct) => (
                    <div key={ct.id} className="border rounded-lg p-4 space-y-2">
                      <h4 className="font-semibold text-lg">{ct.treatment.name}</h4>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">가격</span>
                        <span className="font-medium text-primary">{Number(ct.price).toLocaleString()}원</span>
                      </div>
                      {ct.duration && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">소요시간</span>
                          <span className="text-gray-700">{ct.duration}분</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-600">시술 정보가 없습니다.</p>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">리뷰</h3>
              <Link
                href={`/reviews/new?clinicId=${clinic.id}`}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                리뷰 작성
              </Link>
            </div>
            {clinic.reviews && clinic.reviews.length > 0 ? (
              <div className="space-y-4">
                {clinic.reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.user.name || '익명'}</span>
                        <Rating rating={review.rating} size="sm" />
                      </div>
                      <span className="text-sm text-gray-600">
                        {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    {review.treatment && (
                      <p className="text-sm text-gray-500 mb-2">시술: {review.treatment.name}</p>
                    )}
                    <p className="text-gray-700 mb-2">{review.content}</p>
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {review.images.map((img, idx) => (
                          <ReviewImage key={img.id || idx} imageUrl={img.url} alt={`Review image ${idx + 1}`} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">리뷰가 없습니다.</p>
                <Link
                  href={`/reviews/new?clinicId=${clinic.id}`}
                  className="inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                  첫 리뷰 작성하기
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'location' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">위치</h3>
            {clinic.latitude && clinic.longitude ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">{clinic.address}</span>
                </div>
                <ClinicMap
                  latitude={Number(clinic.latitude)}
                  longitude={Number(clinic.longitude)}
                  clinicName={clinic.name}
                  address={clinic.address}
                  height="500px"
                />
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>참고:</strong> 지도에서 클리닉 위치를 확인할 수 있습니다. 
                    지도를 드래그하거나 확대/축소하여 주변 지역을 탐색하세요.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">위치 정보가 없습니다.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

