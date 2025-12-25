import { ClinicDetail } from '@/components/clinic/ClinicDetail';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface ClinicDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ClinicDetailPage({ params }: ClinicDetailPageProps) {
  const clinic = await prisma.clinic.findUnique({
    where: { id: params.id },
    include: {
      images: true,
      clinicTreatments: {
        include: {
          treatment: true,
        },
      },
      reviews: {
        include: {
          user: true,
          treatment: true,
          images: true,
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
      promotions: {
        where: {
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  });

  if (!clinic) {
    notFound();
  }

  // Type assertion for clinic with relations
  return <ClinicDetail clinic={clinic as any} />;
}

