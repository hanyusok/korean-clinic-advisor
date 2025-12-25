import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clinic = await prisma.clinic.findUnique({
      where: { id: params.id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        clinicTreatments: {
          include: {
            treatment: true,
          },
          where: {
            isActive: true,
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
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: clinic });
  } catch (error) {
    console.error('Error fetching clinic:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clinic' },
      { status: 500 }
    );
  }
}

