import { ReviewForm } from '@/components/review/ReviewForm';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface ReviewNewPageProps {
  searchParams: {
    clinicId?: string;
  };
}

export default async function ReviewNewPage({ searchParams }: ReviewNewPageProps) {
  const session = await getServerSession(authOptions);
  
  // 로그인 확인
  if (!session?.user) {
    redirect('/login?callbackUrl=/reviews/new' + (searchParams.clinicId ? `&clinicId=${searchParams.clinicId}` : ''));
  }

  let clinic = null;
  let treatments: Array<{ id: string; name: string }> = [];

  // 클리닉 ID가 제공된 경우 클리닉 정보 가져오기
  if (searchParams.clinicId) {
    clinic = await prisma.clinic.findUnique({
      where: { id: searchParams.clinicId },
      include: {
        clinicTreatments: {
          include: {
            treatment: true,
          },
          where: {
            isActive: true,
          },
        },
      },
    });

    if (clinic) {
      treatments = clinic.clinicTreatments.map((ct) => ({
        id: ct.treatment.id,
        name: ct.treatment.name,
      }));
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <ReviewForm
          clinicId={clinic?.id}
          clinicName={clinic?.name}
          treatments={treatments}
        />
      </div>
    </div>
  );
}

