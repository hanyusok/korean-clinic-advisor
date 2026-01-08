'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/Card';
import { Rating } from '@/components/ui/Rating';
import { formatPrice } from '@/lib/utils';
import { ClinicWithRelations } from '@/types';
import { MapPin } from 'lucide-react';

interface ClinicCardProps {
  clinic: ClinicWithRelations;
}

export function ClinicCard({ clinic }: ClinicCardProps) {
  const [imageError, setImageError] = useState(false);
  const originalImage = clinic.images?.[0]?.url;
  const hasImage = !imageError && originalImage;
  // Cloudinary URL인지 확인 (외부 URL)
  const isExternal = originalImage ? (originalImage.startsWith('http://') || originalImage.startsWith('https://')) : false;
  const reviewCount = clinic._count?.reviews || 0;
  const averageRating = clinic.reviews?.length
    ? clinic.reviews.reduce((sum, r) => sum + r.rating, 0) / clinic.reviews.length
    : 0;

  const minPrice = clinic.clinicTreatments?.length
    ? Math.min(...clinic.clinicTreatments.map((ct) => Number(ct.price)))
    : null;

  return (
    <Link href={`/clinics/${clinic.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="relative h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200">
          {hasImage ? (
            isExternal ? (
              // Cloudinary 등 외부 URL인 경우 일반 img 태그 사용
              <img
                src={originalImage}
                alt={clinic.name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              // 로컬 이미지인 경우 Next.js Image 사용
              <Image
                src={originalImage}
                alt={clinic.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                onError={() => {
                  // 이미지 로드 실패 시 fallback UI 표시
                  setImageError(true);
                }}
                unoptimized={originalImage?.startsWith('/images/')}
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-300 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-xs text-gray-500">이미지 없음</p>
              </div>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1">{clinic.name}</h3>
          
          <div className="flex items-center gap-2 mb-2">
            <Rating rating={averageRating} size="sm" showValue />
            <span className="text-sm text-gray-600">({reviewCount})</span>
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{clinic.address}</span>
          </div>

          {minPrice && (
            <div className="text-sm font-medium text-primary">
              {formatPrice(minPrice)}부터
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

