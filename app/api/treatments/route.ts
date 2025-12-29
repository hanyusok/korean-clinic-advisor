import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clinicId = searchParams.get('clinicId');
    const category = searchParams.get('category');

    const where: any = {};

    if (category) {
      where.category = category;
    }

    const treatments = await prisma.treatment.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    // 클리닉 ID가 제공된 경우, 해당 클리닉에서 제공하는 시술만 필터링
    if (clinicId) {
      const clinicTreatments = await prisma.clinicTreatment.findMany({
        where: {
          clinicId,
          isActive: true,
        },
        include: {
          treatment: true,
        },
      });

      const clinicTreatmentIds = clinicTreatments.map((ct) => ct.treatmentId);
      return NextResponse.json({
        data: treatments.filter((t) => clinicTreatmentIds.includes(t.id)),
      });
    }

    return NextResponse.json({ data: treatments });
  } catch (error) {
    console.error('Error fetching treatments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch treatments' },
      { status: 500 }
    );
  }
}

