'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Rating } from '@/components/ui/Rating';
import { ClinicWithRelations } from '@/types';
import { MapPin, Phone, Globe, Heart } from 'lucide-react';

interface ClinicDetailProps {
  clinic: ClinicWithRelations;
}

export function ClinicDetail({ clinic }: ClinicDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'treatments' | 'reviews' | 'location'>('overview');
  const [isFavorite, setIsFavorite] = useState(false);

  const mainImage = clinic.images?.find(img => img.type === 'main')?.url || clinic.images?.[0]?.url;
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
        {mainImage && (
          <div className="relative h-96 w-full rounded-lg overflow-hidden mb-6">
            <Image
              src={mainImage}
              alt={clinic.name}
              fill
              className="object-cover"
            />
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
              <div className="overflow-x-auto">
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
                          <img
                            key={idx}
                            src={img.url}
                            alt={`Review image ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded"
                          />
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
              <div className="h-96 w-full bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-600">지도가 여기에 표시됩니다 (Google Maps 연동 필요)</p>
              </div>
            ) : (
              <p className="text-gray-600">위치 정보가 없습니다.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

