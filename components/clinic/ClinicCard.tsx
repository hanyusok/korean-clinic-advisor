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
  const mainImage = clinic.images?.[0]?.url || '/images/placeholder-clinic.jpg';
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
        <div className="relative h-48 w-full">
          <Image
            src={mainImage}
            alt={clinic.name}
            fill
            className="object-cover"
          />
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

